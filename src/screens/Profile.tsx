import { currentLang, LANG_EVENT, LANGUAGES, type Lang } from '../i18n';
import { Ic } from '../components/Icons';
import { HoldButton, RangeValue } from '../components/Micro';
import { chooseLanguage } from '../i18n/choose';
import { liquidGlassSupported, readLiquidGlass, saveLiquidGlass } from '../components/LiquidGlass';
import { DrawLine } from '../components/StripeFx';
import { ReviewForm } from '../components/SocialProof';
import { PinSetupSheet } from '../components/PinLock';
import { ThemeToggle } from '../components/ThemeToggle';
import { Folder } from '../components/Folder';
import { clearPin, hasPin, setPin, verifyPin } from '../engine/applock';
import { TAB_MOTIONS, saveTabMotion, useTabMotion } from '../components/TabBar';
import { themePref, setThemePref, type ThemePref } from '../engine/theme';
import { useEffect, useState } from 'react';
import { ACHIEVEMENTS, LEAGUES } from '../engine/game';
import { addDays, dayKey } from '../engine/time';
import { useStore } from '../state/store';
import { WeekStrip } from './Result';
import { AccountCard } from '../components/AccountCard';
import { Avatar, AvatarPicker } from '../components/Avatar';
import { useAccount } from '../state/account';

export function Profile({ onManageAiConsent }: { onManageAiConsent: () => void }) {
  const { state, update, reset } = useStore();
  const [name, setName] = useState(state.name);
  const [picking, setPicking] = useState(false);
  const [accOpen, setAccOpen] = useState(false);
  const { me, premium } = useAccount();
  const words = Object.keys(state.words).length;
  const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const c = new Date(state.createdAt);
  // Sana ilova tilida: o'zbekcha — qo'lda, boshqalar — brauzer Intl formati.
  const since = currentLang() === 'uz' ? `${c.getFullYear()}-yil ${MONTHS[c.getMonth()]}` : new Intl.DateTimeFormat(currentLang(), { year: 'numeric', month: 'long' }).format(c);
  const sinceLabel = `${since} dan beri`;

  // So'nggi 14 kun XP grafigi
  const today = dayKey();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const max = Math.max(state.dailyGoal, ...days.map((d) => state.xpByDay[d] ?? 0));
  const weekXp = state.league.weeklyXp; // dushanbadan beri (turnir haftasi bilan bir xil)

  return (
    <div className="page">
      {/* Profil kartasi: avatar, ism, chiplar; pastida ixcham hisob qatori */}
      <section
        className={`pf-hero ${accOpen ? 'acc-open' : ''}`}
        onClick={(e) => {
          // Avatar, ism maydoni va tugmalar o'z ishini qiladi; kartaning qolgan joyi hisob qatorini ochadi/yopadi.
          if ((e.target as HTMLElement).closest('button, input, a, .acc-line')) return;
          setAccOpen((v) => !v);
        }}
      >
        <div className="pf-top">
          <button type="button" className="avatar-big pf-avatar" onClick={() => setPicking(true)} aria-label="Avatarni o'zgartirish">
            <Avatar value={state.avatar} size={76} />
            <span className="avatar-edit">✎</span>
          </button>
          <div className="pf-id">
            <input className="name-input" value={name} placeholder="Ismingiz" onChange={(e) => setName(e.target.value)} onBlur={() => update((s) => ({ ...s, name: name.trim() }))} />
            <p className="muted">{sinceLabel} · 🇺🇿 → 🇫🇷</p>
            <div className="pf-chips">
              {premium && <span className="pf-chip super"><Ic name="crown" size={14} /> SUPER</span>}
              <span className="pf-chip">{`${LEAGUES[state.league.tier].icon} ${LEAGUES[state.league.tier].name} liga`}</span>
              <span className="pf-chip"><Ic name="star" size={14} /> {`${state.xp} XP`}</span>
            </div>
          </div>
        </div>
        <div className="pf-acc" aria-hidden={!accOpen}>
          <div className="pf-acc-inner">
            <AccountCard onManageAiConsent={onManageAiConsent} />
          </div>
        </div>
        <button type="button" className="pf-acc-toggle" aria-expanded={accOpen} aria-label="Hisob ma'lumotlari" onClick={() => setAccOpen((v) => !v)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </section>

      {picking && <AvatarPicker value={state.avatar} googlePhoto={me.user?.avatar} onPick={(v) => update((s) => ({ ...s, avatar: v }))} onClose={() => setPicking(false)} />}

      {me.admin && (
        <a className="btn btn-ghost admin-link" href="#/admin">
          🧾 Admin: to'lov cheklari
        </a>
      )}

      <h2 className="section-title">Statistika</h2>
      <div className="pf-stats">
        {[
          [<Ic name="flame" size={22} />, state.streak, 'Kunlik seriya', '#f59e0b'],
          [<Ic name="star" size={22} />, state.xp, 'Jami XP', '#eab308'],
          [<Ic name="book" size={22} />, words, "O'rganilgan so'z", '#6366f1'],
          [<Ic name="medal" size={22} />, state.longestStreak, 'Eng uzun seriya', '#f97316'],
          [<Ic name="shield" size={22} />, state.perfectLessons, 'Xatosiz dars', '#ef4444'],
          [LEAGUES[state.league.tier].icon, LEAGUES[state.league.tier].name, 'Turnir ligasi', '#22c55e'],
        ].map(([ico, val, label, c]) => (
          <div key={String(label)} className="pf-stat" style={{ ['--c' as string]: String(c) }}>
            <span className="pf-stat-ico">{ico}</span>
            <b>{val}</b>
            <small>{label}</small>
          </div>
        ))}
      </div>

      <h2 className="section-title">Shu hafta</h2>
      <section className="pf-week">
        <div className="pf-week-head">
          <span>
            <b>{weekXp}</b> XP
            <small>bu hafta</small>
          </span>
          <span className="pf-goal"><Ic name="target" size={14} /> {`Kunlik maqsad: ${state.dailyGoal} XP`}</span>
        </div>
        <WeekStrip />
      <div className="xp-chart" aria-label="So'nggi 14 kunlik XP">
        <div className="xp-bars">
          {days.map((d) => {
            const v = state.xpByDay[d] ?? 0;
            return (
              <div key={d} className="xp-col" title={`${d}: ${v} XP`}>
                <div className={`xp-bar ${v >= state.dailyGoal ? 'goal' : ''}`} style={{ height: `${(v / max) * 100}%` }} />
              </div>
            );
          })}
          <DrawLine values={days.map((d) => state.xpByDay[d] ?? 0)} max={max} />
          <div className="xp-goal" style={{ bottom: `${(state.dailyGoal / max) * 100}%` }}>
            <span>{`maqsad ${state.dailyGoal}`}</span>
          </div>
        </div>
        <div className="xp-labels">
          {days.map((d) => (
            <small key={d}>{Number(d.slice(8))}</small>
          ))}
        </div>
      </div>
      </section>

      <Folder
        className="ach-folder"
        icon={<Ic name="trophy" size={22} />}
        title="Yutuqlar"
        summary={`${ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length} / ${ACHIEVEMENTS.length} ochilgan`}
      >
        {ACHIEVEMENTS.map((a) => {
          const p = Math.min(a.goal, a.progress(state));
          const done = !!state.achievements[a.id];
          return (
            <div key={a.id} className={`ach ${done ? 'done' : ''}`}>
              <div className="ach-icon">{a.icon}</div>
              <div className="ach-body">
                <b>{a.title}</b>
                <small>{a.desc}</small>
                <div className="ach-bar">
                  <i style={{ width: `${(p / a.goal) * 100}%` }} />
                </div>
              </div>
              <span className="ach-count">
                {p}/{a.goal}
              </span>
            </div>
          );
        })}
      </Folder>

      <h2 className="section-title">Sozlamalar</h2>
      <div className="settings">
        <LanguageSetting />
        <ThemeSetting />
        <TabMotionSetting />
        {liquidGlassSupported() && (
          <label className="setting">
            <span><Ic name="sparkle" size={18} /> Suyuq shisha (Liquid Glass)</span>
            <input type="checkbox" defaultChecked={readLiquidGlass()} onChange={(e) => saveLiquidGlass(e.target.checked)} />
          </label>
        )}
        <PinSetting />
        <label className="setting">
          <span><Ic name="bolt" size={18} /> Yengil rejim (sekin telefonlar uchun)</span>
          <input
            type="checkbox"
            defaultChecked={document.documentElement.classList.contains('lite')}
            onChange={(e) => {
              document.documentElement.classList.toggle('lite', e.target.checked);
              try {
                localStorage.setItem('salut.lite', e.target.checked ? '1' : '0');
              } catch {
                /* e'tiborsiz */
              }
            }}
          />
        </label>
        <label className="setting">
          <span><Ic name="speaker" size={18} /> Ovoz effektlari</span>
          <input type="checkbox" checked={state.settings.sound} onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, sound: e.target.checked } }))} />
        </label>
        <label className="setting">
          <span><Ic name="headphones" size={18} /> Tinglash mashqlari</span>
          <input type="checkbox" checked={state.settings.listening} onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, listening: e.target.checked } }))} />
        </label>
        <label className="setting">
          <span><Ic name="mic" size={18} /> Talaffuz tezligi</span>
          <RangeValue
            min={0.5}
            max={1.2}
            step={0.05}
            value={state.settings.ttsRate}
            ariaLabel="Talaffuz tezligi"
            onChange={(v) => update((s) => ({ ...s, settings: { ...s.settings, ttsRate: v } }))}
          />
        </label>
        <div className="setting">
          <span><Ic name="target" size={18} /> Kunlik maqsad</span>
          <div className="seg">
            {[10, 20, 30, 50].map((g) => (
              <button key={g} type="button" className={state.dailyGoal === g ? 'on' : ''} onClick={() => update((s) => ({ ...s, dailyGoal: g }))}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>
      <h2 className="section-title">Fikringiz</h2>
      <div className="panel rv-profile">
        <ReviewForm />
      </div>

      <a className="btn btn-ghost btn-lg about-link" href="#/about">
        <Ic name="info" size={18} /> Biz haqimizda · ijtimoiy tarmoqlar · ulashish
      </a>
      <p className="legal-links">
        <a href="./privacy.html" target="_blank" rel="noreferrer">Maxfiylik siyosati</a> · <a href="./terms.html" target="_blank" rel="noreferrer">Foydalanish shartlari</a>
      </p>
      <div className="reset-zone">
        <HoldButton holdingLabel="O'chirilmoqda — qo'yib yubormang…" ms={1600} onDone={reset}>
          Progressni o'chirish — bosib turing
        </HoldButton>
        <small className="muted">Ball, seriya, so'zlar va yutuqlar qaytarib bo'lmaydigan tarzda o'chadi.</small>
      </div>
    </div>
  );
}

/** Ilova (interfeys) tili — 12 til. Tanlansa sahifa darhol shu tilga o'tadi. */
function LanguageSetting() {
  const [lang, setL] = useState<Lang>(() => currentLang());
  useEffect(() => {
    const on = (e: Event) => setL((e as CustomEvent<Lang>).detail);
    window.addEventListener(LANG_EVENT, on);
    return () => window.removeEventListener(LANG_EVENT, on);
  }, []);
  const cur = LANGUAGES.find((l) => l.id === lang) ?? LANGUAGES[0];
  return (
    <Folder className="setting-folder lang-folder" icon={<Ic name="globe" size={22} />} title="Ilova tili" summary={<span data-no-i18n>{cur.flag} {cur.name}</span>}>
      {LANGUAGES.map((l) => (
        <button key={l.id} type="button" role="radio" aria-checked={lang === l.id} className={`lang-chip ${lang === l.id ? 'on' : ''}`} onClick={() => void chooseLanguage(l.id)} data-no-i18n>
          <span className="lang-flag">{l.flag}</span>
          <b>{l.name}</b>
          {lang === l.id && <span className="lang-tick">✓</span>}
        </button>
      ))}
    </Folder>
  );
}

function ThemeSetting() {
  const [pref, setPref] = useState<ThemePref>(themePref());
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme !== 'light');
  const apply = (p: ThemePref) => {
    // Mavzu almashganda ranglar keskin emas, yumshoq o'tadi.
    const html = document.documentElement;
    html.classList.add('theme-anim');
    setPref(p);
    setThemePref(p);
    setDark(html.dataset.theme !== 'light');
    window.setTimeout(() => html.classList.remove('theme-anim'), 700);
  };
  return (
    <div className="setting theme-setting">
      <span>
        <Ic name="palette" size={18} /> Ko'rinish
        <br />
        <small className="muted">{pref === 'auto' ? 'Avto — telefon sozlamasiga qarab' : dark ? 'Tungi rejim' : 'Kunduzgi rejim'}</small>
      </span>
      <div className="theme-controls">
        <ThemeToggle dark={dark} onToggle={(next) => apply(next ? 'dark' : 'light')} />
        <button type="button" className={`theme-auto ${pref === 'auto' ? 'on' : ''}`} aria-pressed={pref === 'auto'} onClick={() => apply(pref === 'auto' ? (dark ? 'dark' : 'light') : 'auto')}>
          <Ic name="moon" size={14} /> Avto
        </button>
      </div>
    </div>
  );
}

/** Pastki menyu o'tish animatsiyasi (videodagi 6 uslub). Tanlansa — menyu darhol namoyish qiladi. */
function TabMotionSetting() {
  const current = useTabMotion();
  const name = TAB_MOTIONS.find((m) => m.id === current)?.name ?? '';
  return (
    <Folder className="setting-folder tm-folder" icon={<Ic name="sparkle" size={22} />} title="Menyu animatsiyasi" summary={`Tanlangan: ${name}`}>
      {TAB_MOTIONS.map((m) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={current === m.id}
          className={`tm-chip tm-chip-${m.id} ${current === m.id ? 'on' : ''}`}
          onClick={() => saveTabMotion(m.id)}
        >
          <b>{m.name}</b>
          <small>{m.note}</small>
        </button>
      ))}
    </Folder>
  );
}

/** Shaxsiy PIN: qo'yilsa, ilova ochilganda «OTP» uslubidagi qulf ekrani PIN so'raydi. */
function PinSetting() {
  const [on, setOn] = useState(hasPin);
  const [sheet, setSheet] = useState<null | 'set' | 'change' | 'off'>(null);
  const verifyCurrent = async (pin: string): Promise<true | string> => {
    const r = await verifyPin(pin);
    return r.ok ? true : r.waitMs ? `Juda ko'p urinish. ${Math.ceil(r.waitMs / 1000)} soniya kuting.` : "Noto'g'ri PIN.";
  };
  return (
    <div className="setting pin-setting">
      <span>
        <Ic name="lock" size={18} /> Kirish paroli (PIN)
        <br />
        <small className="muted">{on ? 'Yoqilgan — ilova ochilganda PIN so‘raladi.' : 'O‘chiq. Shaxsiy 4 xonali PIN qo‘ying.'}</small>
      </span>
      {on ? (
        <span className="pin-actions">
          <button type="button" className="btn btn-ghost small" onClick={() => setSheet('change')}>O'zgartirish</button>
          <button type="button" className="btn btn-text small" onClick={() => setSheet('off')}>O'chirish</button>
        </span>
      ) : (
        <button type="button" className="btn btn-primary small" onClick={() => setSheet('set')}>PIN qo'yish</button>
      )}
      {sheet && (
        <PinSetupSheet
          mode={sheet}
          verifyCurrent={verifyCurrent}
          save={setPin}
          remove={clearPin}
          onClose={() => {
            setSheet(null);
            setOn(hasPin());
          }}
        />
      )}
    </div>
  );
}
