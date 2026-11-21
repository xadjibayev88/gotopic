import { useEffect, useState } from 'react';
import { ACHIEVEMENTS, type Reward } from '../engine/game';
import { dayKey, addDays, WEEKDAYS_SHORT, parseDay } from '../engine/time';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import { Confetti } from '../components/Confetti';
import type { SessionConfig } from './Session';

type Step = 'summary' | 'streak' | 'achievements';

function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function Result({ reward, config, onDone }: { reward: Reward; config: SessionConfig; onDone: () => void }) {
  const { state } = useStore();
  const steps: Step[] = ['summary'];
  if (reward.streakExtended) steps.push('streak');
  if (reward.newAchievements.length) steps.push('achievements');
  const [i, setI] = useState(0);
  const step = steps[i];
  const xp = useCountUp(reward.xp);
  const next = () => (i + 1 < steps.length ? setI(i + 1) : onDone());

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Enter' && next();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const title = config.kind === 'lesson' ? 'Dars tugadi!' : config.kind === 'review' ? "Bo'lim takrorlandi!" : 'Mashq tugadi!';

  return (
    <div className="result">
      {step === 'summary' && (
        <>
          {reward.perfect && <Confetti />}
          <div className="result-hero">
            <Mascot mood="cheer" size={170} className="bounce-in" />
            <h1>{reward.perfect ? 'Mukammal!' : title}</h1>
            <p className="muted">{reward.perfect ? "Birorta ham xato qilmadingiz. C'est parfait !" : "Har bir dars sizni Parijga yaqinlashtiradi."}</p>
          </div>
          <div className="result-cards">
            <div className="rcard" style={{ ['--c' as string]: '#F5B400' }}>
              <div className="rcard-h">JAMI XP</div>
              <div className="rcard-v">⚡ {xp}</div>
            </div>
            <div className="rcard" style={{ ['--c' as string]: '#22C55E' }}>
              <div className="rcard-h">ANIQLIK</div>
              <div className="rcard-v">🎯 {reward.accuracy}%</div>
            </div>
            <div className="rcard" style={{ ['--c' as string]: '#2F6BFF' }}>
              <div className="rcard-h">OLMOS</div>
              <div className="rcard-v">💎 +{reward.gems}</div>
            </div>
          </div>
          {(reward.bonus.length > 0 || reward.heartBack || reward.goalReachedNow) && (
            <ul className="bonus-list">
              {reward.bonus.map((b) => (
                <li key={b.label}>
                  ✨ {b.label} <b>+{b.xp} XP</b>
                </li>
              ))}
              {reward.heartBack && <li>❤️ Mashq uchun +1 yurak</li>}
              {reward.goalReachedNow && <li>🎯 Kunlik maqsad bajarildi!</li>}
            </ul>
          )}
        </>
      )}

      {step === 'streak' && (
        <div className="result-hero">
          <div className="flame-big">🔥</div>
          <div className="streak-num">{state.streak}</div>
          <h1>kunlik streak!</h1>
          <WeekStrip />
          <p className="muted">{state.streak === 1 ? "Ajoyib boshlanish! Ertaga ham qaytib keling." : `Ketma-ket ${state.streak} kun o'qiyapsiz. To'xtamang!`}</p>
        </div>
      )}

      {step === 'achievements' && (
        <div className="result-hero">
          <Confetti />
          <h1>Yangi yutuq!</h1>
          <div className="ach-unlocked">
            {reward.newAchievements.map((id) => {
              const a = ACHIEVEMENTS.find((x) => x.id === id)!;
              return (
                <div key={id} className="ach-big bounce-in">
                  <div className="ach-icon">{a.icon}</div>
                  <b>{a.title}</b>
                  <span className="muted">{a.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="result-foot">
        <button type="button" className="btn btn-success btn-lg" onClick={next}>
          Davom etish
        </button>
      </div>
    </div>
  );
}

export function WeekStrip() {
  const { state } = useStore();
  const today = dayKey();
  const dow = (parseDay(today).getDay() + 6) % 7;
  const monday = addDays(today, -dow);
  return (
    <div className="week-strip">
      {WEEKDAYS_SHORT.map((d, i) => {
        const k = addDays(monday, i);
        const active = (state.xpByDay[k] ?? 0) > 0;
        const frozen = state.frozenDays.includes(k);
        return (
          <div key={d} className={`wd ${k === today ? 'today' : ''}`}>
            <span>{d}</span>
            <div className={`wd-dot ${active ? 'on' : frozen ? 'frozen' : ''}`}>{active ? '✓' : frozen ? '❄' : ''}</div>
          </div>
        );
      })}
    </div>
  );
}
