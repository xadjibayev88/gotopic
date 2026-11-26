// Reklama (video) ko'rib mukofot: 🐟 baliqcha, ⭐ XP yoki 🐱 Vivi bilan qo'shimcha daqiqalar.
// Android ilovada — AdMob, saytda — AdSense mukofotli video. Super obunachilarga ko'rinmaydi.
import { useEffect, useState } from 'react';
import { AD_XP, grantAdXp, MAX_HEARTS } from '../engine/game';
import { onAdsChange, rewardedState, showRewarded, type RewardKind } from '../engine/ads';
import { accountApi } from '../state/account';
import { useStore } from '../state/store';

const TEXT: Record<RewardKind, { icon: string; title: string; sub: (left: number) => string; done: string }> = {
  coffee: { icon: '🎬', title: "Reklama ko'rib baliqcha olish", sub: (l) => `Qisqa video — +1 baliqcha · bugun ${l} ta qoldi`, done: '+1 baliqcha kofe ☕' },
  xp: { icon: '⭐', title: `Video ko'rib +${AD_XP} XP`, sub: (l) => `Turnirda oldinga chiqing · bugun ${l} ta qoldi`, done: `+${AD_XP} XP ⭐` },
  vivi: { icon: '🐱', title: "Video ko'rib Vivi bilan +2 daqiqa", sub: (l) => `Bepul vaqt tugasa ham gaplashing · bugun ${l} ta qoldi`, done: "Vivi bilan +2 daqiqa qo'shildi 🎉" },
};

export function RewardedButton({ compact = false, onGranted, kind = 'coffee', viviLeft }: { compact?: boolean; onGranted?: () => void; kind?: RewardKind; viviLeft?: number }) {
  const { state, update } = useStore();
  const [, force] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const off = onAdsChange(() => force((n) => n + 1));
    return () => {
      off();
    };
  }, []);
  const rs = rewardedState(kind);
  if (!rs.available) return null;
  const left = kind === 'vivi' ? viviLeft ?? 0 : rs.left;
  const full = kind === 'coffee' && state.hearts >= MAX_HEARTS;
  const t = TEXT[kind];

  const run = async () => {
    setBusy(true);
    setMsg(null);
    // Vivi daqiqalari: server avval bir martalik chipta beradi (reklamani ko'rmasdan mukofot olib bo'lmasin).
    let nonce = '';
    const startedAt = Date.now();
    if (kind === 'vivi') {
      const st = await accountApi<{ nonce?: string; message?: string }>('reward/start', { method: 'POST', body: '{}' });
      if (!st.ok || !st.body.nonce) {
        setBusy(false);
        return setMsg(st.body.message ?? "Hozir mukofot berib bo'lmaydi");
      }
      nonce = st.body.nonce;
    }
    const r = await showRewarded(kind);
    if (r.ok && kind === 'vivi') {
      const wait = 15_500 - (Date.now() - startedAt);
      if (wait > 0) await new Promise((res) => setTimeout(res, wait));
      const g = await accountApi<{ ok?: boolean; message?: string }>('reward/vivi', { method: 'POST', body: JSON.stringify({ nonce }) });
      setBusy(false);
      if (!g.ok) return setMsg(g.body.message ?? "Mukofotni qo'shib bo'lmadi");
      setMsg(t.done);
      onGranted?.();
      return;
    }
    setBusy(false);
    if (r.ok) {
      if (kind === 'coffee') update((s) => ({ ...s, hearts: Math.min(MAX_HEARTS, s.hearts + 1), heartsUpdatedAt: s.hearts + 1 >= MAX_HEARTS ? Date.now() : s.heartsUpdatedAt }));
      else update((s) => grantAdXp(s));
      setMsg(t.done);
      onGranted?.();
    } else setMsg(r.reason === 'limit' ? 'Bugungi limit tugadi' : r.reason === 'not_finished' ? "Baliqcha olish uchun videoni oxirigacha ko'ring" : "Hozir reklama yo'q — birozdan so'ng urinib ko'ring");
  };

  return (
    <div className={`shop-item rewarded rw-${kind} ${compact ? 'compact' : ''}`}>
      <div className="shop-icon">{t.icon}</div>
      <div className="shop-body">
        <b>{t.title}</b>
        <small>{msg ?? t.sub(left)}</small>
      </div>
      <button type="button" className="btn btn-gem" disabled={busy || full || left <= 0} onClick={run}>
        {busy ? '…' : full ? "To'la" : 'Ko\'rish'}
      </button>
    </div>
  );
}
