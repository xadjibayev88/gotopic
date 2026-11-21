import { useEffect, useRef, useState } from 'react';
import { DEMOTE, LEAGUE_SIZE, LEAGUES, leagueStandings, PROMOTE } from '../engine/game';
import { weekStart } from '../engine/time';
import { useStore } from '../state/store';

function timeLeft(wid: string): string {
  const end = weekStart(wid).getTime() + 7 * 86_400_000;
  const ms = Math.max(0, end - Date.now());
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  return d > 0 ? `${d} kun ${h} soat` : `${h} soat`;
}

export function Leagues() {
  const { state, update } = useStore();
  const [, force] = useState(0);
  const badges = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = badges.current?.querySelector<HTMLElement>('.cur');
    if (el && badges.current) badges.current.scrollLeft = el.offsetLeft - badges.current.clientWidth / 2 + el.clientWidth / 2;
  }, []);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  const lg = state.league;
  const rows = leagueStandings(lg, new Date(), state.name);
  const res = lg.lastResult && !lg.lastResult.seen ? lg.lastResult : null;

  return (
    <div className="page">
      <div className="league-badges" ref={badges}>
        {LEAGUES.map((l, i) => (
          <div key={l.name} className={`lbadge ${i === lg.tier ? 'cur' : i > lg.tier ? 'locked' : ''}`} style={{ ['--c' as string]: l.color }} title={l.name}>
            {i > lg.tier ? '🔒' : l.icon}
          </div>
        ))}
      </div>
      <h1 className="page-title center">{LEAGUES[lg.tier].name} bosqichi</h1>
      <p className="muted center">
        Eng yaxshi {PROMOTE} kishi keyingi shaharga yo'l oladi · {timeLeft(lg.weekId)} qoldi
      </p>
      {lg.weeklyXp === 0 && <div className="league-hint">Bir dars tugatib, turnirga qo'shiling!</div>}
      <ol className="board">
        {rows.map((r, i) => {
          const rank = i + 1;
          const zone = rank <= PROMOTE ? 'up' : rank > LEAGUE_SIZE - DEMOTE && lg.tier > 0 ? 'down' : '';
          return (
            <li key={r.id} className={`brow ${r.isMe ? 'me' : ''} ${zone}`}>
              {rank === PROMOTE + 1 && <div className="zone-line up">▲ KO'TARILISH ZONASI</div>}
              {rank === LEAGUE_SIZE - DEMOTE + 1 && lg.tier > 0 && <div className="zone-line down">▼ TUSHISH ZONASI</div>}
              <span className={`brank r${rank}`}>{rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}</span>
              <span className="bavatar">{r.avatar}</span>
              <span className="bname">{r.isMe ? `${r.name} (siz)` : r.name}</span>
              <span className="bxp">{r.xp} ball</span>
            </li>
          );
        })}
      </ol>
      {res && (
        <div className="modal-back">
          <div className="sheet">
            <div className="big-emoji">{res.toTier > res.fromTier ? '🎉' : res.toTier < res.fromTier ? '😔' : '💪'}</div>
            <h3>O'tgan hafta: {res.rank}-o'rin</h3>
            <p className="muted">
              {res.toTier > res.fromTier
                ? `Tabriklaymiz! Siz ${LEAGUES[res.toTier].name} bosqichiga ko'tarildingiz. Chemodanni yig'ing!`
                : res.toTier < res.fromTier
                  ? `Siz ${LEAGUES[res.toTier].name} bosqichiga qaytdingiz. Bu hafta qaytib chiqing!`
                  : `${LEAGUES[res.toTier].name} bosqichida qoldingiz.`}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => update((s) => ({ ...s, league: { ...s.league, lastResult: s.league.lastResult && { ...s.league.lastResult, seen: true } } }))}
            >
              Davom etish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
