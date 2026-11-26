// Jonli rejim (Gemini Live) ekrani: qo'lsiz suhbat, Vivi gapini istalgan payt bo'lish mumkin.
import { useEffect, useMemo, useState } from 'react';
import { Ic } from '../../components/Icons';
import { CHARACTERS } from '../../data/characters';
import { LiveSession, type LiveOptions, type LiveSnap } from '../../engine/voice/live';
import { KruaLive } from '../../components/KruaLive';
import { setImmersive } from '../../engine/ads';

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export function LiveCallScreen({ options, subtitles, onEnded }: { options: LiveOptions; subtitles: boolean; onEnded: (s: LiveSession) => void }) {
  const session = useMemo(() => new LiveSession(options), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [s, setS] = useState<LiveSnap>(session.snap);
  const ptt = options.inputMode === 'ptt';
  const ch = CHARACTERS.find((c) => c.id === options.character)!;

  useEffect(() => {
    setImmersive(true);
    session.onUpdate = setS;
    void session.start();
    return () => {
      setImmersive(false);
      session.end('user');
    };
  }, [session]);

  useEffect(() => {
    if (s.phase === 'ended') {
      const t = setTimeout(() => onEnded(session), s.error ? 2200 : 300);
      return () => clearTimeout(t);
    }
  }, [s.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const lastTutor = [...s.turns].reverse().find((t) => t.role === 'tutor')?.text ?? '';
  const lastUser = [...s.turns].reverse().find((t) => t.role === 'user')?.text ?? '';
  const clean = (t: string) => t.replace(/\[\[[^\]]*\]\]/g, '').replace(/\[\/?fr\]/gi, '').replace(/\s{2,}/g, ' ').trim();
  const tutorLine = clean(s.liveTutor || lastTutor);
  const userLine = s.liveUser || (s.liveTutor ? '' : lastUser);
  const label = s.phase === 'connecting' ? 'Ulanmoqda…' : s.userTalking ? 'Eshityapman…' : s.phase === 'speaking' ? 'Vivi gapirmoqda…' : s.phase === 'ended' ? 'Suhbat tugadi' : s.muted ? 'Mikrofon o\'chiq' : ptt ? 'Tinglash o\'chiq — boshlash uchun tugmani bosing' : 'Qo\'lsiz tinglayapman — gapiring';

  return (
    <div className={`call live-call phase-${s.phase === 'speaking' ? 'speaking' : 'ready'}`} style={{ ['--ch' as string]: ch.color }}>
      <header className="call-top">
        <button type="button" className="icon-btn" aria-label="Tugatish" onClick={() => session.end('user')}>
          ✕
        </button>
        <div className="call-meta">
          <b>
            ⚡ {ch.name} · Jonli
          </b>
          <span aria-label="Suhbat vaqti">
            {fmt(s.elapsedMs)} / {fmt(s.limitMs)}
          </span>
        </div>
        <span className="live-badge">LIVE</span>
      </header>

      <main className="call-stage">
        <div className="call-avatar" aria-hidden="true">
          <KruaLive
            cue={{ ...s.cue, state: s.phase === 'speaking' ? 'speaking' : s.phase === 'connecting' ? 'thinking' : s.micLevel > 0.08 ? 'listening' : 'idle' }}
            level={s.phase === 'speaking' ? s.level : s.micLevel}
            size={Math.min(300, Math.round(window.innerWidth * 0.62))}
          />
        </div>
        <div className="call-label" aria-live="polite">
          <b>{label}</b>
          <small>{s.error ?? (ptt ? 'Tinglash faqat tugmani bosganda boshlanadi; tugmani yana bosing — to\'xtaydi.' : 'Qo\'lsiz rejim: tugmani bosmasdan gapiring.')}</small>
        </div>
        {subtitles && (tutorLine || userLine) && (
          <div className="call-subs">
            {tutorLine && <p className="sub-tutor">{tutorLine}</p>}
            {userLine && <p className="sub-user">{userLine}</p>}
          </div>
        )}
      </main>

      <footer className="call-bottom">
        <div className="call-actions live-actions">
          <button type="button" className={`round-btn ${s.muted ? 'off' : ''}`} onClick={() => session.toggleMute()} disabled={s.phase === 'ended' || s.phase === 'connecting'} aria-label={s.muted ? 'Mikrofonni yoqish' : "Mikrofonni o'chirish"}>
            <Ic name={s.muted ? 'mute' : 'mic'} size={26} />
          </button>
          {ptt && (
            <button
              type="button"
              className={`ptt-btn ${s.userTalking ? 'on' : ''}`}
              aria-pressed={s.userTalking}
              disabled={s.phase === 'ended' || s.phase === 'connecting'}
              onClick={() => session.togglePushToTalk()}
              onContextMenu={(e) => e.preventDefault()}
            >
              <span className="ptt-ring" style={{ ['--lvl' as string]: String(s.micLevel) }} />
              <b>{s.userTalking ? 'Gapirishni tugatish' : 'Gapirishni boshlash'}</b>
            </button>
          )}
          <button type="button" className="round-btn end" onClick={() => session.end('user')} aria-label="Tugatish">
            ✕
          </button>
        </div>
      </footer>
    </div>
  );
}
