// «Qasos rejimi» — ovozli suhbat paytidagi multfilm uslubidagi mini-o'yin:
// Vivi aytgan hamma gaplari uchun undan «o'ch olasiz». Qurollar g'ildiragi, sog'liq chizig'i,
// qidiruv yulduzlari, nokaut va qayta tirilish. Hammasi original (kod, nom, dizayn).
import { useCallback, useEffect, useRef, useState } from 'react';
import { playSfx, vibrate, type Sfx } from '../engine/audio';

export interface Weapon {
  id: string;
  icon: string;
  name: string;
  dmg: number;
  /** Ikki zarba orasidagi minimal vaqt (ms). */
  rate: number;
  sfx: Sfx;
  heavy?: boolean;
}

export const WEAPONS: Weapon[] = [
  { id: 'mic', icon: '🎤', name: 'Mikrofon', dmg: 8, rate: 600, sfx: 'whack' },
  { id: 'fist', icon: '👊', name: 'Musht', dmg: 10, rate: 330, sfx: 'hit' },
  { id: 'bat', icon: '🏏', name: 'Kaltak', dmg: 18, rate: 700, sfx: 'whack' },
  { id: 'pistol', icon: '🔫', name: "To'pponcha", dmg: 12, rate: 250, sfx: 'shot' },
  { id: 'shotgun', icon: '💥', name: 'Miltiq', dmg: 34, rate: 1100, sfx: 'shot', heavy: true },
  { id: 'rocket', icon: '🚀', name: 'Granatomyot', dmg: 70, rate: 2200, sfx: 'boom', heavy: true },
];

export const MAX_HP = 200;

type Pop = { id: number; x: number; y: number; dmg: number; kind: string };

export function useRevenge(enabled: boolean, sound: boolean) {
  const [weapon, setWeapon] = useState<Weapon>(WEAPONS[1]);
  const [hp, setHp] = useState(MAX_HP);
  const [stars, setStars] = useState(0);
  const [ko, setKo] = useState<'down' | 'respawn' | null>(null);
  const [wheel, setWheel] = useState(false);
  const [pops, setPops] = useState<Pop[]>([]);
  const [shake, setShake] = useState(0);
  const last = useRef(0);
  const heat = useRef(0);
  const lastHit = useRef(0);
  const seq = useRef(0);

  // Qidiruv yulduzlari: zarba qizitadi, jimlikda sekin pasayadi.
  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => {
      if (Date.now() - lastHit.current > 6000 && heat.current > 0) {
        heat.current = Math.max(0, heat.current - 40);
        setStars(Math.min(5, Math.floor(heat.current / 60)));
      }
    }, 1500);
    return () => clearInterval(t);
  }, [enabled]);

  const fire = useCallback(
    (x = 0.5, y = 0.45) => {
      if (!enabled || ko) return;
      const now = Date.now();
      if (now - last.current < weapon.rate) return;
      last.current = now;
      lastHit.current = now;
      const spread = weapon.id === 'shotgun' ? 5 : 1;
      const dmg = Math.round(weapon.dmg * (0.85 + Math.random() * 0.3));
      if (sound) playSfx(weapon.sfx);
      vibrate(weapon.heavy ? [30, 30, 60] : 20);
      const add: Pop[] = Array.from({ length: spread }, (_, i) => ({
        id: ++seq.current,
        x: Math.min(0.9, Math.max(0.1, x + (spread > 1 ? (Math.random() - 0.5) * 0.35 : 0))),
        y: Math.min(0.85, Math.max(0.1, y + (spread > 1 ? (Math.random() - 0.5) * 0.3 : 0))),
        dmg: i === 0 ? dmg : 0,
        kind: weapon.id,
      }));
      setPops((p) => [...p.slice(-14), ...add]);
      add.forEach((a) => setTimeout(() => setPops((p) => p.filter((q) => q.id !== a.id)), 900));
      if (weapon.heavy) setShake((k) => k + 1);
      heat.current = Math.min(400, heat.current + dmg);
      setStars(Math.min(5, Math.floor(heat.current / 60)));
      setHp((h) => {
        const n = Math.max(0, h - dmg);
        if (n === 0 && h > 0) {
          setKo('down');
          if (sound) setTimeout(() => playSfx('wrong'), 250);
          setTimeout(() => setKo('respawn'), 2600);
          setTimeout(() => {
            setKo(null);
            setHp(MAX_HP);
          }, 4600);
        }
        return n;
      });
    },
    [enabled, ko, weapon, sound],
  );

  // Klaviatura: Q — qurollar g'ildiragi, F — urish, 1–6 — qurol tanlash.
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return;
      const k = e.key.toLowerCase();
      if (k === 'q') setWheel((w) => !w);
      else if (k === 'f') fire(0.5, 0.4 + Math.random() * 0.15);
      else if (/^[1-6]$/.test(k)) setWeapon(WEAPONS[Number(k) - 1]);
      else if (k === 'escape') setWheel(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, fire]);

  return { weapon, setWeapon, hp, stars, ko, wheel, setWheel, pops, shake, fire };
}

export type Revenge = ReturnType<typeof useRevenge>;

/** Yuqoridagi HUD: qurol, Vivi sog'lig'i, qidiruv darajasi. */
export function RevengeHud({ g }: { g: Revenge }) {
  const pct = (g.hp / MAX_HP) * 100;
  return (
    <div className="rv-hud" role="status" aria-label={`Qurol: ${g.weapon.name}. Vivi sog'lig'i: ${MAX_HP} dan ${g.hp}. Qidiruv darajasi: 5 dan ${g.stars}.`}>
      <button type="button" className="rv-weapon" onClick={() => g.setWheel(true)} aria-label="Qurollar g'ildiragini ochish">
        <span>{g.weapon.icon}</span>
        <small>{g.weapon.name}</small>
      </button>
      <div className="rv-bars">
        <div className="rv-hp">
          <i style={{ width: `${pct}%` }} className={pct < 30 ? 'low' : ''} />
        </div>
        <div className="rv-stars" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <b key={i} className={i < g.stars ? 'on' : ''}>
              ★
            </b>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Zarba effektlari, nokaut yozuvi va qurollar g'ildiragi. */
export function RevengeOverlay({ g }: { g: Revenge }) {
  return (
    <>
      <div className="rv-pops" aria-hidden="true">
        {g.pops.map((p) => (
          <span key={p.id} className={`rv-pop k-${p.kind}`} style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}>
            <i className="burst" />
            {p.dmg > 0 && <b>-{p.dmg}</b>}
          </span>
        ))}
      </div>
      {g.ko === 'down' && <div className="rv-ko">NOKAUT!</div>}
      {g.ko === 'respawn' && <div className="rv-respawn">Vivi o'rnidan turmoqda…</div>}
      {g.wheel && (
        <div className="rv-wheel-back" onClick={() => g.setWheel(false)}>
          <div className="rv-wheel" role="dialog" aria-label="Qurollar" onClick={(e) => e.stopPropagation()}>
            {WEAPONS.map((w, i) => {
              const a = (i / WEAPONS.length) * Math.PI * 2 - Math.PI / 2;
              return (
                <button
                  key={w.id}
                  type="button"
                  className={`rv-slot ${w.id === g.weapon.id ? 'on' : ''}`}
                  style={{ left: `${50 + Math.cos(a) * 36}%`, top: `${50 + Math.sin(a) * 36}%` }}
                  onClick={() => {
                    g.setWeapon(w);
                    g.setWheel(false);
                  }}
                >
                  <span>{w.icon}</span>
                  <small>{w.name}</small>
                </button>
              );
            })}
            <div className="rv-wheel-info">
              <b>{g.weapon.name}</b>
              <small>Zarar: {g.weapon.dmg}</small>
              <small>Otish tezligi: {Math.round(60000 / g.weapon.rate)}/daq</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
