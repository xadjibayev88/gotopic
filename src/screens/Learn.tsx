import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { COURSE, type Cefr, type Unit } from '../data/course';
import { buildPath, isLessonUnlocked, nodeState, spinWheel, type PathNode, type WheelPrize } from '../engine/game';
import { playSfx, speak } from '../engine/audio';
import { motionAllowed } from '../engine/motion';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import { AdSlot } from '../components/AdSlot';
import { Ic, type IconName } from '../components/Icons';
import { CoinIcon, FishIcon } from '../components/TopBarIcons';
import type { SessionConfig } from './Session';

// Darslar xaritasi — «Candy Crush» uslubida PASTDAN TEPAGA: 1-dars eng pastda, keyingilari yuqorida.
// Har bir bo'lim: ilon izi yo'l (nuqtali egri chiziq), yumaloq bekatlar, yulduzchalar; pastida binafsha sarlavha kartasi.
// Avvalgi «sovg'a bekati» o'rnida — Sirli quti.

const SP = 118; // bekatlar orasidagi vertikal masofa (px)
const WAVE = [0, 0.72, 1, 0.55, -0.2, -0.85, -1, -0.5];

export function Learn({ onStart }: { onStart: (c: SessionConfig) => void }) {
  const { state } = useStore();
  const [guide, setGuide] = useState<Unit | null>(null);
  const [sheet, setSheet] = useState<PathNode | null>(null);
  const [wheel, setWheel] = useState<PathNode | null>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const [peek, setPeek] = useState<Set<string>>(() => new Set());
  const firstLocked = COURSE.findIndex((u) => !isLessonUnlocked(state, u.lessons[0].id));

  // Ochilganda — hozirgi bekatga (yo'q bo'lsa — eng pastga, ya'ni boshiga).
  useLayoutEffect(() => {
    const go = () => {
      if (activeRef.current) activeRef.current.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
      else window.scrollTo(0, document.documentElement.scrollHeight);
    };
    go();
    // Ilova marshrut almashganda tepaga qaytaradi — keyingi kadrda yana joylaymiz.
    const r = requestAnimationFrame(() => requestAnimationFrame(go));
    return () => cancelAnimationFrame(r);
  }, []);

  // Tepaga chiqib ketganda — o'ng pastda «pastga» tugmasi: bir bosishda hozirgi darsga tushadi.
  const [showDown, setShowDown] = useState(false);
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const el = activeRef.current;
      const far = el ? el.getBoundingClientRect().top > window.innerHeight + 120 : document.documentElement.scrollHeight - window.scrollY - window.innerHeight > 900;
      setShowDown((v) => (v === far ? v : far));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener('scroll', on, { passive: true });
    check();
    return () => {
      window.removeEventListener('scroll', on);
      cancelAnimationFrame(raf);
    };
  }, []);
  const jumpDown = () => {
    const el = activeRef.current;
    const target = el
      ? window.scrollY + el.getBoundingClientRect().top - window.innerHeight / 2 + 40
      : document.documentElement.scrollHeight - window.innerHeight;
    const smooth = motionAllowed();
    // Uzoq masofa: deyarli yetguncha bir zumda, oxirgi qismi silliq.
    if (smooth && target - window.scrollY > 1400) window.scrollTo({ top: target - 700, behavior: 'instant' as ScrollBehavior });
    window.scrollTo({ top: target, behavior: smooth ? 'smooth' : ('instant' as ScrollBehavior) });
  };

  const order = COURSE.map((u, ui) => ({ u, ui })).reverse();
  return (
    <div className="learn lmap">
      <div className="course-end">
        <Mascot mood="sleep" size={100} />
        <p className="muted">Voilà ! Siz C2 — eng yuqori darajaga yetdingiz. Félicitations !</p>
      </div>
      <AdSlot />
      {order.map(({ u, ui }) => {
        const locked = !isLessonUnlocked(state, u.lessons[0].id);
        const done = u.lessons.filter((l) => state.lessonsDone[l.id]).length;
        const lvl = u.level ?? 'A1';
        const levelStart = ui === 0 || (COURSE[ui - 1].level ?? 'A1') !== lvl;
        const far = locked && firstLocked >= 0 && ui > firstLocked + 1 && !peek.has(u.id);
        return (
          <section key={u.id} className={`lunit ${locked ? 'locked' : ''}`} style={{ ['--unit' as string]: u.color }}>
            {far ? (
              <button type="button" className="line-peek" onClick={() => setPeek((p) => new Set(p).add(u.id))}>
                <Ic name="lock" size={18} /> {`${u.lessons.length} ta dars — ko'rish`}
              </button>
            ) : (
              <PathMap nodes={buildPath(ui)} onOpen={setSheet} onWheel={setWheel} onStart={onStart} activeRef={activeRef} />
            )}
            <header className="lunit-card">
              <div className="lunit-text">
                <small>{`Liniya ${ui + 1}`}</small>
                <h2>{u.title}</h2>
                <p>{u.description}</p>
              </div>
              <div className="lunit-actions">
                <button type="button" className="lunit-btn" onClick={() => setGuide(u)} aria-label="Qo'llanma">
                  <Ic name="book" size={22} />
                </button>
                <button type="button" className="lunit-btn" onClick={() => (location.hash = '#/tutor')} aria-label="Vivi bilan gaplashish">
                  <Ic name="chat" size={22} />
                </button>
              </div>
              <div className="lunit-progress" aria-label={`${done} / ${u.lessons.length}`}>
                <span style={{ width: `${(done / u.lessons.length) * 100}%` }} />
                <b>
                  {done} / {u.lessons.length}
                </b>
              </div>
            </header>
            {levelStart && (
              <div className={`level-head lv-${lvl}`}>
                <span className="level-badge">{lvl}</span>
                <div>
                  <b>{LEVEL_NAMES[lvl]}</b>
                  <small>{`${COURSE.filter((x) => (x.level ?? 'A1') === lvl).length} ta liniya`}</small>
                </div>
                {locked && ui > 0 && (
                  <button type="button" className="btn btn-jump" onClick={() => onStart({ kind: 'jump', level: lvl })}>
                    <Ic name="bolt" size={16} /> {lvl} ga sakrash
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}
      <button type="button" data-no-morph className={`lmap-down ${showDown ? 'on' : ''}`} onClick={jumpDown} aria-label="Hozirgi darsga tushish" tabIndex={showDown ? 0 : -1}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v13M6 12l6 6 6-6" />
        </svg>
      </button>
      {sheet && <NodeSheet node={sheet} onClose={() => setSheet(null)} onStart={onStart} />}
      {wheel && <BoxModal node={wheel} onClose={() => setWheel(null)} />}
      {guide && <GuideModal unit={guide} onClose={() => setGuide(null)} />}
    </div>
  );
}

const LEVEL_NAMES: Record<Cefr, string> = {
  A1: "Boshlang'ich",
  A2: 'Elementar',
  B1: "O'rta",
  B2: "O'rtadan yuqori",
  C1: "Ilg'or",
  C2: 'Mukammal',
};

/** Bitta bo'limning ilon izi xaritasi: pastdan tepaga, nuqtali egri yo'l, o'tilgan qismi rangli. */
function PathMap({
  nodes,
  onOpen,
  onWheel,
  onStart,
  activeRef,
}: {
  nodes: PathNode[];
  onOpen: (n: PathNode) => void;
  onWheel: (n: PathNode) => void;
  onStart: (c: SessionConfig) => void;
  activeRef: React.RefObject<HTMLButtonElement>;
}) {
  const { state } = useStore();
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(360);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    setW(el.clientWidth || 360);
    const ro = new ResizeObserver(() => setW(el.clientWidth || 360));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = (nodes.length - 1) * SP + 150;
  const amp = Math.min(w * 0.27, 118);
  const pts = nodes.map((_, i) => ({ x: w / 2 + WAVE[i % WAVE.length] * amp, y: H - 70 - i * SP }));
  const states = nodes.map((n) => nodeState(state, n));
  const reached = states.reduce((a, st, i) => (st !== 'locked' ? i : a), -1);
  const pathTo = (k: number) => {
    let d = `M${pts[0].x},${pts[0].y + 40}`;
    d += ` L${pts[0].x},${pts[0].y}`;
    for (let i = 1; i <= k && i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      d += ` C${a.x},${a.y - SP * 0.55} ${b.x},${b.y + SP * 0.55} ${b.x},${b.y}`;
    }
    return d;
  };

  return (
    <div className="lpath" ref={box} style={{ height: H }}>
      <svg className="lpath-svg" width={w} height={H} aria-hidden="true">
        <path d={pathTo(nodes.length - 1)} className="lpath-line rest" />
        {reached > 0 && <path d={pathTo(reached)} className="lpath-line done" />}
      </svg>
      {nodes.map((n, i) => {
        const st = states[i];
        const p = pts[i];
        const times = n.type === 'lesson' ? state.lessonsDone[n.id] ?? 0 : 0;
        const stars = n.type === 'lesson' ? Math.min(3, times) : n.type === 'review' && st === 'done' ? 3 : 0;
        const isNext = st === 'active' && n.type === 'lesson';
        const icon: IconName = n.type === 'lesson' ? LESSON_ICONS[(n.unitIndex + n.lessonIndex) % LESSON_ICONS.length] : n.type === 'review' ? 'trophy' : 'gift';
        const title = n.type === 'lesson' ? n.title : n.type === 'review' ? 'Yakuniy takrorlash' : 'Sirli quti';
        const side = WAVE[i % WAVE.length] >= 0 ? 'left' : 'right';
        return (
          <div key={n.id} className={`lnode ${st} t-${n.type} ${isNext ? 'next' : ''}`} style={{ left: p.x, top: p.y, ['--i' as string]: i } as CSSProperties}>
            <button
              type="button"
              className="lnode-btn"
              ref={isNext ? activeRef : undefined}
              onClick={() => (n.type === 'chest' && st === 'active' ? onWheel(n) : onOpen(n))}
              aria-label={title}
            >
              <span className="lnode-face">{st === 'locked' ? <Ic name="lock" size={28} className="lnode-lock" /> : n.type === 'chest' ? <GoldBox className="lnode-gbox" /> : <Ic name={icon} size={n.type === 'review' ? 38 : 32} />}</span>
            </button>
            {n.type !== 'chest' && (
              <span className="lnode-stars" aria-label={`${stars} yulduz`}>
                {[0, 1, 2].map((k) => (
                  <i key={k} className={k < stars ? 'on' : ''}>
                    ★
                  </i>
                ))}
              </span>
            )}
            <span className="lnode-title">{title}</span>
            {isNext && (
              <div className={`lnode-here ${side}`}>
                <span className="lnode-vivi">
                  <Mascot mood="happy" size={58} />
                </span>
                <button type="button" className="lnode-go" onClick={() => onStart({ kind: 'lesson', lessonId: n.id })}>
                  Davom etish
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NodeSheet({ node, onClose, onStart }: { node: PathNode; onClose: () => void; onStart: (c: SessionConfig) => void }) {
  const { state } = useStore();
  const st = nodeState(state, node);
  const unit = COURSE[node.unitIndex];
  const times = node.type === 'lesson' ? state.lessonsDone[node.id] ?? 0 : 0;
  return createPortal(
    <div className="modal-back" onClick={onClose}>
      <div className="sheet lsheet" onClick={(e) => e.stopPropagation()} style={{ ['--unit' as string]: unit.color }}>
        {node.type === 'lesson' && (
          <>
            <span className="lsheet-badge">{`${node.lessonIndex + 1}-dars`}</span>
            <h3>{node.title}</h3>
            {st === 'locked' ? (
              <p className="muted">Bu bekatga yetish uchun oldingi darslarni tugating.</p>
            ) : (
              <>
                {times > 0 && <p className="muted">{`O'tilgan · ${times} marta — takrorlab yulduz yig'ing`}</p>}
                <div className="pop-words">
                  {unit.lessons[node.lessonIndex].words.map((w) => (
                    <button key={w.fr} type="button" onClick={() => speak(w.fr, state.settings.ttsRate)}>
                      <Ic name="speaker" size={15} /> {w.fr}
                    </button>
                  ))}
                </div>
                <button type="button" className="btn btn-primary btn-lg" onClick={() => onStart({ kind: 'lesson', lessonId: node.id })}>
                  {st === 'done' ? 'Takrorlash · +10 XP' : 'Darsni boshlash · +10 XP'}
                </button>
              </>
            )}
          </>
        )}
        {node.type === 'review' && (
          <>
            <span className="lsheet-badge"><Ic name="trophy" size={22} /></span>
            <h3>Yakuniy takrorlash</h3>
            <p className="muted">{st === 'locked' ? 'Avval liniyadagi barcha darslarni tugating.' : "Bo'limdagi hamma so'z va gaplarni mustahkamlang."}</p>
            {st !== 'locked' && (
              <button type="button" className="btn btn-primary btn-lg" onClick={() => onStart({ kind: 'review', unitIndex: node.unitIndex })}>
                Takrorlashni boshlash · +15 XP
              </button>
            )}
          </>
        )}
        {node.type === 'chest' && (
          <>
            <span className="lsheet-badge"><Ic name="gift" size={22} /></span>
            <h3>Sirli quti</h3>
            <p className="muted">{st === 'done' ? 'Bu quti allaqachon ochilgan.' : "Qutini ochish uchun oldingi bekatlardan o'ting."}</p>
          </>
        )}
        <button type="button" className="btn btn-text" onClick={onClose}>
          Yopish
        </button>
      </div>
    </div>,
    document.body,
  );
}

const PRIZE_FACE: Record<WheelPrize['kind'], { icon: React.ReactNode }> = {
  gems: { icon: <CoinIcon /> },
  fish: { icon: <FishIcon /> },
  boost: { icon: <Ic name="bolt" size={26} /> },
  freeze: { icon: <Ic name="shield" size={26} /> },
};
const LESSON_ICONS: IconName[] = ['chat', 'book', 'headphones', 'pencil', 'mic', 'letters', 'puzzle', 'speaker'];
const prizeText = (p: WheelPrize) =>
  p.kind === 'gems' ? `+${p.amount} tanga` : p.kind === 'fish' ? `+${p.amount} baliqcha` : p.kind === 'boost' ? `2x XP · ${p.minutes} daqiqa` : '+1 seriya soyaboni';

/** Oltin sirli quti (izometrik 3D SVG): korpus va qopqoq alohida — ochilganda qopqoq uchib ketadi. */
function GoldBox({ className = 'gbox' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 196" aria-hidden="true">
      <defs>
        <linearGradient id="gb-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF4C8" />
          <stop offset="1" stopColor="#FFD776" />
        </linearGradient>
        <linearGradient id="gb-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD56E" />
          <stop offset="1" stopColor="#E9A23A" />
        </linearGradient>
        <linearGradient id="gb-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E7A541" />
          <stop offset="1" stopColor="#B9741C" />
        </linearGradient>
        <linearGradient id="gb-gem" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFD23F" />
          <stop offset=".55" stopColor="#FF6B9A" />
          <stop offset="1" stopColor="#9B5CFF" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="186" rx="70" ry="9" fill="rgba(0,0,0,.28)" />
      <g className="gbox-body">
        <path d="M30 76 100 106v80L30 156z" fill="url(#gb-left)" />
        <path d="M100 106 170 76v80l-70 30z" fill="url(#gb-right)" />
        <path d="M58 88l14 6v80l-14-6z" fill="#FFF0C2" opacity=".75" />
        <path d="M128 94l14-6v80l-14 6z" fill="#F6CF7E" opacity=".6" />
        <path d="M65 112l13 15-13 17-13-15z" fill="url(#gb-gem)" stroke="#FFF6DA" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M100 106v80" stroke="#FFF3D0" strokeWidth="1.5" opacity=".6" />
      </g>
      <g className="gbox-lid">
        <path d="M22 62 100 96v16L22 78z" fill="#F2BC52" />
        <path d="M100 96 178 62v16l-78 34z" fill="#C98526" />
        <path d="M100 28 178 62 100 96 22 62z" fill="url(#gb-top)" />
        <path d="M54 44l78 34M68 38l78 34" stroke="#FFF9E6" strokeWidth="9" opacity=".85" />
        <path d="M100 58c-16-24-46-22-40-6 4 10 26 8 40 6zM100 58c18-22 48-16 40-2-5 9-27 5-40 2z" fill="#FFE59A" stroke="#E8A93E" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="100" cy="58" r="6" fill="#FFD776" stroke="#E8A93E" strokeWidth="3" />
      </g>
    </svg>
  );
}

const DUST = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 37) % 100,
  y: (i * 61) % 100,
  s: 2 + (i % 4),
  d: (i % 7) * 0.6,
  t: 5 + (i % 5),
}));

const SPARKS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2;
  const d = 90 + (i % 3) * 26;
  return { x: Math.round(Math.cos(a) * d), y: Math.round(Math.sin(a) * d - 30), d: (i % 6) * 40, s: 4 + (i % 4) * 2 };
});

/** Sirli quti: bosiladi → silkinadi → qopqoq otilib chiqadi, nurlar va uchqunlar → sovg'a ko'tariladi. Faqat transform/opacity. */
function BoxModal({ node, onClose }: { node: PathNode; onClose: () => void }) {
  const { state, update } = useStore();
  const [stage, setStage] = useState<'idle' | 'shake' | 'open'>('idle');
  const [result, setResult] = useState<WheelPrize | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const open = () => {
    if (stage !== 'idle') return;
    const r = spinWheel(state, node.id, Math.random());
    const fast = !motionAllowed();
    setStage('shake');
    if (navigator.vibrate) navigator.vibrate([10, 60, 10, 60, 10]);
    timers.current.push(
      window.setTimeout(() => {
        update(() => r.state);
        setResult(r.prize);
        setStage('open');
        playSfx('chest', state.settings.sound);
        if (navigator.vibrate) navigator.vibrate([25, 40, 40]);
      }, fast ? 30 : 750),
    );
  };

  return createPortal(
    <div className={`box-full bx-${stage}`} role="dialog" aria-modal="true" aria-label="Sirli quti" onClick={() => (result ? onClose() : open())}>
      <span className="box-dust" aria-hidden="true">
        {DUST.map((d, k) => (
          <i key={k} style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, animationDelay: `${d.d}s`, animationDuration: `${d.t}s` }} />
        ))}
      </span>
      <button type="button" className="box-x" onClick={(e) => { e.stopPropagation(); if (stage !== 'shake') onClose(); }} aria-label="Yopish">
        <Ic name="close" size={20} />
      </button>
      <small className="box-kicker">{result ? 'BONUS OCHILDI' : stage === 'idle' ? 'OCHISH UCHUN BOSING' : 'OCHILMOQDA…'}</small>
      <div className="box-stage">
        <span className="box-rays" aria-hidden="true" />
        <span className="box-glow" aria-hidden="true" />
        <span className="box-sparks" aria-hidden="true">
          {SPARKS.map((p, k) => (
            <i key={k} style={{ ['--x' as string]: `${p.x * 1.4}px`, ['--y' as string]: `${p.y * 1.4}px`, ['--d' as string]: `${p.d}ms`, width: p.s, height: p.s }} />
          ))}
        </span>
        {result && <span className="box-prize">{PRIZE_FACE[result.kind].icon}</span>}
        <GoldBox />
      </div>
      <div className="box-foot">
        {result ? (
          <>
            <b className="box-prize-text">{prizeText(result)}</b>
            <button type="button" className="btn btn-primary btn-lg" onClick={(e) => { e.stopPropagation(); onClose(); }}>
              Merci !
            </button>
          </>
        ) : (
          <p>Ichida — tanga, baliqcha, 2x XP yoki seriya soyaboni.</p>
        )}
      </div>
    </div>,
    document.body,
  );
}

function GuideModal({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="sheet guide" onClick={(e) => e.stopPropagation()} style={{ ['--unit' as string]: unit.color }}>
        <div className="guide-head">
          <h3><Ic name="book" size={22} /> {unit.title}: qo'llanma</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Yopish">
            <Ic name="close" size={18} />
          </button>
        </div>
        <div className="guide-body">
          {unit.guide.map((g) => (
            <div key={g.title} className="guide-card">
              <h4>{g.title}</h4>
              <p>{g.text}</p>
              {g.examples && (
                <ul>
                  {g.examples.map(([fr, uz]) => (
                    <li key={fr}>
                      <button type="button" className="ex-fr" onClick={() => speak(fr)}>
                        <Ic name="speaker" size={16} /> {fr}
                      </button>
                      <span>{uz}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <h4 className="vocab-h">Lug'at</h4>
          <div className="vocab-grid">
            {unit.lessons
              .flatMap((l) => l.words)
              .map((w) => (
                <button key={w.fr + w.uz} type="button" className="vocab" onClick={() => speak(w.fr)}>
                  <b>{w.fr}</b>
                  <small>{w.uz}</small>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
