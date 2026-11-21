// Kunlik vazifalar kartasi va uzilgan seriyani tiklash taklifi.
import { useState } from 'react';
import { canRepairStreak, claimQuest, dailyQuests, QUESTS_BONUS, repairStreak, STREAK_REPAIR_COST, todayDaily } from '../engine/game';
import { playSfx } from '../engine/audio';
import { useStore } from '../state/store';
import { useAccount } from '../state/account';

export function QuestsCard({ compact = false }: { compact?: boolean }) {
  const { state, update } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const d = todayDaily(state);
  const quests = dailyQuests(d.day, state.dailyGoal);
  const allDone = quests.every((q) => d.claimed.includes(q.id));

  const claim = (id: string) => {
    const r = claimQuest(state, id);
    if (!r.gems) return;
    update(() => r.state);
    playSfx('chest', state.settings.sound);
    setToast(`+${r.gems} tanga 🪙`);
    setTimeout(() => setToast(null), 1600);
  };

  return (
    <div className={`quests ${compact ? 'compact' : ''}`}>
      <div className="quests-head">
        <b>Kunlik vazifalar</b>
        <small className="muted">yarim tunda yangilanadi</small>
      </div>
      {quests.map((q) => {
        const v = Math.min(q.goal, q.value(d));
        const done = v >= q.goal;
        const claimed = d.claimed.includes(q.id);
        return (
          <div key={q.id} className={`quest ${claimed ? 'claimed' : done ? 'done' : ''}`}>
            <span className="quest-icon">{q.icon}</span>
            <div className="quest-body">
              <span>{q.title}</span>
              <div className="quest-bar">
                <i style={{ width: `${(v / q.goal) * 100}%` }} />
                <em>
                  {v} / {q.goal}
                </em>
              </div>
            </div>
            {claimed ? (
              <span className="quest-ok">✓</span>
            ) : (
              <button type="button" className="quest-claim" disabled={!done} onClick={() => claim(q.id)} aria-label={`Sovg'ani olish: ${q.reward} tanga`}>
                🎁 {q.reward}
              </button>
            )}
          </div>
        );
      })}
      {!d.claimed.includes('all') && (
        <button type="button" className="quest-bonus" disabled={!allDone} onClick={() => claim('all')}>
          {allDone ? `🏆 Hammasi bajarildi — +${QUESTS_BONUS} tanga olish` : `🏆 Uchalasini bajarsangiz — +${QUESTS_BONUS} tanga`}
        </button>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export function StreakRepair() {
  const { state, update } = useStore();
  const { premium } = useAccount();
  if (!canRepairStreak(state) || !state.lostStreak) return null;
  const can = premium || state.gems >= STREAK_REPAIR_COST;
  return (
    <div className="streak-repair">
      <span className="sr-icon">☀️</span>
      <div>
        <b>{state.lostStreak.value} kunlik seriyangiz uzildi</b>
        <small className="muted">Ikki kun ichida tiklash mumkin{premium ? ' — Super uchun bepul' : ''}.</small>
      </div>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!can}
        onClick={() => {
          const r = repairStreak(state, premium);
          if (r) {
            update(() => r);
            playSfx('complete', state.settings.sound);
          }
        }}
      >
        {premium ? 'Tiklash' : `🪙 ${STREAK_REPAIR_COST}`}
      </button>
    </div>
  );
}
