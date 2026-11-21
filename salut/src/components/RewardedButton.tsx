// "Reklama ko'rib 1 chashka kofe olish" — faqat Android ilovada (AdMob), Super bo'lmaganlarga.
import { useEffect, useState } from 'react';
import { MAX_HEARTS } from '../engine/game';
import { onAdsChange, rewardedState, showRewarded } from '../engine/ads';
import { useStore } from '../state/store';

export function RewardedButton({ compact = false, onGranted }: { compact?: boolean; onGranted?: () => void }) {
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
  const rs = rewardedState();
  if (!rs.available) return null;
  const full = state.hearts >= MAX_HEARTS;

  const run = async () => {
    setBusy(true);
    setMsg(null);
    const r = await showRewarded();
    setBusy(false);
    if (r.ok) {
      update((s) => ({ ...s, hearts: Math.min(MAX_HEARTS, s.hearts + 1), heartsUpdatedAt: s.hearts + 1 >= MAX_HEARTS ? Date.now() : s.heartsUpdatedAt }));
      setMsg('+1 chashka kofe ☕');
      onGranted?.();
    } else setMsg(r.reason === 'limit' ? 'Bugungi limit tugadi' : r.reason === 'not_finished' ? "Kofe olish uchun videoni oxirigacha ko'ring" : "Hozir reklama yo'q — birozdan so'ng urinib ko'ring");
  };

  return (
    <div className={`shop-item rewarded ${compact ? 'compact' : ''}`}>
      <div className="shop-icon">🎬</div>
      <div className="shop-body">
        <b>Reklama ko'rib kofe olish</b>
        <small>{msg ?? `Qisqa video — +1 chashka · bugun ${rs.left} ta qoldi`}</small>
      </div>
      <button type="button" className="btn btn-gem" disabled={busy || full || rs.left <= 0} onClick={run}>
        {busy ? '…' : full ? "To'la" : 'Ko\'rish'}
      </button>
    </div>
  );
}
