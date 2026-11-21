import { useEffect, useMemo, useRef, useState } from 'react';
import { CHARACTERS } from '../../data/characters';
import { VoiceCall as Controller, type CallOptions, type Snapshot } from '../../engine/voice/call';
import { displayText } from '../../engine/voice/markers';
import { KruaLive, type LiveState } from '../../components/KruaLive';
import { RichText } from '../Tutor';

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
  stt: "Bu brauzerda nutqni aniqlab bo'lmaydi. Chrome yoki Edge'da oching.",
};

const NOTICES: Record<string, string> = {
  weak: 'Aloqa zaif — Krua biroz kechikib javob berishi mumkin.',
  reconnecting: "Aloqa uzildi — qayta ulanmoqdamiz. Krua to'xtagan joyidan davom etadi.",
  turnFailed: 'Krua eshitmadi — yana bir bor ayting.',
  nudgeSilence: "Ovozingiz eshitilmayaptimi? «Bosib gapirish» rejimini sinab ko'ring.",
  nudgeNoise: "Atrofingiz shovqinlimi? «Bosib gapirish» rejimini sinab ko'ring.",
  tooLong: "Replika bir daqiqagacha bo'lsin — qisqaroq gapiring.",
  ttsQuota: 'Bugungi ovoz limiti tugadi — Krua brauzer ovozida davom etadi.',
  sttFailed: "Nutqni aniqlab bo'lmadi — qayta urinib ko'ring.",
  upstream: "Krua vaqtincha javob bera olmadi. Birozdan so'ng qayta urinib ko'ring.",
  rateLimited: "Juda ko'p so'rov — bir daqiqadan keyin urinib ko'ring.",
};

export function VoiceCallScreen({
  options,
  subtitles,
  fullscreen,
  onToggleSubtitles,
  onSwitchMode,
  onEnded,
  onUserTurn,
}: {
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
  const rootRef = useRef<HTMLDivElement>(null);
  const endedRef = useRef(false);
  const ptt = options.inputMode === 'ptt';
  const ch = CHARACTERS.find((c) => c.id === options.character)!;

  useEffect(() => {
    ctrl.onUpdate = setS;
    ctrl.onUserTurn = onUserTurn;
    void ctrl.start();
    if (fullscreen) void rootRef.current?.requestFullscreen?.().catch(() => undefined);
    return () => {
      ctrl.dispose();
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

  const liveState: LiveState = s.phase === 'user' ? 'listening' : s.phase === 'thinking' ? 'thinking' : s.phase === 'speaking' ? 'speaking' : s.phase === 'ended' ? 'sleeping' : 'idle';
  const label =
    s.phase === 'connecting'
      ? 'Ulanmoqda…'
      : s.phase === 'user'
        ? s.sttKind === 'cloud'
          ? 'Eshitmoqda… (yozib olinmoqda)'
          : 'Eshitmoqda…'
        : s.phase === 'thinking'
          ? 'Krua o\'ylamoqda…'
          : s.phase === 'speaking'
            ? 'Krua gapirmoqda…'
            : 'Sizning navbatingiz';
  const hint =
    s.phase === 'speaking'
      ? ptt
        ? "Gapini bo'lish uchun Kruani bosib turing"
        : "Gapira boshlang — Krua jim bo'lib tinglaydi"
      : s.phase === 'ready'
        ? ptt
          ? 'Gapirish uchun Kruani yoki Space\'ni bosib turing'
          : 'Shunchaki gapiring — Krua tinglayapti'
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
        <KruaLive state="sleeping" shape="puddle" size={180} />
        <h2>Suhbatni boshlab bo'lmadi</h2>
        <p className="muted">{MIC_ERRORS[s.error] ?? MIC_ERRORS.unsupported}</p>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => onEnded(ctrl)}>
          Orqaga
        </button>
      </div>
    );
  }

  return (
    <div className={`call phase-${s.phase}`} ref={rootRef} style={{ ['--ch' as string]: ch.color }}>
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

      {s.tired && <div className="call-tired">😮‍💨 Krua charchayapti… {fmt(s.limitMs - s.elapsedMs)} qoldi</div>}

      <main className="call-stage">
        <button
          type="button"
          className="call-avatar"
          aria-label={ptt ? 'Gapirish uchun bosib turing' : 'Krua'}
          onPointerDown={(e) => {
            if (!ptt) return;
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            setPressed(true);
            ctrl.pressStart();
          }}
          onPointerUp={() => {
            if (!ptt) return;
            setPressed(false);
            ctrl.pressEnd();
          }}
          onPointerCancel={() => {
            if (!ptt) return;
            setPressed(false);
            ctrl.pressEnd();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <KruaLive shape={s.shape} action={s.action} actionKey={s.actionKey} state={liveState} level={s.level} pressed={pressed} size={Math.min(300, Math.round(window.innerWidth * 0.62))} />
        </button>
        <div className="call-label" aria-live="polite">
          <b>{label}</b>
          {hint && <small>{hint}</small>}
        </div>

        {subtitles && (
          <div className="call-subs">
            {tutorLine && (
              <p className="sub-tutor">
                <RichText text={s.live ? s.live : lastTutor?.text ?? ''} streaming={!!s.live} />
              </p>
            )}
            {userLine && <p className="sub-user">{userLine}</p>}
          </div>
        )}
      </main>

      {s.notice && <div className="call-notice">{s.noticeText || NOTICES[s.notice]}</div>}

      <footer className="call-bottom">
        <div className="seg small">
          <button type="button" className={ptt ? 'on' : ''} onClick={() => !ptt && setConfirmSwitch(true)}>
            Bosib gapirish
          </button>
          <button type="button" className={!ptt ? 'on' : ''} onClick={() => ptt && setConfirmSwitch(true)}>
            Qo'lsiz rejim
          </button>
        </div>
        <div className="call-actions">
          {s.sttKind === 'browser' && (
            <button
              type="button"
              className="mic-lang-pill"
              onClick={() => ctrl.setMicLang(s.micLang.startsWith('fr') ? options.micLang.startsWith('fr') ? 'uz-UZ' : options.micLang : 'fr-FR')}
              title="Qaysi tilda gapiryapsiz"
            >
              🎤 {s.micLang.startsWith('fr') ? 'Français' : s.micLang.startsWith('ru') ? 'Русский' : s.micLang.startsWith('en') ? 'English' : "O'zbekcha"}
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
                <div key={t.id} className={`tline ${t.role}`}>
                  <b>{t.role === 'user' ? 'Siz' : 'Krua'}</b>
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
