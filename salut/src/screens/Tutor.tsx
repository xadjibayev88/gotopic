import { useEffect, useMemo, useRef, useState } from 'react';
import { applyChatTurn } from '../engine/game';
import { playSfx, speak, speakQueue, stopSpeaking, ttsSupported } from '../engine/audio';
import { askTutor, frenchParts, learnerContext, parseRich, SCENARIOS, TutorError, type ChatMessage, type Scenario } from '../engine/tutor';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import { VoiceHub } from './voice/VoiceHub';
import { loadPrefs } from '../engine/voice/prefs';

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
  return (
    <>
      {segs.map((s, i) =>
        s.kind === 'fr' ? (
          <button key={i} type="button" className="fr-chip" onClick={() => speak(s.text, state.settings.ttsRate)} title="Tinglash">
            {s.text}
            {ttsSupported() && <span className="fr-chip-icon">🔊</span>}
          </button>
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
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [micLang, setMicLang] = useState<'uz-UZ' | 'fr-FR'>('uz-UZ');
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
    if (!text || busy) return;
    recRef.current?.stop();
    stopSpeaking();
    const userMsg: ChatMessage = { id: uid(), role: 'user', text, ts: Date.now() };
    const history = [greeting, ...messages].filter((m) => !m.error).slice(-12).map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setBusy(true);
    setStreamText('');
    playSfx('tap', state.settings.sound);
    const ac = new AbortController();
    abortRef.current = ac;
    let acc = '';
    try {
      const vp = loadPrefs();
      await askTutor({ scenario, message: text, history, context: learnerContext(state), character: vp.character, lang: vp.lang }, (d) => {
        acc += d;
        setStreamText(acc);
      }, ac.signal);
      const reply: ChatMessage = { id: uid(), role: 'tutor', text: acc.trim() || '...', ts: Date.now() };
      setMessages((m) => [...m, reply]);
      if (state.settings.tutorVoice) speakQueue(frenchParts(reply.text), state.settings.ttsRate);
      const r = applyChatTurn(state);
      update(() => r.state);
      if (r.xp) {
        setXpToast(r.xp);
        setTimeout(() => setXpToast(null), 1400);
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        if (acc.trim()) setMessages((m) => [...m, { id: uid(), role: 'tutor', text: acc.trim(), ts: Date.now() }]);
      } else {
        const msg = e instanceof TutorError ? e.message : 'Kutilmagan xato yuz berdi.';
        setMessages((m) => [...m, ...(acc.trim() ? [{ id: uid(), role: 'tutor' as const, text: acc.trim(), ts: Date.now() }] : []), { id: uid(), role: 'tutor', text: msg, error: true, ts: Date.now() }]);
      }
    } finally {
      setBusy(false);
      setStreamText(null);
      abortRef.current = null;
    }
  }

  function toggleMic() {
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

  const showSuggestions = !busy && messages.length < 2;
  const lastIsError = messages[messages.length - 1]?.error;

  return (
    <div className="tutor">
      <div className="tutor-head">
        <Mascot mood={busy ? 'think' : 'happy'} size={52} />
        <div className="tutor-title">
          <b>Krua ustoz</b>
          <small className={busy ? 'typing-label' : ''}>{busy ? 'yozmoqda…' : 'AI · fransuz tili ustozi'}</small>
        </div>
        <button
          type="button"
          className={`icon-btn ${state.settings.tutorVoice ? 'on' : ''}`}
          title="Fransuzcha qismlarni avtomatik o'qish"
          onClick={() => update((s) => ({ ...s, settings: { ...s.settings, tutorVoice: !s.settings.tutorVoice } }))}
        >
          {state.settings.tutorVoice ? '🔊' : '🔇'}
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
            {m.role === 'tutor' && <div className="msg-avatar">🥐</div>}
            <div className="msg-bubble">
              {m.role === 'tutor' ? <RichText text={m.text} /> : m.text}
              {m.role === 'tutor' && !m.error && frenchParts(m.text).length > 0 && ttsSupported() && (
                <button type="button" className="msg-play" onClick={() => speakQueue(frenchParts(m.text), state.settings.ttsRate)} title="Fransuzcha qismlarni tinglash">
                  ▶︎ fransuzcha
                </button>
              )}
              {m.error && m === messages[messages.length - 1] && (
                <button type="button" className="msg-play" onClick={retry}>
                  ↻ Qayta urinish
                </button>
              )}
            </div>
          </div>
        ))}
        {streamText !== null && (
          <div className="msg msg-tutor">
            <div className="msg-avatar">🥐</div>
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
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        {SpeechRec && (
          <div className="mic-group">
            <button type="button" className={`mic ${listening ? 'live' : ''}`} onClick={toggleMic} title="Ovoz bilan yozish" disabled={busy}>
              🎤
            </button>
            <button type="button" className="mic-lang" onClick={() => setMicLang(micLang === 'uz-UZ' ? 'fr-FR' : 'uz-UZ')} title="Mikrofon tili">
              {micLang === 'uz-UZ' ? 'UZ' : 'FR'}
            </button>
          </div>
        )}
        <textarea
          ref={inputRef}
          value={input}
          rows={1}
          maxLength={800}
          placeholder={listening ? 'Gapiring…' : "Xabar yozing (o'zbekcha yoki fransuzcha)"}
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
      {xpToast && <div className="xp-toast">+{xpToast} ball</div>}
      <p className="tutor-note">Krua — sun'iy intellekt. Ba'zan xato qilishi mumkin; muhim narsalarni darslar bilan tekshiring.</p>
    </div>
  );
}


const MODE_KEY = 'salut.tutor.mode';

export function Tutor() {
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
  return (
    <div className="tutor-wrap">
      <div className="seg tutor-mode-toggle" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'voice'} className={mode === 'voice' ? 'on' : ''} onClick={() => pick('voice')}>
          🎙️ Ovozli
        </button>
        <button type="button" role="tab" aria-selected={mode === 'text'} className={mode === 'text' ? 'on' : ''} onClick={() => pick('text')}>
          💬 Matn
        </button>
      </div>
      {mode === 'voice' ? <VoiceHub /> : <TextChat />}
    </div>
  );
}
