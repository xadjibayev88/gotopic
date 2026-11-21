import { useEffect, useRef, useState } from 'react';
import { COURSE, type Unit } from '../data/course';
import { buildPath, chestReward, isLessonUnlocked, nodeState, openChest, type PathNode } from '../engine/game';
import { playSfx, speak } from '../engine/audio';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import type { SessionConfig } from './Session';

// Darslar yo'li — Parij metrosi xaritasi uslubida: bo'lim = liniya, dars = bekat.
export function Learn({ onStart }: { onStart: (c: SessionConfig) => void }) {
  const { state } = useStore();
  const [guide, setGuide] = useState<Unit | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <div className="learn">
      {COURSE.map((u, ui) => {
        const locked = !isLessonUnlocked(state, u.lessons[0].id);
        const done = u.lessons.filter((l) => state.lessonsDone[l.id]).length;
        return (
          <section key={u.id} className={`line ${locked ? 'locked' : ''}`} style={{ ['--unit' as string]: u.color }}>
            <header className="line-head">
              <span className="line-badge">{ui + 1}</span>
              <div className="line-text">
                <small>
                  LINIYA {ui + 1} · {done}/{u.lessons.length} bekat
                </small>
                <h2>{u.title}</h2>
                <p>{u.description}</p>
              </div>
              <button type="button" className="guide-btn" onClick={() => setGuide(u)} aria-label="Qo'llanma">
                📘
              </button>
            </header>
            <ol className="stations">
              {buildPath(ui).map((node) => (
                <Station
                  key={node.id}
                  node={node}
                  expanded={open === node.id}
                  onToggle={() => setOpen(open === node.id ? null : node.id)}
                  onStart={onStart}
                  activeRef={activeRef}
                />
              ))}
            </ol>
          </section>
        );
      })}
      <div className="course-end">
        <Mascot mood="sleep" size={110} />
        <p className="muted">Yangi liniyalar qurilmoqda. À bientôt !</p>
      </div>
      {guide && <GuideModal unit={guide} onClose={() => setGuide(null)} />}
    </div>
  );
}

function Station({
  node,
  expanded,
  onToggle,
  onStart,
  activeRef,
}: {
  node: PathNode;
  expanded: boolean;
  onToggle: () => void;
  onStart: (c: SessionConfig) => void;
  activeRef: React.RefObject<HTMLLIElement>;
}) {
  const { state, update } = useStore();
  const st = nodeState(state, node);
  const unit = COURSE[node.unitIndex];
  const [opened, setOpened] = useState<number | null>(null);
  const times = node.type === 'lesson' ? state.lessonsDone[node.id] ?? 0 : 0;
  const isNext = st === 'active' && node.type === 'lesson';

  const title = node.type === 'lesson' ? node.title : node.type === 'chest' ? "Sovg'a bekati" : 'Terminal: yakuniy takrorlash';
  const sub =
    node.type === 'lesson'
      ? st === 'done'
        ? `O'tilgan${times > 1 ? ` · ${times} marta` : ''}`
        : st === 'active'
          ? 'Keyingi bekat'
          : `${node.lessonIndex + 1}-dars`
      : node.type === 'chest'
        ? st === 'done'
          ? 'Ochilgan'
          : `${chestReward(node.id)} tagacha tanga`
        : st === 'locked'
          ? "Barcha bekatlardan o'ting"
          : st === 'done'
            ? 'Bajarilgan'
            : 'Ochiq · +15 ball';
  const icon = node.type === 'chest' ? (st === 'done' ? '📭' : '🎁') : node.type === 'review' ? '🏁' : st === 'done' ? '✓' : st === 'locked' ? '' : '▶';

  const click = () => {
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
    <li className={`station ${st} st-${node.type} ${isNext ? 'next' : ''}`} ref={isNext ? activeRef : undefined}>
      <button type="button" className="st-row" onClick={click} aria-expanded={expanded}>
        <span className="st-dot">{icon}</span>
        <span className="st-label">
          <b>{title}</b>
          <small>{sub}</small>
        </span>
        {isNext && <span className="st-next">Shu yerdan</span>}
      </button>

      {opened !== null && (
        <div className="st-card">
          <p>
            🎁 Sovg'a ochildi: <b>+{opened} tanga</b>
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setOpened(null)}>
            Merci !
          </button>
        </div>
      )}

      {expanded && node.type === 'lesson' && (
        <div className="st-card">
          {st === 'locked' ? (
            <p className="muted">Bu bekatga yetish uchun oldingi darslarni tugating.</p>
          ) : (
            <>
              <div className="pop-words">
                {unit.lessons[node.lessonIndex].words.map((w) => (
                  <button key={w.fr} type="button" onClick={() => speak(w.fr, state.settings.ttsRate)}>
                    {w.emoji} {w.fr}
                  </button>
                ))}
              </div>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => onStart({ kind: 'lesson', lessonId: node.id })}>
                {st === 'done' ? 'Takrorlash · +10 ball' : 'Darsni boshlash · +10 ball'}
              </button>
            </>
          )}
        </div>
      )}
      {expanded && node.type === 'review' && (
        <div className="st-card">
          <p className="muted">{st === 'locked' ? 'Avval liniyadagi barcha darslarni tugating.' : "Bo'limdagi hamma so'z va gaplarni mustahkamlang."}</p>
          {st !== 'locked' && (
            <button type="button" className="btn btn-primary btn-lg" onClick={() => onStart({ kind: 'review', unitIndex: node.unitIndex })}>
              Takrorlashni boshlash · +15 ball
            </button>
          )}
        </div>
      )}
      {expanded && node.type === 'chest' && st !== 'active' && (
        <div className="st-card">
          <p className="muted">{st === 'done' ? "Bu sovg'a allaqachon ochilgan." : "Sovg'ani ochish uchun oldingi bekatlardan o'ting."}</p>
        </div>
      )}
    </li>
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
