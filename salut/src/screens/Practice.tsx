import { ALL_LESSONS } from '../data/course';
import { wordRecall } from '../engine/game';
import { speak, ttsSupported } from '../engine/audio';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import type { SessionConfig } from './Session';

export function Practice({ onStart }: { onStart: (c: SessionConfig) => void }) {
  const { state } = useStore();
  const learned = ALL_LESSONS.filter((l) => state.lessonsDone[l.id]).flatMap((l) => l.words);
  const mistakes = Object.keys(state.mistakes).length;
  const now = Date.now();
  const rows = learned
    .map((w) => ({ w, r: state.words[w.fr] ? wordRecall(state.words[w.fr], now) : 0 }))
    .sort((a, b) => a.r - b.r);
  const disabled = learned.length === 0;

  return (
    <div className="page">
      <h1 className="page-title">Mashq</h1>
      {disabled && (
        <div className="empty">
          <Mascot mood="think" size={120} />
          <p>Mashq qilish uchun avval kamida bitta darsni tugating.</p>
        </div>
      )}
      <div className="practice-grid">
        <button type="button" className="pcard" style={{ ['--c' as string]: '#2F6BFF' }} disabled={disabled} onClick={() => onStart({ kind: 'practice', mode: 'smart' })}>
          <span className="pcard-icon">🧠</span>
          <b>Aqlli takrorlash</b>
          <small>Unutilayotgan so'zlarni mustahkamlang · +1 ❤️</small>
        </button>
        <button type="button" className="pcard" style={{ ['--c' as string]: '#E5484D' }} disabled={disabled || mistakes === 0} onClick={() => onStart({ kind: 'practice', mode: 'mistakes' })}>
          <span className="pcard-icon">🩹</span>
          <b>Xatolar ustida ishlash</b>
          <small>{mistakes ? `${mistakes} ta xato kutmoqda` : "Hozircha xato yo'q"}</small>
        </button>
        <button
          type="button"
          className="pcard"
          style={{ ['--c' as string]: '#8B5CF6' }}
          disabled={disabled || !ttsSupported()}
          onClick={() => onStart({ kind: 'practice', mode: 'listening' })}
        >
          <span className="pcard-icon">🎧</span>
          <b>Tinglash mashqi</b>
          <small>{ttsSupported() ? 'Quloqni fransuz nutqiga o\'rgating' : 'Brauzeringiz ovozni qo\'llamaydi'}</small>
        </button>
      </div>

      {rows.length > 0 && (
        <>
          <h2 className="section-title">
            So'zlarim <span className="muted">· {rows.length}</span>
          </h2>
          <div className="word-list">
            {rows.map(({ w, r }) => (
              <button key={w.fr + w.uz} type="button" className="word-row" onClick={() => speak(w.fr, state.settings.ttsRate)}>
                <span className="wr-emoji">{w.emoji}</span>
                <span className="wr-text">
                  <b>{w.fr}</b>
                  <small>{w.uz}</small>
                </span>
                <span className="strength" title={`${Math.round(r * 100)}%`}>
                  {[0, 1, 2, 3].map((i) => (
                    <i key={i} className={r > i * 0.25 + 0.05 ? 'on' : ''} />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
