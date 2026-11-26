import { createPortal } from 'react-dom';
import { Ic } from '../components/Icons';
import { AdSlot } from '../components/AdSlot';
import { RewardedButton } from '../components/RewardedButton';
import { maybeInterstitial } from '../engine/ads';
import { Avatar } from '../components/Avatar';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GroupBubbles } from '../components/GroupBubbles';
import { motionAllowed } from '../engine/motion';
import { DEMOTE, LEAGUE_PRIZE_XP, LEAGUE_SIZE, LEAGUES, leagueStandings, PROMOTE } from '../engine/game';
import { weekStart } from '../engine/time';
import { useStore } from '../state/store';
import { Folder } from '../components/Folder';
import { QuestsCard, StreakRepair, useQuestSummary } from '../components/Quests';

function timeLeft(wid: string): string {
  const end = weekStart(wid).getTime() + 7 * 86_400_000;
  const ms = Math.max(0, end - Date.now());
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  return d > 0 ? `${d} kun ${h} soat` : `${h} soat`;
}

/** Liga qalqon-nishoni: gradient qalqon, ichida liga belgisi, yuqorida yaltiroq. */
function LeagueShield({ tier, size }: { tier: number; size: number }) {
  const l = LEAGUES[tier];
  const id = `lgs-${tier}-${size}`;
  return (
    <span className="lg-shield" style={{ width: size, height: size * 1.12 }}>
      <svg viewBox="0 0 100 112" width={size} height={size * 1.12} aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={l.color2} />
            <stop offset="1" stopColor={l.color} />
          </linearGradient>
        </defs>
        <path d="M50 4 L92 18 V54 C92 80 74 98 50 108 C26 98 8 80 8 54 V18 Z" fill={`url(#${id})`} stroke="rgba(255,255,255,.75)" strokeWidth="3" />
        <path d="M50 12 L84 23.5 V54 C84 75 70 90 50 99 C30 90 16 75 16 54 V23.5 Z" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
        <path d="M14 22 L50 10 L86 22 V36 C64 30 36 30 14 40 Z" fill="#fff" opacity=".22" />
      </svg>
      <span className="lg-shield-ico" style={{ fontSize: size * 0.4 }}>{l.icon}</span>
      <b className="lg-shield-num" style={{ fontSize: Math.max(9, size * 0.14) }}>{tier + 1}</b>
    </span>
  );
}

export function Leagues() {
  const quests = useQuestSummary();
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
  // Turnir sahifasi reklamasi: Android'da interstitial (har 2-kirishda, ≥3 daqiqa oraliq), saytda AdSense.
  useEffect(() => {
    void maybeInterstitial();
  }, []);
  const lg = state.league;
  const rows = leagueStandings(lg, new Date(), state.name, state.avatar);
  // «Ro'yxat ↔ Kartalar»: FLIP — eski joylar eslab qolinadi, yangi joyga transform bilan silliq ko'chadi.
  const [view, setView] = useState<'list' | 'cards'>(() => {
    try {
      return localStorage.getItem('voila.boardView') === 'cards' ? 'cards' : 'list';
    } catch {
      return 'list';
    }
  });
  const board = useRef<HTMLOListElement>(null);
  const before = useRef<Map<string, DOMRect> | null>(null);
  const switchView = (v: 'list' | 'cards') => {
    if (v === view) return;
    if (board.current && motionAllowed()) {
      before.current = new Map([...board.current.querySelectorAll<HTMLElement>('[data-id]')].map((el) => [el.dataset.id!, el.getBoundingClientRect()]));
    }
    setView(v);
    try {
      localStorage.setItem('voila.boardView', v);
    } catch {
      /* e'tiborsiz */
    }
  };
  useLayoutEffect(() => {
    const prev = before.current;
    before.current = null;
    if (!prev || !board.current) return;
    const els = [...board.current.querySelectorAll<HTMLElement>('[data-id]')];
    for (const el of els) {
      const a = prev.get(el.dataset.id!);
      if (!a) continue;
      const b = el.getBoundingClientRect();
      if (b.top > innerHeight + 200 && a.top > innerHeight + 200) continue; // ekrandan tashqaridagilar — animatsiyasiz
      el.style.transition = 'none';
      el.style.transformOrigin = 'top left';
      el.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
    }
    void board.current.offsetWidth; // reflow — keyin yangi joyga sirg'aladi
    for (const el of els) {
      el.style.transition = 'transform .5s cubic-bezier(.2, .8, .2, 1)';
      el.style.transform = '';
    }
    const t = window.setTimeout(() => els.forEach((el) => { el.style.transition = ''; el.style.transformOrigin = ''; }), 560);
    return () => clearTimeout(t);
  }, [view]);
  const res = lg.lastResult && !lg.lastResult.seen ? lg.lastResult : null;

  return (
    <div className="page">
      {/* Liga qahramon-kartasi: qalqon nishon, nom, shior va hafta tugashigacha vaqt */}
      <section className="lg-hero" style={{ ['--c' as string]: LEAGUES[lg.tier].color, ['--c2' as string]: LEAGUES[lg.tier].color2 }}>
        <LeagueShield tier={lg.tier} size={104} />
        <div className="lg-hero-text">
          <small className="lg-level">{lg.tier + 1}-daraja / {LEAGUES.length}</small>
          <h1>{`${LEAGUES[lg.tier].name} liga`}</h1>
          <p>{LEAGUES[lg.tier].motto}</p>
          <span className="lg-timer"><Ic name="clock" size={15} /> {timeLeft(lg.weekId)} qoldi</span>
        </div>
      </section>
      {/* Ligalar zinapoyasi */}
      <div className="league-badges lg-ladder" ref={badges}>
        {LEAGUES.map((l, i) => (
          <div key={l.name} className={`lbadge ${i === lg.tier ? 'cur' : i > lg.tier ? 'locked' : 'passed'}`} style={{ ['--c' as string]: l.color, ['--c2' as string]: l.color2 }} title={`${i + 1}. ${l.name} liga`}>
            {i > lg.tier ? <span className="lb-lock"><Ic name="lock" size={26} /></span> : <LeagueShield tier={i} size={38} />}
            <small>{l.name}</small>
          </div>
        ))}
      </div>
      {/* Darslar sahifasidan ko'chirildi: uzilgan seriya va kunlik vazifalar — ixcham ko'rinishda. */}
      <StreakRepair compact />
      <Folder
        className="quests-folder"
        icon={<Ic name="target" size={22} />}
        title="Kunlik vazifalar"
        summary={`${quests.done}/${quests.total} bajarildi · hammasiga +${quests.bonus} 🪙`}
      >
        <QuestsCard compact />
      </Folder>
      <div className="league-stats">
        <div>
          <b>{lg.weeklyXp}</b>
          <small>Bu hafta XP</small>
        </div>
        <div>
          <b>{rows.findIndex((r) => r.isMe) + 1}</b>
          <small>O'rningiz</small>
        </div>
        <div>
          <b>Top {PROMOTE}</b>
          <small>{lg.tier + 1 < LEAGUES.length ? `${LEAGUES[lg.tier + 1].name} ligaga` : 'Afsonada qoling'}</small>
        </div>
      </div>
      <GroupBubbles rows={rows} total={rows.reduce((a, r) => a + r.xp, 0)} />
      <details className="league-how">
        <summary><Ic name="help" size={18} /> Turnir qanday ishlaydi?</summary>
        <ul>
          <li>Har hafta siz {LEAGUE_SIZE} kishilik guruhda bellashasiz. Hafta dushanbadan yakshanbagacha.</li>
          <li>
            <b>XP</b> — darslar, mashqlar va Vivi bilan suhbatda to'playdigan ochkolaringiz. Qancha ko'p o'qisangiz, shuncha ko'p XP.
          </li>
          <li>
            Hafta oxirida <b>1–{PROMOTE}-o'rinlar</b> keyingi ligaga ko'tariladi, <b>{PROMOTE + 1}–{LEAGUE_SIZE - DEMOTE}-o'rinlar</b> shu ligada qoladi, <b>oxirgi {DEMOTE} kishi</b> pastga tushadi.
          </li>
          <li>
            Ligalar: {LEAGUES.map((l) => `${l.icon} ${l.name}`).join(' → ')}. Eng yuqorisi — Afsona.
          </li>
          <li>
            Mukofot: 🥇 +{LEAGUE_PRIZE_XP[1]} XP, 🥈 +{LEAGUE_PRIZE_XP[2]} XP, 🥉 +{LEAGUE_PRIZE_XP[3]} XP.
          </li>
        </ul>
      </details>
      <RewardedButton kind="xp" compact />
      {lg.weeklyXp === 0 && <div className="league-hint">Bitta dars tugatib turnirga qo'shiling — XP to'plang!</div>}
      <div className="seg board-view" role="tablist" aria-label="Ko'rinish">
        <button type="button" role="tab" aria-selected={view === 'list'} className={view === 'list' ? 'on' : ''} onClick={() => switchView('list')}>
          ☰ Ro'yxat
        </button>
        <button type="button" role="tab" aria-selected={view === 'cards'} className={view === 'cards' ? 'on' : ''} onClick={() => switchView('cards')}>
          ▦ Kartalar
        </button>
      </div>
      <ol className={`board lg-board v-${view}`} ref={board}>
        {rows.map((r, i) => {
          const rank = i + 1;
          const zone = rank <= PROMOTE ? 'up' : rank > LEAGUE_SIZE - DEMOTE ? 'down' : 'stay';
          return (
            <li key={r.id} data-id={r.id} className={`brow ${r.isMe ? 'me' : ''} ${zone}`}>
              {rank === 1 && <div className="zone-line up">▲ KO'TARILISH ZONASI · 1–{PROMOTE}</div>}
              {rank === PROMOTE + 1 && <div className="zone-line stay">■ QOLISH ZONASI · {PROMOTE + 1}–{LEAGUE_SIZE - DEMOTE}</div>}
              {rank === LEAGUE_SIZE - DEMOTE + 1 && (
                <div className="zone-line down">▼ TUSHISH ZONASI · {LEAGUE_SIZE - DEMOTE + 1}–{LEAGUE_SIZE}{lg.tier === 0 ? ' (bu ligada tushish yo\'q)' : ''}</div>
              )}
              <span className={`brank r${rank}`}>{rank <= 3 ? <Ic name="medal" size={24} className={`medal-${rank}`} /> : rank}</span>
              <span className="bavatar"><Avatar value={r.avatar} size={30} /></span>
              <span className="bname">{r.isMe ? (r.name === 'Siz' ? 'Siz' : `${r.name} (siz)`) : r.name}</span>
              <span className="bxp">{r.xp} XP</span>
            </li>
          );
        })}
      </ol>
      {res && createPortal(
        <div className="modal-back">
          <div className="sheet">
            <div className="big-emoji">{res.toTier > res.fromTier ? '🎉' : res.toTier < res.fromTier ? '😔' : '💪'}</div>
            <h3>O'tgan hafta: {res.rank}-o'rin</h3>
            <p className="muted">
              {res.toTier > res.fromTier
                ? `Tabriklaymiz! Siz ${LEAGUES[res.toTier].name} ligaga ko'tarildingiz. Chemodanni yig'ing!${res.rank <= 3 ? ` Mukofot: +${LEAGUE_PRIZE_XP[res.rank]} XP.` : ''}`
                : res.toTier < res.fromTier
                  ? `Siz ${LEAGUES[res.toTier].name} ligaga tushdingiz. Bu hafta qaytib chiqing!`
                  : `${LEAGUES[res.toTier].name} ligada qoldingiz.`}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => update((s) => ({ ...s, league: { ...s.league, lastResult: s.league.lastResult && { ...s.league.lastResult, seen: true } } }))}
            >
              Davom etish
            </button>
          </div>
        </div>,
        document.body,
      )}
      <AdSlot />
    </div>
  );
}
