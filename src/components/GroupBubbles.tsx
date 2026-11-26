// Guruh pufakchalari: ishtirokchilar XP'ga qarab o'lchamli doiralar bo'lib zich klasterga joylashadi
// (markazdan spiral bo'ylab — har doira eng yaqin bo'sh joyga). Siz — gradient halqa bilan.
import { useMemo, type CSSProperties } from 'react';
import { Avatar } from './Avatar';
import type { LeagueRow } from '../engine/game';

export interface Bubble {
  id: string;
  x: number;
  y: number;
  r: number;
}

/** Doiralarni markaz atrofida bir-biriga tegmasdan joylashtiradi (deterministik, sof funksiya). */
export function packBubbles(radii: { id: string; r: number }[], gap = 3): Bubble[] {
  const placed: Bubble[] = [];
  const sorted = [...radii].sort((a, b) => b.r - a.r);
  for (const c of sorted) {
    if (!placed.length) {
      placed.push({ id: c.id, x: 0, y: 0, r: c.r });
      continue;
    }
    // Arximed spirali bo'ylab birinchi bo'sh joy; eni bo'yidan kengroq (yassi klaster).
    for (let t = 0; t < 4000; t++) {
      const a = t * 0.18;
      const d = 2.2 * a;
      const x = Math.cos(a) * d * 1.55;
      const y = Math.sin(a) * d * 0.8;
      if (placed.every((p) => Math.hypot(p.x - x, p.y - y) >= p.r + c.r + gap)) {
        placed.push({ id: c.id, x, y, r: c.r });
        break;
      }
    }
  }
  return placed;
}

export function GroupBubbles({ rows, total }: { rows: LeagueRow[]; total: number }) {
  const W = 340;
  const H = 190;
  const layout = useMemo(() => {
    const max = Math.max(1, ...rows.map((r) => r.xp));
    const radii = rows.map((r) => ({ id: r.id, r: 11 + Math.sqrt(r.xp / max) * 19 + (r.isMe ? 3 : 0) }));
    const b = packBubbles(radii);
    // klasterni qutiga sig'diramiz
    const minX = Math.min(...b.map((p) => p.x - p.r));
    const maxX = Math.max(...b.map((p) => p.x + p.r));
    const minY = Math.min(...b.map((p) => p.y - p.r));
    const maxY = Math.max(...b.map((p) => p.y + p.r));
    const k = Math.min(W / (maxX - minX), H / (maxY - minY), 1.25);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return new Map(b.map((p) => [p.id, { x: W / 2 + (p.x - cx) * k, y: H / 2 + (p.y - cy) * k, r: p.r * k }]));
  }, [rows]);
  const me = rows.find((r) => r.isMe);
  return (
    <section className="gbub">
      <div className="gbub-head">
        <div>
          <small>Guruhingiz bu hafta</small>
          <b className="gbub-total">{total.toLocaleString('ru-RU').replace(/ /g, ' ')} XP</b>
          <span className="gbub-sub">{rows.length} ishtirokchi · pufak qancha katta — XP shuncha ko'p</span>
        </div>
      </div>
      <div className="gbub-stage" style={{ aspectRatio: `${W} / ${H}` }}>
        {rows.map((r, i) => {
          const p = layout.get(r.id);
          if (!p) return null;
          return (
            <span
              key={r.id}
              className={`gbub-b ${r.isMe ? 'me' : ''} ${i < 5 ? 'up' : i >= rows.length - 5 ? 'down' : ''}`}
              title={`${r.name} · ${r.xp} XP`}
              style={
                {
                  left: `${((p.x - p.r) / W) * 100}%`,
                  top: `${((p.y - p.r) / H) * 100}%`,
                  width: `${((p.r * 2) / W) * 100}%`,
                  '--bi': i,
                } as CSSProperties
              }
            >
              <Avatar value={r.avatar} size={Math.round(p.r * 1.2)} />
              {r.isMe && <em className="gbub-me">Siz</em>}
            </span>
          );
        })}
      </div>
      {me && <p className="gbub-note muted">Siz {rows.findIndex((r) => r.isMe) + 1}-o'rindasiz · {me.xp} XP</p>}
    </section>
  );
}
