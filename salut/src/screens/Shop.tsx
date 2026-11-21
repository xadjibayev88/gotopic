import { useState } from 'react';
import { buyXpBoost, XP_BOOST_COST, XP_BOOST_MINUTES, buyFreeze, buyHeartRefill, FREEZE_COST, HEART_REFILL_COST, MAX_FREEZES, MAX_HEARTS, msToNextHeart } from '../engine/game';
import { playSfx } from '../engine/audio';
import { useStore } from '../state/store';
import { useAccount } from '../state/account';
import { SuperPage } from './Super';
import { RewardedButton } from '../components/RewardedButton';

export function Shop() {
  const { state, update } = useStore();
  const { premium } = useAccount();
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
      <SuperPage />
      <div className="gem-balance">
        🪙 <b>{state.gems}</b> tanga
      </div>

      <h2 className="section-title">Kofe</h2>
      <div className="shop-item">
        <div className="shop-icon">☕</div>
        <div className="shop-body">
          <b>Kofe termosini to'ldirish</b>
          <small>
            {state.hearts}/{MAX_HEARTS} chashka
            {next !== null && ` · keyingisi ${Math.ceil(next / 60000)} daqiqada`}
          </small>
        </div>
        <button
          type="button"
          className="btn btn-gem"
          disabled={state.hearts >= MAX_HEARTS || state.gems < HEART_REFILL_COST}
          onClick={() => buy(buyHeartRefill, "Termos to'ldi! Bon appétit !")}
        >
          🪙 {HEART_REFILL_COST}
        </button>
      </div>
      {!premium && <RewardedButton />}

      <h2 className="section-title">Kuchaytirgichlar</h2>
      <div className="shop-item">
        <div className="shop-icon">⚡</div>
        <div className="shop-body">
          <b>Ikki barobar ball</b>
          <small>
            {state.xpBoostUntil > Date.now()
              ? `Faol — ${Math.ceil((state.xpBoostUntil - Date.now()) / 60000)} daqiqa qoldi`
              : `${XP_BOOST_MINUTES} daqiqa davomida har bir dars va suhbat uchun 2x ball`}
          </small>
        </div>
        <button type="button" className="btn btn-gem" disabled={state.gems < XP_BOOST_COST} onClick={() => buy((s) => buyXpBoost(s), '2x ball yoqildi! ⚡')}>
          🪙 {XP_BOOST_COST}
        </button>
      </div>

      <h2 className="section-title">Kunlik seriya</h2>
      <div className="shop-item">
        <div className="shop-icon">⛱️</div>
        <div className="shop-body">
          <b>Seriya soyaboni</b>
          <small>
            Bir kun dars qilmasangiz ham seriya saqlanadi · {state.streakFreezes}/{MAX_FREEZES} jihozlangan
          </small>
        </div>
        <button
          type="button"
          className="btn btn-gem"
          disabled={state.streakFreezes >= MAX_FREEZES || state.gems < FREEZE_COST}
          onClick={() => buy(buyFreeze, 'Soyabon tayyor!')}
        >
          🪙 {FREEZE_COST}
        </button>
      </div>
      <p className="muted small">Tangalarni darslar, sovg'alar va turnir g'alabalari orqali ishlang.</p>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
