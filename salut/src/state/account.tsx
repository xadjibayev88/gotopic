// Hisob holati: foydalanuvchi, obuna (Super), Google sozlamasi va progressni server bilan sinxronlash.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { initialState, type GameState } from '../engine/game';
import { useStore } from './store';

export interface AccountUser {
  id: string;
  email: string | null;
  name: string;
  avatar: string | null;
  provider: 'email' | 'google';
}

export interface BillingInfo {
  plans: { id: 'month' | 'year'; name: string; uzs: number; days: number; period: string }[];
  providers: ('payme' | 'click')[];
}

interface Me {
  user: AccountUser | null;
  plan: 'free' | 'month' | 'year';
  expiresAt: number | null;
  googleClientId: string | null;
  billing: BillingInfo;
}

interface AccountCtx {
  me: Me;
  loaded: boolean;
  online: boolean;
  premium: boolean;
  refresh: () => Promise<void>;
  signIn: (kind: 'login' | 'register', email: string, password: string, name?: string) => Promise<string | null>;
  signInGoogle: (credential: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
}

const EMPTY: Me = { user: null, plan: 'free', expiresAt: null, googleClientId: null, billing: { plans: [], providers: [] } };
const Ctx = createContext<AccountCtx | null>(null);
const STAMP = 'salut.state.updatedAt';

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: T }> {
  try {
    const res = await fetch(`./api/${path}`, {
      credentials: 'include',
      ...init,
      headers: { ...(init?.body ? { 'content-type': 'application/json' } : {}), ...init?.headers },
    });
    const body = (await res.json().catch(() => ({}))) as T;
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: {} as T };
  }
}

const stamp = () => {
  try {
    return Number(localStorage.getItem(STAMP)) || 0;
  } catch {
    return 0;
  }
};
const setStamp = (t: number) => {
  try {
    localStorage.setItem(STAMP, String(t));
  } catch {
    /* e'tiborsiz */
  }
};

export function AccountProvider({ children }: { children: ReactNode }) {
  const { state, update } = useStore();
  const [me, setMe] = useState<Me>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [online, setOnline] = useState(true);
  const syncing = useRef(false);
  const lastPushed = useRef<string>('');
  const ready = useRef(false);

  const refresh = useCallback(async () => {
    const r = await api<Me>('me');
    setOnline(r.status !== 0);
    if (r.ok) setMe({ ...EMPTY, ...r.body });
    setLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Kirgandan so'ng: serverdagi va qurilmadagi progressni solishtiramiz (yangisi yutadi).
  const pull = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    const r = await api<{ state: GameState | null; updatedAt: number }>('progress');
    if (r.ok) {
      if (r.body.state && r.body.updatedAt > stamp()) {
        const base = initialState();
        const s = r.body.state;
        update(() => ({ ...base, ...s, settings: { ...base.settings, ...s.settings }, league: { ...base.league, ...s.league }, onboarded: true }));
        setStamp(r.body.updatedAt);
        lastPushed.current = JSON.stringify(s);
      } else {
        lastPushed.current = '';
      }
    }
    ready.current = true;
    syncing.current = false;
  }, [update]);

  useEffect(() => {
    if (me.user) void pull();
    else ready.current = false;
  }, [me.user, pull]);

  // Progress o'zgarganda (4 s kechikish bilan) serverga yuboriladi.
  useEffect(() => {
    if (!me.user || !ready.current || !state.onboarded) return;
    const json = JSON.stringify(state);
    if (json === lastPushed.current) return;
    const t = setTimeout(async () => {
      const updatedAt = Date.now();
      const r = await api<{ server?: { state: GameState; updatedAt: number } }>('progress', { method: 'PUT', body: JSON.stringify({ state, updatedAt }) });
      if (r.ok) {
        lastPushed.current = json;
        setStamp(updatedAt);
      } else if (r.status === 409) void pull();
    }, 4000);
    return () => clearTimeout(t);
  }, [state, me.user, pull]);

  const afterAuth = async (r: { ok: boolean; status: number; body: { message?: string } }) => {
    if (!r.ok) return r.body.message ?? (r.status === 0 ? "Internetga ulanib bo'lmadi" : 'Xatolik yuz berdi');
    await refresh();
    return null;
  };

  const signIn = useCallback(
    async (kind: 'login' | 'register', email: string, password: string, name?: string) =>
      afterAuth(await api<{ message?: string }>(`auth/${kind}`, { method: 'POST', body: JSON.stringify({ email, password, name }) })),
    [refresh], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const signInGoogle = useCallback(
    async (credential: string) => afterAuth(await api<{ message?: string }>('auth/google', { method: 'POST', body: JSON.stringify({ credential }) })),
    [refresh], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const signOut = useCallback(async () => {
    await api('auth/logout', { method: 'POST' });
    try {
      (window as unknown as { google?: { accounts?: { id?: { disableAutoSelect?: () => void } } } }).google?.accounts?.id?.disableAutoSelect?.();
    } catch {
      /* e'tiborsiz */
    }
    await refresh();
  }, [refresh]);
  const deleteAccount = useCallback(async () => {
    const r = await api('account', { method: 'DELETE' });
    await refresh();
    return r.ok;
  }, [refresh]);

  const premium = me.plan !== 'free' && (!me.expiresAt || me.expiresAt > Date.now());
  useEffect(() => {
    (window as unknown as { SalutPremium?: boolean }).SalutPremium = premium;
    window.dispatchEvent(new CustomEvent('salut:premium', { detail: premium }));
  }, [premium]);

  return <Ctx.Provider value={{ me, loaded, online, premium, refresh, signIn, signInGoogle, signOut, deleteAccount }}>{children}</Ctx.Provider>;
}

export function useAccount(): AccountCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('AccountProvider topilmadi');
  return c;
}

export { api as accountApi };
