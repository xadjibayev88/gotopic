import { useEffect, useRef, useState } from 'react';
import { COURSE, type Unit } from '../data/course';
import { buildPath, isLessonUnlocked, nodeState, openChest, chestReward, type PathNode } from '../engine/game';
import { playSfx, speak } from '../engine/audio';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import type { SessionConfig } from './Session';

const OFFSETS = [0, 44, 70, 44, 0, -44, -70, -44];

export function Learn({ onStart }: { onStart: (c: SessionConfig) => void }) {
  const { state } = useStore();
  const [guide, setGuide] = useState<Unit | null>(null);
  const [popover, setPopover] = useState<string | null>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <div className="learn" onClick={() => setPopover(null)}>
      {COURSE.map((u, ui) => (
        <section key={u.id} className="unit" style={{ ['--unit' as string]: u.color }}>
          <div className={`unit-head ${isLessonUnlocked(state, u.lessons[0].id) ? '' : 'locked'}`}>
            <div>
              <div className="unit-kicker">{ui + 1}-BO'LIM</div>
              <h2>{u.title}</h2>
              <p>{u.description}</p>
            </div>
            <button
              type="button"
              className="guide-btn"
              onClick={(e) => {
                e.stopPropagation();
                setGuide(u);
              }}
            >
              📘 <span>Qo'llanma</span>
            </button>
          </div>
          <div className="path">
            {buildPath(ui).map((node, ni) => (
              <PathItem
                key={node.id}
                node={node}
                offset={OFFSETS[ni % OFFSETS.length]}
                open={popover === node.id}
                onToggle={() => setPopover(popover === node.id ? null : node.id)}
                onStart={onStart}
                activeRef={activeRef}
              />
            ))}
          </div>
        </section>
      ))}
      <div className="course-end">
        <Mascot mood="sleep" size={110} />
        <p className="muted">Yangi bo'limlar tez orada qo'shiladi. À bientôt !</p>
      </div>
      {guide && <GuideModal unit={guide} onClose={() => setGuide(null)} />}
    </div>
  );
}

function PathItem({
  node,
  offset,
  open,
  onToggle,
  onStart,
  activeRef,
}: {
  node: PathNode;
  offset: number;
  open: boolean;
  onToggle: () => void;
  onStart: (c: SessionConfig) => void;
  activeRef: React.RefObject<HTMLDivElement>;
}) {
  const { state, update } = useStore();
  const st = nodeState(state, node);
  const unit = COURSE[node.unitIndex];
  const [opened, setOpened] = useState<number | null>(null);

  const icon =
    node.type === 'chest' ? (st === 'done' ? '📭' : '🎁') : node.type === 'review' ? '🏆' : st === 'done' ? '✓' : st === 'locked' ? '🔒' : '★';
  const times = node.type === 'lesson' ? state.lessonsDone[node.id] ?? 0 : 0;

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'chest' && st === 'active') {
      const r = openChest(state, node.id);
      update(() => r.state);
      setOpened(r.gems);
      playSfx('chest', state.settings.sound);
      return;
    }
    onToggle();
  };

  return (
    <div className={`node-wrap ${open || opened !== null ? 'open' : ''}`} style={{ transform: `translateX(${offset}px)` }} ref={st === 'active' && node.type === 'lesson' ? activeRef : undefined}>
      {st === 'active' && node.type === 'lesson' && <div className="start-tag">BOSHLASH</div>}
      <button type="button" className={`node node-${node.type} ${st}`} onClick={onClick} aria-label={node.type === 'lesson' ? node.title : node.type}>
        {st === 'active' && node.type === 'lesson' && <span className="node-ring" />}
        <span className="node-icon">{icon}</span>
      </button>
      {times > 1 && <div className="node-level">×{times}</div>}
      {opened !== null && (
        <div className="popover" onClick={(e) => e.stopPropagation()}>
          <b>Sandiq ochildi!</b>
          <p>💎 +{opened} olmos</p>
          <button type="button" className="btn btn-white" onClick={() => setOpened(null)}>
            Zo'r!
          </button>
        </div>
      )}
      {open && (
        <div className="popover" onClick={(e) => e.stopPropagation()} style={{ ['--unit' as string]: st === 'locked' ? '#9CA3AF' : unit.color }}>
          {node.type === 'lesson' && (
            <>
              <b>{node.title}</b>
              <p>
                {st === 'locked'
                  ? 'Ochish uchun oldingi darslarni tugating'
                  : st === 'done'
                    ? `${times} marta o'tilgan · har safar qiyinroq`
                    : `${node.lessonIndex + 1}-dars / ${unit.lessons.length}`}
              </p>
              {st !== 'locked' && (
                <>
                  <div className="pop-words">
                    {unit.lessons[node.lessonIndex].words.slice(0, 4).map((w) => (
                      <span
                        key={w.fr}
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(w.fr);
                        }}
                      >
                        {w.emoji} {w.fr}
                      </span>
                    ))}
                  </div>
                  <button type="button" className="btn btn-white" onClick={() => onStart({ kind: 'lesson', lessonId: node.id })}>
                    {st === 'done' ? 'Takrorlash +10 XP' : 'Boshlash +10 XP'}
                  </button>
                </>
              )}
            </>
          )}
          {node.type === 'review' && (
            <>
              <b>{unit.title}: yakuniy takrorlash</b>
              <p>{st === 'locked' ? "Avval bo'limdagi barcha darslarni tugating" : "Bo'limdagi hamma narsani mustahkamlang"}</p>
              {st !== 'locked' && (
                <button type="button" className="btn btn-white" onClick={() => onStart({ kind: 'review', unitIndex: node.unitIndex })}>
                  Boshlash +15 XP
                </button>
              )}
            </>
          )}
          {node.type === 'chest' && (
            <>
              <b>Sandiq</b>
              <p>{st === 'done' ? 'Allaqachon ochilgan' : `Ichida ${chestReward(node.id)} tagacha olmos bor. Oldingi darslarni tugating.`}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function GuideModal({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="sheet guide" onClick={(e) => e.stopPropagation()} style={{ ['--unit' as string]: unit.color }}>
        <div className="guide-head">
          <h3>📘 {unit.title}: qo'llanma</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Yopish">
            ✕
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
                        🔊 {fr}
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
                  <span>{w.emoji}</span>
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
