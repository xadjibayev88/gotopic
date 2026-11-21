// Global holat: React context + localStorage'da saqlash.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initialState, tick, type GameState } from '../engine/game';

const KEY = 'salut.state.v1';

function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GameState>;
      if (parsed.version === 1) {
        const base = initialState();
        return { ...base, ...parsed, settings: { ...base.settings, ...parsed.settings }, league: { ...base.league, ...parsed.league } } as GameState;
      }
    }
  } catch {
    /* buzilgan ma'lumot — yangidan boshlaymiz */
  }
  return initialState();
}

function save(s: GameState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* xotira to'la yoki bloklangan */
  }
}

interface Store {
  state: GameState;
  update: (fn: (s: GameState) => GameState) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => tick(load()));

  useEffect(() => save(state), [state]);

  useEffect(() => {
    const id = window.setInterval(() => setState((s) => tick(s)), 30_000);
    const onVis = () => document.visibilityState === 'visible' && setState((s) => tick(s));
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const update = useCallback((fn: (s: GameState) => GameState) => setState((s) => fn(s)), []);
  const reset = useCallback(() => setState(initialState()), []);
  const value = useMemo(() => ({ state, update, reset }), [state, update, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider topilmadi');
  return s;
}
