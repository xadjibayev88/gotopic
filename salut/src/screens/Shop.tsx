import { useState } from 'react';
import { buyFreeze, buyHeartRefill, FREEZE_COST, HEART_REFILL_COST, MAX_FREEZES, MAX_HEARTS, msToNextHeart } from '../engine/game';
import { playSfx } from '../engine/audio';
import { useStore } from '../state/store';

export function Shop() {
  const { state, update } = useStore();
  const [toast, setToast] = useState<string | null>(null);
  const next = msToNextHeart(state);

  const buy = (fn: typeof buyFreeze, msg: string) => {
    const r = fn(state);
    if (!r) return;
    update(() => r);
    playSfx('chest', state.settings.sound);
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="page">
      <h1 className="page-title">Do'kon</h1>
      <div className="gem-balance">
        💎 <b>{state.gems}</b> olmos
      </div>

      <h2 className="section-title">Yuraklar</h2>
      <div className="shop-item">
        <div className="shop-icon">❤️</div>
        <div className="shop-body">
          <b>Yuraklarni to'ldirish</b>
          <small>
            {state.hearts}/{MAX_HEARTS} yurak
            {next !== null && ` · keyingisi ${Math.ceil(next / 60000)} daqiqada`}
          </small>
        </div>
        <button
          type="button"
          className="btn btn-gem"
          disabled={state.hearts >= MAX_HEARTS || state.gems < HEART_REFILL_COST}
          onClick={() => buy(buyHeartRefill, "Yuraklar to'ldirildi!")}
        >
          💎 {HEART_REFILL_COST}
        </button>
      </div>
      <div className="shop-item">
        <div className="shop-icon">♾️</div>
        <div className="shop-body">
          <b>Cheksiz yuraklar</b>
          <small>Xato qilsangiz ham yurak kamaymaydi (o'quv rejimi)</small>
        </div>
        <label className="switch">
          <input type="checkbox" checked={state.unlimitedHearts} onChange={(e) => update((s) => ({ ...s, unlimitedHearts: e.target.checked }))} />
          <span />
        </label>
      </div>

      <h2 className="section-title">Streak</h2>
      <div className="shop-item">
        <div className="shop-icon">🧊</div>
        <div className="shop-body">
          <b>Streak muzlatgich</b>
          <small>
            Bir kun dars qilmasangiz ham streak saqlanadi · {state.streakFreezes}/{MAX_FREEZES} jihozlangan
          </small>
        </div>
        <button
          type="button"
          className="btn btn-gem"
          disabled={state.streakFreezes >= MAX_FREEZES || state.gems < FREEZE_COST}
          onClick={() => buy(buyFreeze, 'Muzlatgich jihozlandi!')}
        >
          💎 {FREEZE_COST}
        </button>
      </div>
      <p className="muted small">Olmoslarni darslar, sandiqlar va liga g'alabalari orqali ishlang.</p>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
