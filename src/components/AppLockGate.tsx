// Ilova qulfi darvozasi: PIN qo'yilgan bo'lsa, ilova ochilganda va 5 daqiqadan ko'p yashirin turgandan keyin
// LockScreen ko'rsatiladi; qulf ochilmaguncha ilova tarkibi umuman chizilmaydi.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { clearPin, hasPin, lockedForMs, RELOCK_AFTER_MS, verifyPin } from '../engine/applock';
import { LockScreen } from './PinLock';
import { useAccount } from '../state/account';
import { useStore } from '../state/store';

function waitText(ms: number): string {
  const s = Math.ceil(ms / 1000);
  return s >= 60 ? `${Math.ceil(s / 60)} daqiqa` : `${s} soniya`;
}

export function AppLockGate({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState(hasPin);
  const hiddenAt = useRef<number | null>(null);
  const { me, signOut } = useAccount();
  const { reset } = useStore();

  useEffect(() => {
    const on = () => {
      if (document.visibilityState === 'hidden') hiddenAt.current = Date.now();
      else if (hiddenAt.current !== null) {
        if (hasPin() && Date.now() - hiddenAt.current > RELOCK_AFTER_MS) setLocked(true);
        hiddenAt.current = null;
      }
    };
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  const verify = useCallback(async (pin: string): Promise<true | string> => {
    const wait = lockedForMs();
    if (wait) return `Juda ko'p urinish. ${waitText(wait)}dan keyin qayta urining.`;
    const r = await verifyPin(pin);
    if (r.ok) return true;
    return r.waitMs ? `Noto'g'ri PIN. ${waitText(r.waitMs)} kuting.` : `Noto'g'ri PIN. Qayta urinib ko'ring.`;
  }, []);

  const forgot = useCallback(async () => {
    const text = me.user
      ? "PIN o'chiriladi va hisobingizdan chiqasiz. Qayta kirsangiz, progressingiz serverdan tiklanadi. Davom etamizmi?"
      : "Siz mehmon sifatida o'qiyapsiz: PIN o'chirilsa, shu qurilmadagi progress ham o'chadi (boshqalar ko'rmasligi uchun). Davom etamizmi?";
    if (!window.confirm(text)) return;
    if (me.user) await signOut();
    else reset();
    clearPin();
    setLocked(false);
  }, [me.user, signOut, reset]);

  if (locked) return <LockScreen verify={verify} onUnlock={() => setLocked(false)} onForgot={() => void forgot()} />;
  return <>{children}</>;
}
