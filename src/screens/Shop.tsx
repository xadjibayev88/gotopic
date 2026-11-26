import { useState } from 'react';
import { Ic } from '../components/Icons';
import { CoinIcon } from '../components/TopBarIcons';
import { FishIcon } from '../components/TopBarIcons';
import { buyXpBoost, XP_BOOST_COST, XP_BOOST_MINUTES, buyFreeze, buyHeartRefill, FREEZE_COST, HEART_REFILL_COST, MAX_FREEZES, MAX_HEARTS, msToNextHeart } from '../engine/game';
import { playSfx } from '../engine/audio';
import { useStore } from '../state/store';
import { useAccount } from '../state/account';
import { SuperPage } from './Super';
import { RewardedButton } from '../components/RewardedButton';
import { ShopRail } from '../components/ShopRail';

export function Shop() {
  const { state, update } = useStore();
  const { premium } = useAccount();
  const [toast, setToast] = useState<string | null>(null);
  const next = msToNextHeart(state);

  const boostLeft = Math.max(0, state.xpBoostUntil - Date.now());
  const buy = (fn: typeof buyFreeze, msg: string): boolean => {
    const r = fn(state);
    if (!r) return false;
    update(() => r);
    playSfx('chest', state.settings.sound);
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
    return true;
  };

  return (
    <div className="page">
      <h1 className="page-title">Do'kon</h1>
      <SuperPage />
      <div className="gem-balance">
        <CoinIcon /> <b>{state.gems}</b> {'tanga'}
      </div>

      <h2 className="section-title">Do'kon rastasi</h2>
      <ShopRail
        items={[
          {
            id: 'coffee',
            icon: <FishIcon />,
            name: 'Vivi akvariumi',
            desc: "Xato qilganda baliqcha kamayadi. Akvariumni to'ldirsangiz, Vivi to'q — darslar to'xtovsiz davom etadi.",
            price: HEART_REFILL_COST,
            level: (premium || state.unlimitedHearts ? MAX_HEARTS : state.hearts) / MAX_HEARTS,
            levelLabel: premium || state.unlimitedHearts ? 'Cheksiz baliqcha ∞' : `${state.hearts}/${MAX_HEARTS} baliqcha${next !== null ? ` · keyingisi ${Math.ceil(next / 60000)} daqiqada` : ''}`,
            color: '#0369a1',
            color2: '#38bdf8',
            canBuy: !premium && !state.unlimitedHearts && state.hearts < MAX_HEARTS && state.gems >= HEART_REFILL_COST,
            whyNot: premium || state.unlimitedHearts || state.hearts >= MAX_HEARTS ? "Akvarium to'la" : 'Tanga yetmaydi',
            buy: () => buy(buyHeartRefill, "Akvarium to'ldi! Vivi xursand 🐟"),
          },
          {
            id: 'xp',
            icon: <Ic name="bolt" size={30} />,
            name: 'Ikki barobar XP',
            desc: `${XP_BOOST_MINUTES} daqiqa davomida har bir dars va suhbat uchun 2x XP. Turnirda tez ko'tarilish uchun.`,
            price: XP_BOOST_COST,
            level: boostLeft / (XP_BOOST_MINUTES * 60_000),
            levelLabel: boostLeft > 0 ? `Faol — ${Math.ceil(boostLeft / 60000)} daqiqa qoldi` : 'Hozir faol emas',
            color: '#eab308',
            color2: '#fde047',
            canBuy: state.gems >= XP_BOOST_COST,
            whyNot: 'Tanga yetmaydi',
            buy: () => buy((s) => buyXpBoost(s), '2x XP yoqildi! ⚡'),
          },
          {
            id: 'freeze',
            icon: <Ic name="shield" size={30} />,
            name: 'Seriya soyaboni',
            desc: 'Bir kun dars qilmasangiz ham kunlik seriyangiz saqlanib qoladi.',
            price: FREEZE_COST,
            level: state.streakFreezes / MAX_FREEZES,
            levelLabel: `${state.streakFreezes}/${MAX_FREEZES} jihozlangan`,
            color: '#0284c7',
            color2: '#7dd3fc',
            canBuy: state.streakFreezes < MAX_FREEZES && state.gems >= FREEZE_COST,
            whyNot: state.streakFreezes >= MAX_FREEZES ? "Soyabonlar to'liq" : 'Tanga yetmaydi',
            buy: () => buy(buyFreeze, 'Soyabon tayyor!'),
          },
        ]}
      />
      {!premium && <RewardedButton />}
      {!premium && <RewardedButton kind="xp" />}
      <p className="muted small">Tangalarni darslar, sovg'alar va turnir g'alabalari orqali ishlang.</p>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
