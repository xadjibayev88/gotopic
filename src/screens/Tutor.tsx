import { useEffect, useMemo, useRef, useState } from 'react';
import { ViviPeek } from '../components/ViviPeek';
import { Ic } from '../components/Icons';
import { applyChatTurn } from '../engine/game';
import { playSfx, speakQueue, stopSpeaking, ttsSupported } from '../engine/audio';
import { askTutor, updateMemory, frenchParts, learnerContext, parseRich, SCENARIOS, TutorError, tutorFailureMessage, type ChatMessage, type Scenario } from '../engine/tutor';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import { useAccount } from '../state/account';
import { FrChip } from '../components/FrChip';
import { VoiceHub } from './voice/VoiceHub';
import { loadPrefs } from '../engine/voice/prefs';
import { answerLang } from '../engine/voice/markers';
import { KruaLive } from '../components/KruaLive';
import { CloudStt, cloudSttSupported } from '../engine/voice/stt';
import { MemoryReviewDialog, type MemoryReviewTurn } from '../components/MemoryReviewDialog';
import { NEUTRAL_VIVI_CUE, validateViviCue, type ViviCue } from '../shared/vivi-cue';

const CHAT_KEY = 'salut.chat.v1';
type Chats = Partial<Record<Scenario, ChatMessage[]>>;

function loadChats(): Chats {
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) ?? '{}') as Chats;
  } catch {
    return {};
  }
}
function saveChats(c: Chats) {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(c));
  } catch {
    /* xotira to'la */
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};
const SpeechRec: (new () => SR) | undefined =
  typeof window !== 'undefined' ? ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => SR) | undefined : undefined;

export function RichText({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const { state } = useStore();
  const segs = useMemo(() => parseRich(text, streaming), [text, streaming]);
  // Tarjima uchun kontekst: shu xabarning o'zbekcha qismi (qisqa).
  const ctx = useMemo(() => segs.filter((x) => x.kind !== 'fr').map((x) => x.text).join(' ').slice(0, 300), [segs]);
  return (
    <>
      {segs.map((s, i) =>
        s.kind === 'fr' ? (
          <FrChip key={i} text={s.text} context={ctx} rate={state.settings.ttsRate} />
        ) : s.kind === 'bold' ? (
          <b key={i}>{s.text}</b>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}

function TextChat() {
  const { state, update } = useStore();
  const [scenario, setScenario] = useState<Scenario>('free');
  const [chats, setChats] = useState<Chats>(loadChats);
  const [input, setInput] = useState('');
  const [streamText, setStreamText] = useState<string | null>(null);
  const [streamCue, setStreamCue] = useState<ViviCue | undefined>();
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [memoryReview, setMemoryReview] = useState<{ memory: string; turns: MemoryReviewTurn[]; name: string } | null>(null);
  const [memoryUpdating, setMemoryUpdating] = useState(false);
  const [micLang, setMicLang] = useState<'uz-UZ' | 'fr-FR'>('uz-UZ');
  // AI aniqlash (Gemini): o'zbekcha, fransuzcha va aralash gapni tilni tanlamasdan to'g'ri yozadi.
  const cloudMic = useMemo(() => cloudSttSupported() && !!navigator.mediaDevices?.getUserMedia, []);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const cloudRef = useRef<{ stt: CloudStt; stream: MediaStream } | null>(null);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recRef = useRef<SR | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const info = SCENARIOS.find((s) => s.id === scenario)!;
  const greeting: ChatMessage = useMemo(() => ({ id: `greet-${scenario}`, role: 'tutor', text: info.greet(state.name), ts: 0 }), [scenario, info, state.name]);
  const messages = chats[scenario] ?? [];
  const all = [greeting, ...messages];

  useEffect(() => saveChats(chats), [chats]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [all.length, streamText]);
  useEffect(
    () => () => {
      abortRef.current?.abort();
      recRef.current?.stop();
      stopSpeaking();
    },
    [],
  );

  const setMessages = (fn: (m: ChatMessage[]) => ChatMessage[]) => setChats((c) => ({ ...c, [scenario]: fn(c[scenario] ?? []).slice(-40) }));

  async function send(textRaw: string) {
    const text = textRaw.trim();
    if (!text || busy || memoryReview) return;
    recRef.current?.stop();
    stopSpeaking();
    const userMsg: ChatMessage = { id: uid(), role: 'user', text, ts: Date.now() };
    const history = [greeting, ...messages].filter((m) => !m.error).slice(-12).map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);
    setStreamText('');
    setStreamCue(undefined);
    playSfx('tap', state.settings.sound);
    const ac = new AbortController();
    abortRef.current = ac;
    let acc = '';
    let replyCue: ViviCue | undefined;
    try {
      const vp = loadPrefs();
      await askTutor({ scenario, message: text, history, context: learnerContext(state), character: vp.character, lang: vp.lang, explicit: vp.explicit && vp.adultConfirmed }, (d) => {
        acc += d;
        setStreamText(acc);
      }, ac.signal, (cue) => {
        replyCue = cue;
        setStreamCue(cue);
      });
      const replyText = acc.trim();
      if (!replyText) throw new TutorError('empty_response', 'Tutor javobi bo‘sh. Qayta urinib ko‘ring.');
      const reply: ChatMessage = { id: uid(), role: 'tutor', text: replyText, cue: replyCue, ts: Date.now() };
      setMessages((m) => [...m, reply]);
      // Har 6 ta xabardan keyin Vivi xotirasini yangilaymiz (fon rejimida).
      const userCount = messages.filter((m) => m.role === 'user').length + 1;
      if (userCount % 6 === 0) {
        const recent = [...messages, userMsg, reply].filter((m) => !m.error).slice(-20).map((m) => ({ role: m.role, text: m.text }));
        setMemoryReview({ memory: state.memory ?? '', turns: recent, name: state.name });
      }
      // Mikrofon tili avtomatik: Vivi fransuzcha javob kutsa — FR, aks holda UZ.
      const want = answerLang(reply.text);
      if (want) setMicLang(want === 'fr' ? 'fr-FR' : 'uz-UZ');
      if (state.settings.tutorVoice) speakQueue(frenchParts(reply.text), state.settings.ttsRate);
      const r = applyChatTurn(state);
      update(() => r.state);
      if (r.xp) {
        setXpToast(r.xp);
        setTimeout(() => setXpToast(null), 1400);
      }
    } catch (e) {
      const failure = tutorFailureMessage(e);
      if (failure) setMessages((m) => [...m, { ...failure, id: uid(), ts: Date.now() }]);
    } finally {
      setBusy(false);
      setStreamText(null);
      setStreamCue(undefined);
      abortRef.current = null;
    }
  }

  async function confirmMemoryUpdate() {
    const review = memoryReview;
    if (!review || memoryUpdating) return;
    setMemoryUpdating(true);
    try {
      const memory = await updateMemory(review.memory, review.turns, review.name, true);
      if (memory) update((s) => ({ ...s, memory }));
    } finally {
      setMemoryReview(null);
      setMemoryUpdating(false);
    }
  }

  async function toggleCloudMic() {
    if (cloudRef.current) {
      // Ikkinchi bosish — yozuv tugaydi va matnga aylantirishga yuboriladi.
      setListening(false);
      setTranscribing(true);
      cloudRef.current.stt.stop();
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch {
      setMicError("Mikrofonga ruxsat berilmadi — brauzer sozlamalaridan ruxsat bering.");
      return;
    }
    const stt = new CloudStt(() => stream, 60_000);
    const lastTutor = [...[greeting, ...messages]].reverse().find((m) => m.role === 'tutor' && !m.error);
    stt.context = () => lastTutor?.text ?? '';
    const base = input ? `${input.trim()} ` : '';
    const done = () => {
      stream.getTracks().forEach((t) => t.stop());
      cloudRef.current = null;
      setListening(false);
      setTranscribing(false);
    };
    stt.onFinal = (result) => {
      done();
      const t = result.text;
      if (t.trim()) {
        setInput(base + t.trim());
        inputRef.current?.focus();
      } else setMicError("Ovoz eshitilmadi — mikrofonga yaqinroq, aniqroq gapiring.");
    };
    stt.onError = (e, m) => {
      if (e === 'too-long') return;
      done();
      setMicError(m ?? "Ovozni matnga aylantirib bo'lmadi — qayta urinib ko'ring.");
    };
    cloudRef.current = { stt, stream };
    stopSpeaking();
    stt.start(micLang);
    setMicError(null);
    setListening(true);
  }

  useEffect(() => () => {
    cloudRef.current?.stt.abort();
    cloudRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  function toggleMic() {
    if (cloudMic) return void toggleCloudMic();
    if (!SpeechRec) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SpeechRec();
    rec.lang = micLang;
    rec.interimResults = true;
    rec.continuous = false;
    const base = input ? `${input.trim()} ` : '';
    rec.onresult = (e) => {
      let t = '';
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(base + t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    stopSpeaking();
    rec.start();
    setListening(true);
  }

  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    setMessages((m) => {
      const idx = m.lastIndexOf(lastUser);
      return m.slice(0, idx);
    });
    setTimeout(() => send(lastUser.text), 0);
  };

  // Faqat alohida kelgan, validatsiya qilingan semantik cue ko'rsatiladi; matn belgilaridan harakat olinmaydi.
  const lastTutor = [...messages].reverse().find((m) => m.role === 'tutor' && !m.error);
  const live = useMemo<ViviCue>(() => busy
    ? { state: 'thinking', face: 'curious', ornament: 'thought_dots' }
    : validateViviCue(streamCue ?? lastTutor?.cue ?? NEUTRAL_VIVI_CUE),
  [busy, lastTutor?.cue, streamCue]);

  const showSuggestions = !busy && messages.length < 2;
  const lastIsError = messages[messages.length - 1]?.error;

  return (
    <div className="tutor-chat">
      <div className="tutor-head">
        <div className="tutor-live">
          <KruaLive cue={live} size={58} />
        </div>
        <div className="tutor-title">
          <b>Vivi ustoz</b>
          <small className={busy ? 'typing-label' : ''}>{busy ? 'yozmoqda…' : 'AI · fransuz tili ustozi'}</small>
        </div>
        <button
          type="button"
          className={`icon-btn ${state.settings.tutorVoice ? 'on' : ''}`}
          title="Fransuzcha qismlarni avtomatik o'qish"
          onClick={() => update((s) => ({ ...s, settings: { ...s.settings, tutorVoice: !s.settings.tutorVoice } }))}
        >
          <Ic name={state.settings.tutorVoice ? 'speaker' : 'mute'} size={20} />
        </button>
        <button type="button" className="icon-btn" title="Yangi suhbat" disabled={busy || !messages.length} onClick={() => setMessages(() => [])}>
          🗑️
        </button>
      </div>

      <div className="scenario-row">
        {SCENARIOS.map((s) => (
          <button key={s.id} type="button" className={`scenario ${s.id === scenario ? 'on' : ''}`} disabled={busy} onClick={() => setScenario(s.id)}>
            <span>{s.icon}</span> {s.title}
          </button>
        ))}
      </div>

      <div className="chat">
        {all.map((m) => (
          <div key={m.id} className={`msg msg-${m.role} ${m.error ? "error" : ""}`}>
            {m.role === 'tutor' && <div className="msg-avatar"><Mascot size={30} mood="happy" /></div>}
            <div className="msg-bubble">
              {m.role === 'tutor' ? <RichText text={m.text} /> : m.text}
              {m.role === 'tutor' && !m.error && frenchParts(m.text).length > 0 && ttsSupported() && (
                <button type="button" className="msg-play" onClick={() => speakQueue(frenchParts(m.text), state.settings.ttsRate)} title="Fransuzcha qismlarni tinglash">
                  <Ic name="play" size={12} /> fransuzcha
                </button>
              )}
              {m.upsell && (
                <button type="button" className="btn btn-primary msg-upsell" onClick={() => (location.hash = '#/shop')}>
                  <Ic name="crown" size={16} /> Super — cheksiz suhbat
                </button>
              )}
              {m.error && !m.upsell && m === messages[messages.length - 1] && (
                <button type="button" className="msg-play" onClick={retry}>
                  ↻ Qayta urinish
                </button>
              )}
            </div>
          </div>
        ))}
        {streamText !== null && (
          <div className="msg msg-tutor">
            <div className="msg-avatar"><Mascot size={30} mood="happy" /></div>
            <div className="msg-bubble">
              {streamText ? <RichText text={streamText} streaming /> : <span className="dots"><i /><i /><i /></span>}
            </div>
          </div>
        )}
        {showSuggestions && !lastIsError && (
          <div className="suggestions">
            {info.suggestions.map((s) => (
              <button key={s} type="button" className="suggestion" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="composer has-peek"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        {(cloudMic || SpeechRec) && (
          <div className="mic-group">
            <button
              type="button"
              className={`mic ${listening ? 'live' : ''} ${transcribing ? 'busy' : ''}`}
              onClick={toggleMic}
              title={listening ? "To'xtatish va yuborish" : 'Ovoz bilan yozish (o\'zbekcha yoki fransuzcha)'}
              disabled={busy || transcribing}
            >
              {transcribing ? '…' : listening ? '■' : <Ic name="mic" size={22} />}
            </button>
            {!cloudMic && (
            <button type="button" className="mic-lang" onClick={() => setMicLang(micLang === 'uz-UZ' ? 'fr-FR' : 'uz-UZ')} title="Mikrofon tili (Vivi javobiga qarab o'zi almashadi)">
              {micLang === 'uz-UZ' ? 'UZ' : 'FR'}
              <i className="auto-badge">avto</i>
            </button>
            )}
          </div>
        )}
        <ViviPeek mode={busy ? 'thinking' : input ? 'typing' : 'idle'} className="composer-peek" />
        <textarea
          ref={inputRef}
          value={input}
          rows={1}
          maxLength={800}
          placeholder={transcribing ? 'Matnga aylantirilmoqda…' : listening ? "Gapiring… tugatgach ■ ni bosing" : "Xabar yozing (o'zbekcha yoki fransuzcha)"}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
        />
        {busy ? (
          <button type="button" className="send stop" onClick={() => abortRef.current?.abort()} title="To'xtatish">
            ■
          </button>
        ) : (
          <button type="submit" className="send" disabled={!input.trim()} title="Yuborish">
            ➤
          </button>
        )}
      </form>
      {xpToast && <div className="xp-toast">+{xpToast} XP</div>}
      {micError && (
        <p className="mic-error" role="alert" onClick={() => setMicError(null)}>
          {micError}
        </p>
      )}
      <p className="tutor-note">Vivi — sun'iy intellekt. Ba'zan xato qilishi mumkin; muhim narsalarni darslar bilan tekshiring.</p>
      {memoryReview && (
        <MemoryReviewDialog
          turns={memoryReview.turns}
          busy={memoryUpdating}
          onConfirm={() => void confirmMemoryUpdate()}
          onCancel={() => setMemoryReview(null)}
        />
      )}
    </div>
  );
}


const MODE_KEY = 'salut.tutor.mode';

/** Vivi AI faqat Super uchun: obunasiz kirilganda chiroyli taklif ekrani. */
function ViviPaywall() {
  const { me } = useAccount();
  const plans = me.billing.plans;
  const cheapest = plans.length ? plans.reduce((a, b) => (b.uzs < a.uzs ? b : a)) : null;
  const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/[\s,]/g, ' ');
  const go = (tab: string) => {
    location.hash = `#/${tab}`;
  };
  return (
    <div className="vpay">
      <div className="vpay-preview" aria-hidden="true">
        <div className="vpay-msg in">Bonjour ! Comment tu t'appelles ?</div>
        <div className="vpay-msg out">Je m'appelle Ali 😊</div>
        <div className="vpay-msg in">Enchantée, Ali ! Tu viens d'où ?</div>
        <div className="vpay-wave">
          {Array.from({ length: 18 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 6) * 0.12}s` }} />)}
        </div>
      </div>
      <div className="vpay-card">
        <div className="vpay-mascot">
          <Mascot mood="cheer" size={92} />
          <span className="vpay-badge">SUPER</span>
        </div>
        <h2>Vivi AI — Super a'zolari uchun</h2>
        <p className="muted">Vivi bilan jonli ovozda va yozishib fransuzcha gaplashish faqat Super obunada. Darslar esa bepul qoladi.</p>
        <ul className="vpay-perks">
          <li><span><Ic name="bolt" size={20} /></span>Gemini Live — real vaqtda ovozli suhbat</li>
          <li><span><Ic name="chat" size={20} /></span>Cheksiz matnli suhbat va xatolar tahlili</li>
          <li><span><Ic name="brain" size={20} /></span>Vivi sizni eslab qoladi va darajangizga moslashadi</li>
          <li><span><Ic name="globe" size={20} /></span>Tushuntirish o'z tilingizda</li>
        </ul>
        <button type="button" className="btn btn-primary btn-lg btn-beam vpay-cta" onClick={() => go('shop')}>
          Super olish{cheapest ? ` · ${fmt(cheapest.uzs)} so'mdan` : ''}
        </button>
        <button type="button" className="btn btn-text" onClick={() => go('learn')}>
          Hozircha darslarni davom ettiraman
        </button>
      </div>
    </div>
  );
}

export function Tutor() {
  const { premium, me } = useAccount();
  const [mode, setMode] = useState<'voice' | 'text'>(() => {
    try {
      return localStorage.getItem(MODE_KEY) === 'text' ? 'text' : 'voice';
    } catch {
      return 'voice';
    }
  });
  const pick = (m: 'voice' | 'text') => {
    setMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* e'tiborsiz */
    }
  };
  if (!premium && !me.admin) return <ViviPaywall />;
  return (
    <div className="tutor-wrap">
      <div className="seg tutor-mode-toggle" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'voice'} className={mode === 'voice' ? 'on' : ''} onClick={() => pick('voice')}>
          <Ic name="mic" size={16} /> Ovozli
        </button>
        <button type="button" role="tab" aria-selected={mode === 'text'} className={mode === 'text' ? 'on' : ''} onClick={() => pick('text')}>
          <Ic name="chat" size={16} /> Matn
        </button>
      </div>
      {mode === 'voice' ? <VoiceHub /> : <TextChat />}
    </div>
  );
}
