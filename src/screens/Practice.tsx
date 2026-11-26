import { ALL_LESSONS } from '../data/course';
import { Ic } from '../components/Icons';
import { wordRecall } from '../engine/game';
import { speak, ttsSupported } from '../engine/audio';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import type { SessionConfig } from './Session';
import { SwipeRow, UndoStrip } from '../components/SwipeRow';
import { useCallback, useState, type ReactNode } from 'react';

/** So'zga bog'liq barqaror rang (har so'z o'z rangida). */
const hue = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};
// So'z plitkasi: emoji o'rniga — palitradan gradient va so'zning bosh harfi (artikllarsiz).
const TILE: [string, string][] = [
  ['#7FE3FF', '#B49CFF'],
  ['#B49CFF', '#FF8FD0'],
  ['#FFD23F', '#FF6B9A'],
  ['#FF6B9A', '#9B5CFF'],
  ['#7FE3FF', '#9B5CFF'],
  ['#FF8FD0', '#FFD23F'],
];
const initial = (fr: string) => {
  const w = fr.trim().replace(/^(l'|l’|le |la |les |un |une |des |du |d'|d’)/i, '');
  return (w.match(/\p{L}/u)?.[0] ?? '?').toUpperCase();
};

export function Practice({ onStart }: { onStart: (c: SessionConfig) => void }) {
  const { state, update } = useStore();
  const learned = [
    ...ALL_LESSONS.filter((l) => state.lessonsDone[l.id]).flatMap((l) => l.words),
    ...state.customWords.map((w) => ({ fr: w.fr, uz: w.uz, emoji: '📝' as string | undefined })),
  ];
  const mistakes = Object.keys(state.mistakes).length;
  const now = Date.now();
  const rows = learned
    .map((w) => ({ w, r: state.words[w.fr] ? wordRecall(state.words[w.fr], now) : 0 }))
    .sort((a, b) => a.r - b.r);
  const disabled = learned.length === 0;
  const avg = rows.length ? rows.reduce((a, x) => a + x.r, 0) / rows.length : 0;
  const weak = rows.filter((x) => x.r < 0.35).length;

  // O'chirilgan so'z «Qaytarish» uchun asl joyi bilan eslab qolinadi (Inline Undo).
  type Custom = (typeof state.customWords)[number];
  const [removed, setRemoved] = useState<{ word: Custom; index: number; pos: number } | null>(null);
  const clearRemoved = useCallback(() => setRemoved(null), []);
  const removeWord = (fr: string, pos: number) => {
    const index = state.customWords.findIndex((x) => x.fr.toLowerCase() === fr.toLowerCase());
    if (index < 0) return;
    setRemoved({ word: state.customWords[index], index, pos });
    update((s) => ({ ...s, customWords: s.customWords.filter((x) => x.fr.toLowerCase() !== fr.toLowerCase()) }));
  };
  const undoRemove = () => {
    if (!removed) return;
    const { word, index } = removed;
    update((s) => {
      if (s.customWords.some((x) => x.fr.toLowerCase() === word.fr.toLowerCase())) return s;
      const next = [...s.customWords];
      next.splice(Math.min(index, next.length), 0, word);
      return { ...s, customWords: next };
    });
    setRemoved(null);
  };
  const firstRemovable = rows.findIndex(({ w }) => w.emoji === '📝');
  const undo = removed ? <UndoStrip key={removed.word.fr} label={removed.word.fr} onUndo={undoRemove} onExpire={clearRemoved} /> : null;

  return (
    <div className="page">
      <h1 className="page-title">Mashq</h1>
      {disabled && (
        <div className="empty">
          <Mascot mood="think" size={120} />
          <p>Mashq qilish uchun avval kamida bitta darsni tugating.</p>
        </div>
      )}
      {/* So'zlar kuchi: o'rtacha eslab qolish + qisqa ko'rsatkichlar */}
      {rows.length > 0 && (
        <section className="pr-hero">
          <span className="pr-ring" style={{ ['--p' as string]: avg }} aria-label={`O'rtacha kuch ${Math.round(avg * 100)}%`}>
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="27" className="pr-ring-bg" />
              <circle cx="32" cy="32" r="27" className="pr-ring-fg" pathLength={100} style={{ strokeDashoffset: 100 - avg * 100 }} />
            </svg>
            <b>{Math.round(avg * 100)}%</b>
          </span>
          <div className="pr-hero-text">
            <small>So'zlar kuchi</small>
            <b>{avg >= 0.7 ? 'Zo\'r holat!' : avg >= 0.4 ? 'Takrorlash vaqti' : 'So\'zlar unutilyapti'}</b>
            <div className="pr-chips">
              <span><Ic name="book" size={15} /> {`${rows.length} so'z`}</span>
              <span className={weak ? 'warn' : ''}><Ic name="warning" size={15} /> {`${weak} ta zaif`}</span>
              <span className={mistakes ? 'bad' : ''}><Ic name="target" size={15} /> {`${mistakes} ta xato`}</span>
            </div>
          </div>
        </section>
      )}
      <button type="button" className="pr-main" disabled={disabled} onClick={() => onStart({ kind: 'practice', mode: 'smart' })}>
        <span className="pr-main-icon"><Ic name="brain" size={34} /></span>
        <span className="pr-main-text">
          <b>Aqlli takrorlash</b>
          <small>Unutilayotgan so'zlarni mustahkamlang</small>
        </span>
        <span className="pr-main-go">
          <em>+1 🐟</em>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
        </span>
      </button>
      <div className="pr-grid">
        <button type="button" className="pr-tile" style={{ ['--c' as string]: '#FF6B9A', ['--c2' as string]: '#FFD23F' }} disabled={disabled || mistakes === 0} onClick={() => onStart({ kind: 'practice', mode: 'mistakes' })}>
          <span className="pr-tile-icon"><Ic name="target" size={30} /></span>
          {mistakes > 0 && <span className="pr-badge">{mistakes}</span>}
          <b>Xatolar ustida ishlash</b>
          <small>{mistakes ? `${mistakes} ta xato kutmoqda` : "Hozircha xato yo'q"}</small>
        </button>
        <button type="button" className="pr-tile" style={{ ['--c' as string]: '#9B5CFF', ['--c2' as string]: '#7FE3FF' }} disabled={disabled || !ttsSupported()} onClick={() => onStart({ kind: 'practice', mode: 'listening' })}>
          <span className="pr-tile-icon"><Ic name="headphones" size={30} /></span>
          <b>Tinglash mashqi</b>
          <small>{ttsSupported() ? "Quloqni fransuz nutqiga o'rgating" : "Brauzeringiz ovozni qo'llamaydi"}</small>
        </button>
      </div>

      {rows.length > 0 && (
        <>
          <h2 className="section-title">
            So'zlarim <span className="muted">· {rows.length}</span>
          </h2>
          <div className="word-list">
            {rows.map(({ w, r }, i) => {
              const removable = w.emoji === '📝';
              const content = (
                <div role="button" tabIndex={0} className="word-row" onClick={() => speak(w.fr, state.settings.ttsRate)}>
                  <span className="wr-emoji wr-mono" style={{ ['--g1' as string]: TILE[hue(w.fr) % TILE.length][0], ['--g2' as string]: TILE[hue(w.fr) % TILE.length][1] }}>
                    <span>{initial(w.fr)}</span>
                  </span>
                  <span className="wr-text">
                    <b>{w.fr}</b>
                    <small>{w.uz}</small>
                  </span>
                  <span className={`strength ${r < 0.35 ? 's-weak' : r < 0.7 ? 's-mid' : 's-strong'}`} title={`${Math.round(r * 100)}%`}>
                    {[0, 1, 2, 3].map((k) => (
                      <i key={k} className={r > k * 0.25 + 0.05 ? 'on' : ''} />
                    ))}
                  </span>
                  {removable && (
                    <button
                      type="button"
                      className="wr-remove"
                      aria-label={`${w.fr} — lug'atdan chiqarish`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWord(w.fr, i);
                      }}
                    >
                      <Ic name="close" size={14} />
                    </button>
                  )}
                </div>
              );
              const node: ReactNode = removable ? (
                <SwipeRow key={w.fr + w.uz} hint={i === firstRemovable} onDelete={() => removeWord(w.fr, i)}>
                  {content}
                </SwipeRow>
              ) : (
                <div key={w.fr + w.uz}>{content}</div>
              );
              return removed && removed.pos === i ? [undo, node] : node;
            })}
            {removed && removed.pos >= rows.length && undo}
          </div>
        </>
      )}
    </div>
  );
}
