import { useEffect, useMemo, useRef, useState } from 'react';
import { CHARACTERS } from '../../data/characters';
import { Ic } from '../../components/Icons';
import { VoiceCall as Controller, type CallOptions, type Snapshot } from '../../engine/voice/call';
import { displayText } from '../../engine/voice/markers';
import type { SttReviewReason } from '../../engine/voice/stt';
import { KruaLive, type LiveState } from '../../components/KruaLive';
import { ImagePop } from '../../components/ImagePop';
import { RevengeHud, RevengeOverlay, useRevenge } from '../../components/RevengeGame';
import { RichText } from '../Tutor';
import { setImmersive } from '../../engine/ads';

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const MIC_ERRORS: Record<string, string> = {
  denied: "Mikrofonga ruxsat berilmadi. Brauzer sozlamalarida shu sayt uchun mikrofonni yoqing va qayta urinib ko'ring.",
  blocked: 'Mikrofonga ruxsat bloklangan. Brauzer sozlamalarida ruxsat bering va sahifani yangilang.',
  notfound: "Mikrofon topilmadi. Mikrofonni ulang va qayta urinib ko'ring.",
  busy: "Mikrofon boshqa ilova tomonidan band. Qo'ng'iroq yoki yozuvni yoping va qayta urinib ko'ring.",
  unsupported: "Bu brauzer mikrofon yoki audio bilan ishlashni qo'llamaydi. Chrome, Edge yoki Safari'ning yangi versiyasini sinab ko'ring.",
  ai: 'AI ustoz serveri sozlanmagan — administratorga yozing. Darslar ishlayveradi.',
  stt: 'Cloud nutqni aniqlash hozir mavjud emas. Matnli ustozdan foydalaning yoki keyinroq qayta urinib ko‘ring.',
};

export const VOICE_CALL_NOTICES: Record<string, string> = {
  weak: 'Aloqa zaif — Vivi biroz kechikib javob berishi mumkin.',
  reconnecting: "Aloqa uzildi — qayta ulanmoqdamiz. Vivi to'xtagan joyidan davom etadi.",
  turnFailed: 'Vivi eshitmadi — yana bir bor ayting.',
  nudgeSilence: "Ovozingiz eshitilmayaptimi? «Bosib gapirish» rejimini sinab ko'ring.",
  nudgeNoise: "Atrofingiz shovqinlimi? «Bosib gapirish» rejimini sinab ko'ring.",
  tooLong: "Replika bir daqiqagacha bo'lsin — qisqaroq gapiring.",
  ttsQuota: 'Bugungi ovoz limiti tugadi — Vivi javobi matn ko‘rinishida qoladi.',
  sttFailed: "Nutqni aniqlab bo'lmadi — qayta urinib ko'ring.",
  upstream: "Vivi vaqtincha javob bera olmadi. Birozdan so'ng qayta urinib ko'ring.",
  rateLimited: "Juda ko'p so'rov — bir daqiqadan keyin urinib ko'ring.",
};

const STT_REVIEW_TEXT: Record<SttReviewReason, string> = {
  confidence_missing: 'Nutq aniqligi haqida ishonch ko‘rsatkichi kelmadi — matnni o‘zingiz tekshiring.',
  alternatives_conflict: 'Nutqni aniqlashda boshqa matn varianti ham bor — matnni solishtiring.',
  language_unknown: 'Gapirilgan til aniq aniqlanmadi.',
  code_switch: 'Til metadata’sida bir nechta kod ko‘rsatildi — aralash nutq bo‘lishi mumkin.',
  language_mismatch: 'Aniqlangan til tanlangan nutq tilidan farq qiladi.',
  possible_noise: 'Ovozda shovqin bo‘lishi mumkin — transcriptni tekshiring.',
  target_phrase_mismatch: 'Matn kutilgan iboradan farq qilishi mumkin; to‘g‘ri bo‘lsa, o‘zgartirmang.',
  empty_transcript: 'Matn aniqlanmadi — qayta gapirib ko‘ring.',
};

export function VoiceCallScreen({
  options,
  subtitles,
  fullscreen,
  onToggleSubtitles,
  onSwitchMode,
  onEnded,
  onUserTurn,
  game = false,
}: {
  /** «Qasos rejimi» mini-o'yini. */
  game?: boolean;
  options: CallOptions;
  subtitles: boolean;
  fullscreen: boolean;
  onToggleSubtitles: () => void;
  onSwitchMode: () => void;
  onEnded: (c: Controller) => void;
  onUserTurn: () => void;
}) {
  const ctrl = useMemo(() => new Controller(options), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [s, setS] = useState<Snapshot>(ctrl.snap);
  const [pressed, setPressed] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [confirmSwitch, setConfirmSwitch] = useState(false);
  const voices = options.config.voices;
  const [voiceIdx, setVoiceIdx] = useState(() => Math.max(0, voices.findIndex((v) => v.id === options.voiceId)));
  const rootRef = useRef<HTMLDivElement>(null);
  const endedRef = useRef(false);
  const ptt = options.inputMode === 'ptt';
  const ch = CHARACTERS.find((c) => c.id === options.character)!;
  const g = useRevenge(game, true);

  useEffect(() => {
    setImmersive(true);
    ctrl.onUpdate = setS;
    ctrl.onUserTurn = onUserTurn;
    void ctrl.start();
    if (fullscreen) void rootRef.current?.requestFullscreen?.().catch(() => undefined);
    return () => {
      ctrl.dispose();
      setImmersive(false);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    };
  }, [ctrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (s.phase === 'ended' && !s.error && !endedRef.current) {
      endedRef.current = true;
      onEnded(ctrl);
    }
  }, [s.phase, s.error, ctrl, onEnded]);

  // Space — bosib gapirish (klaviaturada)
  useEffect(() => {
    if (!ptt) return;
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      e.preventDefault();
      setPressed(true);
      ctrl.pressStart();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      setPressed(false);
      ctrl.pressEnd();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [ctrl, ptt]);

  const liveState: LiveState = s.phase === 'user' ? 'listening' : s.phase === 'thinking' ? 'thinking' : s.phase === 'speaking' ? 'speaking' : 'idle';
  const liveCue = { ...s.cue, state: liveState };
  const label =
    s.phase === 'connecting'
      ? 'Ulanmoqda…'
      : s.phase === 'user'
        ? s.sttKind === 'cloud'
          ? 'Eshitmoqda… (yozib olinmoqda)'
          : 'Eshitmoqda…'
        : s.phase === 'review'
          ? 'Yuborishdan oldin tekshiring'
        : s.phase === 'thinking'
          ? 'Vivi o\'ylamoqda…'
          : s.phase === 'speaking'
            ? 'Vivi gapirmoqda…'
            : 'Sizning navbatingiz';
  const hint = game
    ? "Urish uchun Vivini bosing yoki F · Q — qurollar · gapirish uchun 🎤 yoki Space"
    : s.phase === 'speaking'
      ? ptt
        ? "Gapini bo'lish uchun Vivini bosib turing"
        : "Gapira boshlang — Vivi jim bo'lib tinglaydi"
        : s.phase === 'ready'
          ? ptt
            ? 'Gapirish uchun Vivini yoki Space\'ni bosib turing'
            : 'Shunchaki gapiring — Vivi tinglayapti'
          : s.phase === 'review'
            ? 'Matnni tekshiring, tasdiqlang yoki qayta gapiring'
          : s.phase === 'user' && ptt
          ? "Gapirib bo'lgach, qo'yib yuboring"
          : '';

  const lastTutor = [...s.turns].reverse().find((t) => t.role === 'tutor');
  const lastUser = [...s.turns].reverse().find((t) => t.role === 'user');
  const tutorLine = s.live || (lastTutor ? displayText(lastTutor.text) : '');
  const userLine = s.phase === 'user' ? s.partial : lastUser?.text ?? '';

  if (s.error) {
    return (
      <div className="call call-error">
        <KruaLive cue={{ state: 'idle', face: 'neutral' }} size={180} />
        <h2>Suhbatni boshlab bo'lmadi</h2>
        <p className="muted">{MIC_ERRORS[s.error] ?? MIC_ERRORS.unsupported}</p>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => onEnded(ctrl)}>
          Orqaga
        </button>
      </div>
    );
  }

  return (
    <div className={`call phase-${s.phase} ${game ? 'game-mode' : ''}`} ref={rootRef} style={{ ['--ch' as string]: ch.color }}>
      <header className="call-top">
        <button type="button" className="icon-btn" aria-label="Tugatish" onClick={() => ctrl.end('user')}>
          ✕
        </button>
        <div className="call-meta">
          <b>
            {ch.icon} {ch.name}
          </b>
          <span className={s.tired ? 'tired' : ''} aria-label="Suhbat vaqti">
            {fmt(s.elapsedMs)} / {fmt(s.limitMs)}
          </span>
        </div>
        <button type="button" className={`icon-btn ${subtitles ? 'on' : ''}`} aria-label={subtitles ? 'Subtitrlarni yashirish' : 'Subtitrlar'} onClick={onToggleSubtitles}>
          CC
        </button>
        <button type="button" className="icon-btn" aria-label="Matn" onClick={() => setShowTranscript(true)}>
          ☰
        </button>
      </header>

      {s.tired && <div className="call-tired">😮‍💨 Vivi charchayapti… {fmt(s.limitMs - s.elapsedMs)} qoldi</div>}

      {game && <RevengeHud g={g} />}

      <main className={`call-stage ${g.shake % 2 ? 'shake-a' : g.shake ? 'shake-b' : ''}`}>
        {s.image && <ImagePop key={s.image.key} query={s.image.q} />}
        <button
          type="button"
          className="call-avatar"
          aria-label={game ? 'Urish uchun Vivini bosing' : ptt ? 'Gapirish uchun bosib turing' : 'Vivi'}
          onClick={(e) => {
            if (!game) return;
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
            g.fire((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
          }}
          onPointerDown={(e) => {
            if (!ptt || game) return;
            try {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              } catch {
                /* sintetik hodisa */
              }
            setPressed(true);
            ctrl.pressStart();
          }}
          onPointerUp={() => {
            if (!ptt || game) return;
            setPressed(false);
            ctrl.pressEnd();
          }}
          onPointerCancel={() => {
            if (!ptt || game) return;
            setPressed(false);
            ctrl.pressEnd();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <KruaLive cue={liveCue} level={s.level} pressed={pressed} size={s.phase === 'review' ? 120 : Math.min(300, Math.round(window.innerWidth * 0.62))} />
        </button>
        {game && <RevengeOverlay g={g} />}
        <div className="call-label" aria-live="polite">
          <b>{label}</b>
          {hint && <small>{hint}</small>}
        </div>

        {s.phase === 'review' && (
          <div className="call-review" role="group" aria-label="Yuborishdan oldin matnni tekshirish">
            <label htmlFor="voice-draft">Siz aytgan matn</label>
            <textarea id="voice-draft" value={s.draft} onChange={(e) => ctrl.setDraft(e.target.value)} rows={4} autoFocus />
            {!!s.sttResult?.reviewReasons.length && (
              <ul className="call-review-reasons" aria-label="Matnni tekshirish sabablari">
                {s.sttResult.reviewReasons.map((reason) => <li key={reason}>{STT_REVIEW_TEXT[reason]}</li>)}
              </ul>
            )}
            <div className="call-review-actions">
              <button type="button" className="btn btn-primary" disabled={!s.draft.trim()} onClick={() => ctrl.submitDraft()}>
                {s.retryAvailable ? 'Qayta yuborish' : 'Tasdiqlash va yuborish'}
              </button>
              <button type="button" className="btn btn-text" onClick={() => ctrl.discardDraft()}>
                Qayta gapirish
              </button>
              <button type="button" className="btn btn-text" onClick={() => ctrl.cancelDraft()}>
                Bekor qilish
              </button>
            </div>
          </div>
        )}

        {subtitles && (
          <div className="call-subs">
            {tutorLine && (
              <p className="sub-tutor">
                <RichText text={s.live ? s.live : displayText(lastTutor?.text ?? '')} streaming={!!s.live} />
              </p>
            )}
            {userLine && <p className="sub-user">{userLine}</p>}
          </div>
        )}
      </main>

      {s.notice && <div className="call-notice">{s.noticeText || VOICE_CALL_NOTICES[s.notice]}</div>}

      <footer className="call-bottom">
        {game && ptt && (
          <button
            type="button"
            className={`rv-talk ${pressed ? 'on' : ''}`}
            onPointerDown={(e) => {
              try {
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              } catch {
                /* sintetik hodisa */
              }
              setPressed(true);
              ctrl.pressStart();
            }}
            onPointerUp={() => {
              setPressed(false);
              ctrl.pressEnd();
            }}
            onPointerCancel={() => {
              setPressed(false);
              ctrl.pressEnd();
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Ic name="mic" size={20} /> {pressed ? 'Gapiring…' : 'Bosib turib gapiring'}
          </button>
        )}
        <div className="seg small">
          <button type="button" className={ptt ? 'on' : ''} onClick={() => !ptt && setConfirmSwitch(true)}>
            Bosib gapirish
          </button>
          <button type="button" className={!ptt ? 'on' : ''} onClick={() => ptt && setConfirmSwitch(true)}>
            Qo'lsiz rejim
          </button>
        </div>
        <div className="call-actions">
          {voices.length > 1 && (
            <button
              type="button"
              className="mic-lang-pill"
              title="Ovozni almashtirish"
              onClick={() => {
                const i = (voiceIdx + 1) % voices.length;
                setVoiceIdx(i);
                ctrl.setVoice(voices[i].id);
              }}
            >
              <Ic name="refresh" size={16} /> {voices[voiceIdx]?.name}
            </button>
          )}
          <button type="button" className="btn btn-danger" onClick={() => ctrl.end('user')}>
            Tugatish
          </button>
        </div>
      </footer>

      {showTranscript && (
        <div className="modal-back" onClick={() => setShowTranscript(false)}>
          <div className="sheet transcript" onClick={(e) => e.stopPropagation()}>
            <div className="guide-head">
              <h3>Suhbat matni</h3>
              <button type="button" className="icon-btn" onClick={() => setShowTranscript(false)} aria-label="Yopish">
                ✕
              </button>
            </div>
            <div className="transcript-body">
              {s.turns.length === 0 && <p className="muted">Suhbat matni shu yerda paydo bo'ladi.</p>}
              {s.turns.map((t) => (
                <div key={t.id} className={`tline tl-${t.role}`}>
                  <b>{t.role === 'user' ? 'Siz' : 'Vivi'}</b>
                  <span>{t.role === 'tutor' ? <RichText text={displayText(t.text)} /> : t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {confirmSwitch && (
        <div className="modal-back" onClick={() => setConfirmSwitch(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h3>Yangi suhbat boshlansinmi?</h3>
            <p className="muted">Muloqot usulini o'zgartirish joriy suhbatni tugatadi va yangisini boshlaydi.</p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => {
                setConfirmSwitch(false);
                endedRef.current = true; // tahlil sahifasiga o'tmaymiz
                ctrl.end('user');
                onSwitchMode();
              }}
            >
              Ha, o'zgartirish
            </button>
            <button type="button" className="btn btn-text" onClick={() => setConfirmSwitch(false)}>
              Qolish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
