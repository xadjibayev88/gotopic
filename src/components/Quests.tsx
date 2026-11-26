// Kunlik vazifalar kartasi va uzilgan seriyani tiklash taklifi.
import { useState } from 'react';
import { Ic } from './Icons';
import { CoinIcon } from './TopBarIcons';
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
                <Ic name="gift" size={15} /> {q.reward}
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

export function StreakRepair({ compact = false }: { compact?: boolean }) {
  const { state, update } = useStore();
  const { premium } = useAccount();
  if (!canRepairStreak(state) || !state.lostStreak) return null;
  const can = premium || state.gems >= STREAK_REPAIR_COST;
  return (
    <div className={`streak-repair ${compact ? 'compact' : ''}`}>
      <span className="sr-icon"><Ic name="flame" size={26} /></span>
      <div>
        <b>{state.lostStreak.value} kunlik seriya uzildi</b>
        <small className="muted">{compact ? `2 kun ichida tiklang${premium ? ' · bepul' : ''}` : `Ikki kun ichida tiklash mumkin${premium ? ' — Super uchun bepul' : ''}.`}</small>
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
        {premium ? 'Tiklash' : <><CoinIcon /> {STREAK_REPAIR_COST}</>}
      </button>
    </div>
  );
}

/** Turnir sahifasi uchun ixcham holat: nechta vazifa bajarilgani (papka sarlavhasida ko'rsatiladi). */
export function useQuestSummary() {
  const { state } = useStore();
  const d = todayDaily(state);
  const quests = dailyQuests(d.day, state.dailyGoal);
  const done = quests.filter((q) => d.claimed.includes(q.id)).length;
  return { done, total: quests.length, bonus: QUESTS_BONUS };
}
