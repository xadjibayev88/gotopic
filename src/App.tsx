import { GlassRefraction, useLiquidGlassOn } from './components/LiquidGlass';
import { motionAllowed } from './engine/motion';
import { BoltIcon, CoinIcon, FishIcon, FlagIcon } from './components/TopBarIcons';
import { Ic } from './components/Icons';
import { ViviWalker } from './components/ViviWalker';
import { lazy, memo, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { grantSuperFreeze, LEAGUES, MAX_HEARTS, msToNextHeart, streakActiveToday } from './engine/game';
import { dayKey } from './engine/time';
import { useStore } from './state/store';
import { useAccount } from './state/account';
import { Learn } from './screens/Learn';
import { Practice } from './screens/Practice';
import { Onboarding } from './screens/Onboarding';
import type { SessionConfig } from './screens/Session';
import { WeekStrip } from './screens/Result';
import { Mascot } from './components/Mascot';
import { TabIcon } from './components/TabIcons';
import { RewardedButton } from './components/RewardedButton';
import { QuestsCard } from './components/Quests';
import { AiConsentDialog } from './components/AiConsentDialog';
import { CountUp } from './components/CountUp';
import { TabBar, type TabItem } from './components/TabBar';
import { PullToRefresh } from './components/PullToRefresh';
import { startScrollReveal } from './engine/motion';
// Og'ir sahifalar alohida yuklanadi (birinchi ochilish tezroq), bo'sh paytda oldindan olib qo'yiladi.
const loaders = {
  Tutor: () => import('./screens/Tutor').then((m) => ({ default: m.Tutor })),
  Leagues: () => import('./screens/Leagues').then((m) => ({ default: m.Leagues })),
  Profile: () => import('./screens/Profile').then((m) => ({ default: m.Profile })),
  Shop: () => import('./screens/Shop').then((m) => ({ default: m.Shop })),
  About: () => import('./screens/About').then((m) => ({ default: m.About })),
  Admin: () => import('./screens/Admin').then((m) => ({ default: m.Admin })),
  Session: () => import('./screens/Session').then((m) => ({ default: m.Session })),
};
const Tutor = lazy(loaders.Tutor);
const Leagues = lazy(loaders.Leagues);
const Profile = lazy(loaders.Profile);
const Shop = lazy(loaders.Shop);
const About = lazy(loaders.About);
const Admin = lazy(loaders.Admin);
const Session = lazy(loaders.Session);
if (typeof window !== 'undefined') {
  const idle = (window as Window & { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1500));
  idle(() => Object.values(loaders).forEach((l) => void l().catch(() => undefined)));
}

/** Ekran kengligi sharti (o'ng/chap panellar faqat kompyuterda chiziladi). */
function useMedia(q: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(q);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(q).matches,
    () => false,
  );
}

const Loading = () => <div className="page-loading" aria-busy="true" />;

/** Sahifa ichi: faqat id/onStart o'zgarsa chiziladi (ko'rsatish/yashirish uni qayta chizmaydi). */
const PaneBody = memo(function PaneBody({ id, onStart, onManageAiConsent }: { id: Tab; onStart: (c: SessionConfig) => void; onManageAiConsent: () => void }) {
  return (
    <Suspense fallback={<Loading />}>
      {id === 'learn' && <Learn onStart={onStart} />}
      {id === 'tutor' && <Tutor />}
      {id === 'practice' && <Practice onStart={onStart} />}
      {id === 'leagues' && <Leagues />}
      {id === 'profile' && <Profile onManageAiConsent={onManageAiConsent} />}
      {id === 'shop' && <Shop />}
      {id === 'about' && <About />}
      {id === 'admin' && <Admin />}
    </Suspense>
  );
});

/** Sahifa qatlami: ko'rinmaydiganlari yashiriladi (o'chirilmaydi) — qaytib o'tish bir zumda. */
/**
 * Tab almashganda: yangi sahifaning ekranda ko'rinib turgan bloklari (Turnir'dagi ro'yxat ↔ kartalar
 * almashinuvidagidek) kichrayib-siljigan holatdan o'z joyiga prujinadek «oqib» tushadi, navbatma-navbat.
 * Faqat ko'rinayotgan ≤ 10 ta blok, faqat transform/opacity — sekin telefonlarda ham qotmaydi.
 */
function morphPaneIn(): (() => void) | undefined {
  if (!motionAllowed() || document.documentElement.classList.contains('lite')) return;
  const pane = document.querySelector<HTMLElement>('.content > .tab-pane:not([hidden])');
  const root = pane?.firstElementChild as HTMLElement | null;
  if (!pane || !root) return;
  const vh = window.innerHeight;
  let blocks = Array.from(root.children) as HTMLElement[];
  // Bitta katta o'ram bo'lsa — uning ichidagi bloklar.
  if (blocks.length === 1) blocks = Array.from(blocks[0].children) as HTMLElement[];
  const shown: HTMLElement[] = [];
  for (const el of blocks) {
    const r = el.getBoundingClientRect();
    if (el.matches('[data-no-morph], .modal-back')) continue;
    if (r.height === 0 || r.bottom < 0) continue;
    if (r.top > vh) break;
    shown.push(el);
    if (shown.length >= 5) break;
  }
  shown.forEach((el, i) => {
    el.style.setProperty('--mi', String(i));
    el.classList.add('pane-morph');
  });
  const t = window.setTimeout(() => shown.forEach((el) => el.classList.remove('pane-morph')), 900);
  return () => {
    clearTimeout(t);
    shown.forEach((el) => el.classList.remove('pane-morph'));
  };
}

const Pane = memo(function Pane({ id, on, dir, onStart, onManageAiConsent }: { id: Tab; on: boolean; dir: 'fwd' | 'back'; onStart: (c: SessionConfig) => void; onManageAiConsent: () => void }) {
  return (
    <div className={`tab-pane page-${dir}`} hidden={!on} aria-hidden={!on}>
      <PaneBody id={id} onStart={onStart} onManageAiConsent={onManageAiConsent} />
    </div>
  );
}, (a, b) => a.on === b.on && a.id === b.id && (!b.on || a.dir === b.dir) && a.onStart === b.onStart && a.onManageAiConsent === b.onManageAiConsent);

import { initAds, loadAdsense, maybeInterstitial, setImmersive } from './engine/ads';

type Tab = 'learn' | 'tutor' | 'practice' | 'leagues' | 'profile' | 'shop' | 'about' | 'admin';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'learn', label: 'Darslar', icon: '🚇' },
  { id: 'tutor', label: 'Vivi', icon: '🐱' },
  { id: 'practice', label: 'Mashq', icon: '🏋️' },
  { id: 'leagues', label: 'Turnir', icon: '🗼' },
  { id: 'shop', label: "Do'kon", icon: '🛍️' },
  { id: 'profile', label: 'Profil', icon: '👤' },
];

const TAB_ITEMS: readonly TabItem<Tab>[] = TABS.map((t) => ({ id: t.id, label: t.label, icon: (on: boolean) => <TabIcon id={t.id} on={on} /> }));

function readTab(): Tab {
  const h = location.hash.replace('#/', '').split('?')[0] as Tab;
  return TABS.some((t) => t.id === h) || h === 'about' || h === 'admin' ? h : 'learn';
}

export function App() {
  const { state } = useStore();
  const { premium, sync } = useAccount();
  const [tab, setTab] = useState<Tab>(readTab);
  // Bir marta ochilgan sahifalar xotirada qoladi (qayta chizilmaydi) — qaytib o'tish bir zumda.
  const [visited, setVisited] = useState<Tab[]>(() => [readTab()]);
  const scrolls = useRef<Partial<Record<Tab, number>>>({});
  useEffect(() => setVisited((v) => (v.includes(tab) ? v : [...v, tab])), [tab]);
  // Har sahifaning o'z joyiga qaytish (yangi sahifa — tepadan).
  const firstPane = useRef(true);
  useLayoutEffect(() => {
    window.scrollTo(0, scrolls.current[tab] ?? 0);
    if (firstPane.current) {
      firstPane.current = false;
      return;
    }
    return morphPaneIn();
  }, [tab]);
  const [session, setSession] = useState<SessionConfig | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [aiConsentOpen, setAiConsentOpen] = useState(false);
  const openAiConsent = useCallback(() => setAiConsentOpen(true), []);

  useEffect(() => {
    const on = () => setTab(readTab());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  // Reklama: obuna holatiga qarab yoqiladi/o'chiriladi; dars paytida banner yashiriladi.
  useEffect(() => {
    void initAds(premium);
    if (!premium) loadAdsense();
  }, [premium]);
  useEffect(() => setImmersive(!!session), [session]);
  const { update } = useStore();
  useEffect(() => {
    if (premium && state.onboarded) update((s) => grantSuperFreeze(s));
  }, [premium, state.onboarded, update]);

  const wide = useMedia('(min-width: 1180px)');
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  useEffect(() => startScrollReveal(), []);
  const go = (t: Tab) => {
    if (t === tab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    scrolls.current[tab] = window.scrollY;
    const from = TABS.findIndex((x) => x.id === tab);
    const to = TABS.findIndex((x) => x.id === t);
    setDir(to >= from ? 'fwd' : 'back');
    history.replaceState(null, '', `#/${t}`);
    setVisited((v) => (v.includes(t) ? v : [...v, t]));
    setTab(t);
  };

  const startRef = useRef<(c: SessionConfig) => void>(() => {});
  const stableStart = useCallback((c: SessionConfig) => startRef.current(c), []);
  const start = (c: SessionConfig) => {
    if (c.kind !== 'practice' && state.hearts <= 0 && !state.unlimitedHearts && !premium) {
      setBlocked(true);
      return;
    }
    setSession(c);
  };
  startRef.current = start;

  // Tanishuvda «A2/B1/B2» tanlangan bo'lsa — darhol o'sha darajaga qisqa test (o'tsa, oldingi darslar ochiladi).
  useEffect(() => {
    if (!state.onboarded) return;
    let lvl: string | null = null;
    try {
      lvl = localStorage.getItem('voila.pendingJump');
      if (lvl) localStorage.removeItem('voila.pendingJump');
    } catch {
      /* e'tiborsiz */
    }
    if (lvl === 'A2' || lvl === 'B1' || lvl === 'B2') setSession({ kind: 'jump', level: lvl });
  }, [state.onboarded]);

  if (!state.onboarded) return <Onboarding />;
  if (session)
    return (
      <Suspense fallback={<Loading />}>
      <Session
        config={session}
        onExit={(completed?: boolean) => {
          setSession(null);
          if (completed) void maybeInterstitial();
        }}
      />
      </Suspense>
    );

  return (
    <div className={`shell ${tab === 'tutor' ? 'tutor-mode' : ''}`}>
      <nav className="sidebar">
        <div className="logo">
          <Mascot size={38} mood="happy" className="logo-cat" /> Voilà!
        </div>
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => go(t.id)}>
            <span className="nav-icon"><TabIcon id={t.id} on={tab === t.id} /></span>
            <span>{t.label}</span>
          </button>
        ))}
        <button type="button" className={`nav-item ${tab === 'about' ? 'active' : ''}`} onClick={() => go('about')}>
          <span className="nav-icon"><Ic name="info" size={22} /></span>
          <span>Biz haqimizda</span>
        </button>
      </nav>

      <div className="main">
        <TopBar onShop={() => go('shop')} onProfile={() => go('profile')} />
        <div className="content">
            {visited.map((id) => (
              <Pane key={id} id={id} on={id === tab} dir={dir} onStart={stableStart} onManageAiConsent={openAiConsent} />
            ))}
        </div>
      </div>

      {wide && (
        <aside className="rightbar">
          <SidePanels onGo={go} />
        </aside>
      )}

      <TabBar
        tabs={TAB_ITEMS}
        active={tab}
        onSelect={go}
      />
      <PullToRefresh onRefresh={sync} disabled={tab === 'tutor' || !!blocked || aiConsentOpen} />

      {blocked && (
        <div className="modal-back" onClick={() => setBlocked(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="big-emoji">💔</div>
            <h3>Baliqchalar tugadi</h3>
            <p className="muted">Keyingi baliqcha {Math.ceil((msToNextHeart(state) ?? 0) / 60000)} daqiqada tayyor bo'ladi. Mashq qilib baliqcha ishlab oling yoki do'kondan to'ldiring.</p>
            <RewardedButton compact onGranted={() => setBlocked(false)} />
            <button type="button" className="btn btn-primary btn-lg" onClick={() => { setBlocked(false); setSession({ kind: 'practice', mode: 'smart' }); }}>
              Mashq qilish (+1 🐟)
            </button>
            <button type="button" className="btn btn-text" onClick={() => { setBlocked(false); go('shop'); }}>
              Do'konga o'tish
            </button>
          </div>
        </div>
      )}
      <AiConsentDialog open={aiConsentOpen} onClose={() => setAiConsentOpen(false)} />
    </div>
  );
}

/** Shrink header: sahifa pastga surilganda yuqori panel ixchamlashadi. */
function useScrolledPast(px: number): boolean {
  const [past, setPast] = useState(() => typeof window !== 'undefined' && window.scrollY > px);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      // Gisterezis: chegarada (px atrofida) panel ixcham ↔ oddiy bo'lib qaltiramasin.
      raf = requestAnimationFrame(() => setPast((was) => (was ? window.scrollY > px * 0.55 : window.scrollY > px * 1.45)));
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
    };
  }, [px]);
  return past;
}

function TopBar({ onShop, onProfile }: { onShop: () => void; onProfile: () => void }) {
  const { state } = useStore();
  const { premium } = useAccount();
  const active = streakActiveToday(state);
  const compact = useScrolledPast(28);
  const glass = useLiquidGlassOn();
  return (
    <header className={`topbar ${compact ? 'compact' : ''} ${glass ? 'lg-on' : ''}`}>
      {glass && <GlassRefraction radius={30} />}
      <button type="button" className="stat flag" title="Fransuz tili" aria-label="Fransuz tili" onClick={onProfile}>
        <FlagIcon />
      </button>
      <ViviWalker cheerKey={state.gems + state.streak * 100000} />
      {state.xpBoostUntil > Date.now() && (
        <span className="stat boost" title="Ikki barobar XP faol">
          <BoltIcon /> <b>2x</b>
        </span>
      )}
      <button type="button" className={`stat streak ${active ? 'on' : ''}`} title="Kunlik seriya" onClick={onProfile}>
        <span className={`ico-anim ico-flame ${active ? 'on' : ''}`}><StreakFlame on={active} /></span> <b><CountUp value={state.streak} /></b>
      </button>
      <button type="button" className="stat gems" title="Tangalar" onClick={onShop}>
        <span className="ico-anim ico-coin"><CoinIcon /></span> <b><CountUp value={state.gems} /></b>
      </button>
      <button type="button" className="stat heart" title="Baliqchalar (xato qilsangiz kamayadi)" onClick={onShop}>
        <span className={`ico-anim ico-fish ${state.unlimitedHearts || premium || state.hearts > 0 ? 'on' : ''}`}><FishIcon full={state.unlimitedHearts || premium || state.hearts > 0} /></span> <b>{state.unlimitedHearts || premium ? '∞' : state.hearts}</b>
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
          <b>{`${lg.icon} ${lg.name} liga`}</b>
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
          <span className="panel-big"><Ic name={p >= 1 ? 'medal' : 'bolt'} size={34} /></span>
          <div className="progress small">
            <div className="progress-fill gold" style={{ width: `${Math.max(4, p * 100)}%` }} />
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-h">
          <b>Kunlik seriya</b>
          <span className="muted"><Ic name="shield" size={16} /> {state.streakFreezes}</span>
        </div>
        <WeekStrip />
      </div>
      {state.hearts < MAX_HEARTS && !state.unlimitedHearts && (
        <div className="panel">
          <div className="panel-h">
            <b>Baliqchalar</b>
            <span className="muted">{Math.ceil((msToNextHeart(state) ?? 0) / 60000)} daq.</span>
          </div>
          <div className="hearts-row">{Array.from({ length: MAX_HEARTS }, (_, i) => (i < state.hearts ? '🐟' : '▫️')).join(' ')}</div>
        </div>
      )}
      <div className="panel quests-panel">
        <QuestsCard />
      </div>
      <div className="panel tip">
        <Mascot mood="happy" size={64} />
        <p>
          <b>Maslahat:</b> so'zning ustiga bosing — tarjimasi va talaffuzi chiqadi.
        </p>
      </div>
    </>
  );
}

/** Seriya olovchasi: bugun dars qilingan bo'lsa — yonib, qimirlab turadi (Duolingo uslubida). */
function StreakFlame({ on }: { on: boolean }) {
  return (
    <svg className={`streak-flame ${on ? 'lit' : ''}`} viewBox="0 0 24 28" width="22" height="26" aria-hidden="true">
      <path className="sf-outer" d="M12 1.5c1.2 4.2 6.8 6.6 6.8 13.6A6.8 6.8 0 0 1 12 26a6.8 6.8 0 0 1-6.8-6.9c0-3.4 1.7-5.2 3-6.6.3 2 1.3 3.1 2.3 3.4C9.6 11 10.4 5.6 12 1.5z" />
      <path className="sf-inner" d="M12 12.5c.8 2.4 3.6 3.8 3.6 7.2A3.6 3.6 0 0 1 12 23.4a3.6 3.6 0 0 1-3.6-3.7c0-2.3 1.4-3.2 2.1-4.6.4 1 .9 1.5 1.5 1.6-.4-1.6-.4-2.9 0-4.2z" />
      {on && (
        <g className="sf-sparks">
          <circle className="s1" cx="9" cy="8" r="1" />
          <circle className="s2" cx="15" cy="6" r=".8" />
          <circle className="s3" cx="12" cy="3" r=".7" />
        </g>
      )}
    </svg>
  );
}
