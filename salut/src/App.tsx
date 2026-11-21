import { useEffect, useState } from 'react';
import { LEAGUES, MAX_HEARTS, msToNextHeart, streakActiveToday } from './engine/game';
import { dayKey } from './engine/time';
import { useStore } from './state/store';
import { Learn } from './screens/Learn';
import { Practice } from './screens/Practice';
import { Leagues } from './screens/Leagues';
import { Profile } from './screens/Profile';
import { Shop } from './screens/Shop';
import { Onboarding } from './screens/Onboarding';
import { Session, type SessionConfig } from './screens/Session';
import { WeekStrip } from './screens/Result';
import { Mascot } from './components/Mascot';

type Tab = 'learn' | 'practice' | 'leagues' | 'profile' | 'shop';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'learn', label: "O'rganish", icon: '🏠' },
  { id: 'practice', label: 'Mashq', icon: '🏋️' },
  { id: 'leagues', label: 'Liga', icon: '🏆' },
  { id: 'shop', label: "Do'kon", icon: '🛍️' },
  { id: 'profile', label: 'Profil', icon: '👤' },
];

function readTab(): Tab {
  const h = location.hash.replace('#/', '') as Tab;
  return TABS.some((t) => t.id === h) ? h : 'learn';
}

export function App() {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>(readTab);
  const [session, setSession] = useState<SessionConfig | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const on = () => setTab(readTab());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const go = (t: Tab) => {
    location.hash = `#/${t}`;
    setTab(t);
    window.scrollTo(0, 0);
  };

  const start = (c: SessionConfig) => {
    if (c.kind !== 'practice' && state.hearts <= 0 && !state.unlimitedHearts) {
      setBlocked(true);
      return;
    }
    setSession(c);
  };

  if (!state.onboarded) return <Onboarding />;
  if (session) return <Session config={session} onExit={() => setSession(null)} />;

  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="logo">
          <span className="logo-mark">🥐</span> Salut!
        </div>
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => go(t.id)}>
            <span className="nav-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <div className="main">
        <TopBar onShop={() => go('shop')} onProfile={() => go('profile')} />
        <div className="content">
          {tab === 'learn' && <Learn onStart={start} />}
          {tab === 'practice' && <Practice onStart={start} />}
          {tab === 'leagues' && <Leagues />}
          {tab === 'profile' && <Profile />}
          {tab === 'shop' && <Shop />}
        </div>
      </div>

      <aside className="rightbar">
        <SidePanels onGo={go} />
      </aside>

      <nav className="bottombar">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => go(t.id)} aria-label={t.label}>
            <span>{t.icon}</span>
          </button>
        ))}
      </nav>

      {blocked && (
        <div className="modal-back" onClick={() => setBlocked(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="big-emoji">💔</div>
            <h3>Yuraklar tugadi</h3>
            <p className="muted">Keyingi yurak {Math.ceil((msToNextHeart(state) ?? 0) / 60000)} daqiqada tiklanadi. Mashq qilib yurak ishlab oling yoki do'kondan to'ldiring.</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => { setBlocked(false); setSession({ kind: 'practice', mode: 'smart' }); }}>
              Mashq qilish (+1 ❤️)
            </button>
            <button type="button" className="btn btn-text" onClick={() => { setBlocked(false); go('shop'); }}>
              Do'konga o'tish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TopBar({ onShop, onProfile }: { onShop: () => void; onProfile: () => void }) {
  const { state } = useStore();
  const active = streakActiveToday(state);
  return (
    <header className="topbar">
      <button type="button" className="stat flag" title="Fransuz tili" onClick={onProfile}>
        🇫🇷
      </button>
      <button type="button" className={`stat streak ${active ? 'on' : ''}`} title="Streak" onClick={onProfile}>
        🔥 <b>{state.streak}</b>
      </button>
      <button type="button" className="stat gems" title="Olmoslar" onClick={onShop}>
        💎 <b>{state.gems}</b>
      </button>
      <button type="button" className="stat heart" title="Yuraklar" onClick={onShop}>
        ❤️ <b>{state.unlimitedHearts ? '∞' : state.hearts}</b>
      </button>
    </header>
  );
}

function SidePanels({ onGo }: { onGo: (t: Tab) => void }) {
  const { state } = useStore();
  const todayXp = state.xpByDay[dayKey()] ?? 0;
  const p = Math.min(1, todayXp / state.dailyGoal);
  const lg = LEAGUES[state.league.tier];
  return (
    <>
      <TopBar onShop={() => onGo('shop')} onProfile={() => onGo('profile')} />
      <div className="panel" onClick={() => onGo('leagues')}>
        <div className="panel-h">
          <b>{lg.name} ligasi</b>
          <span className="link">Ko'rish</span>
        </div>
        <div className="panel-row">
          <span className="panel-big">{lg.icon}</span>
          <span className="muted">Bu hafta {state.league.weeklyXp} XP to'pladingiz</span>
        </div>
      </div>
      <div className="panel">
        <div className="panel-h">
          <b>Kunlik maqsad</b>
          <span className="muted">
            {todayXp}/{state.dailyGoal} XP
          </span>
        </div>
        <div className="goal-row">
          <span className="panel-big">{p >= 1 ? '🏅' : '⚡'}</span>
          <div className="progress small">
            <div className="progress-fill gold" style={{ width: `${Math.max(4, p * 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-h">
          <b>Streak</b>
          <span className="muted">🧊 {state.streakFreezes}</span>
        </div>
        <WeekStrip />
      </div>
      {state.hearts < MAX_HEARTS && !state.unlimitedHearts && (
        <div className="panel">
          <div className="panel-h">
            <b>Yuraklar</b>
            <span className="muted">{Math.ceil((msToNextHeart(state) ?? 0) / 60000)} daq.</span>
          </div>
          <div className="hearts-row">{Array.from({ length: MAX_HEARTS }, (_, i) => (i < state.hearts ? '❤️' : '🤍')).join(' ')}</div>
        </div>
      )}
      <div className="panel tip">
        <Mascot mood="happy" size={64} />
        <p>
          <b>Maslahat:</b> so'zning ustiga bosing — tarjimasi va talaffuzi chiqadi.
        </p>
      </div>
    </>
  );
}
