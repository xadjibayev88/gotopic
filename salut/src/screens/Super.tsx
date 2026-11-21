// Salut Super: obuna sahifasi (Payme / Click) va obunachi holati.
import { useEffect, useState } from 'react';
import { accountApi, useAccount } from '../state/account';
import { AuthScreen } from './Auth';
import { Confetti } from '../components/Confetti';

const PERKS = [
  ['☕', 'Cheksiz kofe', "Xato qilsangiz ham darsdan chiqib ketmaysiz"],
  ['🚫', "Reklamasiz", "Darslar va Krua bilan suhbat orasida reklama yo'q"],
  ['🎙️', 'Krua bilan cheksiz suhbat', "30 daqiqalik sessiyalar, dam olish kutilmaydi"],
  ['☀️', 'Seriyani bepul tiklash', "Uzilgan seriyani 2 kun ichida tangasiz tiklaysiz"],
  ['⛱️', 'Har oy bepul seriya soyaboni', "Bir kunlik tanaffusda ham seriyangiz saqlanadi"],
];

const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/,/g, ' ');

export function SuperPage({ onClose }: { onClose?: () => void }) {
  const { me, premium, refresh } = useAccount();
  const [plan, setPlan] = useState<'month' | 'year'>('year');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needAuth, setNeedAuth] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const plans = me.billing.plans;
  const month = plans.find((p) => p.id === 'month');
  const year = plans.find((p) => p.id === 'year');
  const saving = month && year ? Math.round((1 - year.uzs / (month.uzs * 12)) * 100) : 0;

  // To'lovdan qaytganda (#/shop?paid=ID) — buyurtma holatini tekshirib boramiz.
  useEffect(() => {
    const m = /[?&]paid=(\d+)/.exec(location.hash);
    if (!m) return;
    let tries = 0;
    let stop = false;
    const tick = async () => {
      const r = await accountApi<{ status?: string }>(`billing/order?id=${m[1]}`);
      if (stop) return;
      if (r.ok && r.body.status === 'paid') {
        await refresh();
        setCelebrate(true);
        history.replaceState(null, '', '#/shop');
        return;
      }
      if (++tries < 20 && (!r.ok || r.body.status === 'pending')) setTimeout(tick, 3000);
    };
    void tick();
    return () => {
      stop = true;
    };
  }, [refresh]);

  const pay = async (provider: 'payme' | 'click') => {
    if (!me.user) return setNeedAuth(true);
    setBusy(provider);
    setError(null);
    const r = await accountApi<{ payUrl?: string; message?: string }>('billing/order', { method: 'POST', body: JSON.stringify({ plan, provider }) });
    setBusy(null);
    if (!r.ok || !r.body.payUrl) return setError(r.body.message ?? "To'lovni boshlab bo'lmadi");
    location.href = r.body.payUrl;
  };

  if (needAuth) {
    return (
      <div className="page">
        <AuthScreen initial="register" title="Obuna uchun profil yarating" onDone={() => setNeedAuth(false)} onSkip={() => setNeedAuth(false)} />
      </div>
    );
  }

  if (premium) {
    return (
      <div className="super super-active">
        {celebrate && <Confetti />}
        <div className="super-badge">SUPER</div>
        <h2>{celebrate ? "Tabriklaymiz! Siz endi Super a'zosisiz" : "Siz Super a'zosisiz"}</h2>
        <p className="muted">
          {me.plan === 'year' ? 'Yillik' : 'Oylik'} obuna · {me.expiresAt ? `${new Date(me.expiresAt).toLocaleDateString('uz-UZ')} gacha` : ''}
        </p>
        <ul className="super-perks">
          {PERKS.map(([i, t]) => (
            <li key={t}>
              <span>{i}</span>
              <b>{t}</b>
              <em>✓</em>
            </li>
          ))}
        </ul>
        {onClose && (
          <button type="button" className="btn btn-primary btn-lg" onClick={onClose}>
            Davom etish
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="super">
      <div className="super-badge">SUPER</div>
      <h2>Tezroq o'rganing — cheklovlarsiz</h2>
      <ul className="super-perks">
        {PERKS.map(([i, t, d]) => (
          <li key={t}>
            <span>{i}</span>
            <div>
              <b>{t}</b>
              <small>{d}</small>
            </div>
          </li>
        ))}
      </ul>

      {plans.length > 0 && (
        <div className="super-plans" role="radiogroup" aria-label="Tarif">
          {year && (
            <button type="button" role="radio" aria-checked={plan === 'year'} className={`plan ${plan === 'year' ? 'on' : ''}`} onClick={() => setPlan('year')}>
              {saving > 0 && <span className="plan-tag">−{saving}%</span>}
              <b>12 oy</b>
              <span className="plan-price">{fmt(year.uzs)} so'm</span>
              <small className="muted">oyiga {fmt(Math.round(year.uzs / 12 / 100) * 100)} so'm</small>
            </button>
          )}
          {month && (
            <button type="button" role="radio" aria-checked={plan === 'month'} className={`plan ${plan === 'month' ? 'on' : ''}`} onClick={() => setPlan('month')}>
              <b>1 oy</b>
              <span className="plan-price">{fmt(month.uzs)} so'm</span>
              <small className="muted">har oy</small>
            </button>
          )}
        </div>
      )}

      {me.billing.providers.length > 0 ? (
        <div className="pay-buttons">
          {me.billing.providers.includes('payme') && (
            <button type="button" className="btn btn-pay payme" disabled={!!busy} onClick={() => pay('payme')}>
              {busy === 'payme' ? 'Kuting…' : "Payme orqali to'lash"}
            </button>
          )}
          {me.billing.providers.includes('click') && (
            <button type="button" className="btn btn-pay click" disabled={!!busy} onClick={() => pay('click')}>
              {busy === 'click' ? 'Kuting…' : "Click orqali to'lash"}
            </button>
          )}
        </div>
      ) : (
        <p className="vh-note">To'lov tizimi tez orada ulanadi.</p>
      )}
      {error && <p className="auth-error">{error}</p>}
      <p className="super-fine muted">Uzcard, Humo va Visa kartalari. Obuna avtomatik yangilanmaydi — muddati tugagach qayta to'laysiz.</p>
    </div>
  );
}
