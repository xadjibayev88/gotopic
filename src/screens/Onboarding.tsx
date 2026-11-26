import { currentLang, LANGUAGES, type Lang } from '../i18n';
import { chooseLanguage } from '../i18n/choose';
import { useState } from 'react';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import { speak } from '../engine/audio';
import { AuthScreen } from './Auth';
import { useAccount } from '../state/account';
import { Ic, type IconName } from '../components/Icons';
import type { Cefr } from '../data/course';

/** Ilova haqida qisqa tanishtiruv kartalari. */
const FEATURES: { icon: IconName; title: string; text: string; c1: string; c2: string }[] = [
  { icon: 'compass', title: 'Darslar xaritasi', text: "A1 dan C2 gacha 50 ta liniya — o'yin kabi, pastdan tepaga. Yulduz yig'ing!", c1: '#7FE3FF', c2: '#B49CFF' },
  { icon: 'chat', title: 'Vivi AI — jonli ustoz', text: "Ovozli va matnli suhbat, xatolar tahlili. Gemini Live bilan real vaqtda (Super).", c1: '#B49CFF', c2: '#FF8FD0' },
  { icon: 'trophy', title: 'Turnir va seriya', text: "Har hafta 20 kishilik guruh: Kurtak ligasidan Afsonagacha ko'tariling.", c1: '#FFD23F', c2: '#FF6B9A' },
  { icon: 'gift', title: 'Sirli qutilar va baliqchalar', text: "Bekatlardagi qutilarda sovg'alar. Baliqchalar — Vivining «joni», xato qilsangiz kamayadi.", c1: '#FF8FD0', c2: '#9B5CFF' },
];

/** Daraja so'rovi: A1 dan yuqorisi tanlansa — tanishtiruvdan keyin o'sha darajaga qisqa test (o'tsa — oldingi darslar ochiladi). */
const LEVELS: { id: string; title: string; sub: string; bars: number; jump: Cefr | null }[] = [
  { id: 'zero', title: 'Umuman bilmayman', sub: "Noldan boshlayman", bars: 0, jump: null },
  { id: 'words', title: "Bir necha so'z bilaman", sub: 'Bonjour, merci, au revoir…', bars: 1, jump: null },
  { id: 'basic', title: 'Oddiy gaplar tuzaman', sub: "O'zim haqimda gapira olaman — A2", bars: 2, jump: 'A2' },
  { id: 'talk', title: 'Suhbatlasha olaman', sub: 'Kundalik mavzularda — B1', bars: 3, jump: 'B1' },
  { id: 'fluent', title: 'Erkin gapiraman', sub: 'Murakkab mavzular — B2', bars: 4, jump: 'B2' },
];
const PENDING_JUMP = 'voila.pendingJump';

const GOALS = [
  { xp: 10, label: 'Yengil', time: '5 daqiqa / kun' },
  { xp: 20, label: "O'rtacha", time: '10 daqiqa / kun' },
  { xp: 30, label: 'Jiddiy', time: '15 daqiqa / kun' },
  { xp: 50, label: 'Shiddatli', time: '20+ daqiqa / kun' },
];

const REASONS = ['✈️ Sayohat', '🎓 O\'qish', '💼 Ish', '🎬 Madaniyat', '🧠 Miya mashqi', '💡 Shunchaki qiziq'];

/** Birinchi ekrandagi til tanlash (ixcham). */
function LangPick() {
  const [lang, setL] = useState<Lang>(() => currentLang());
  return (
    <label className="onboard-lang" data-no-i18n>
      <span aria-hidden="true">🌐</span>
      <select
        aria-label="Language"
        value={lang}
        onChange={(e) => {
          const l = e.target.value as Lang;
          setL(l);
          void chooseLanguage(l);
        }}
      >
        {LANGUAGES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.flag} {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Onboarding() {
  const { update } = useStore();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(20);
  const [reason, setReason] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const LAST = 5;
  const [name, setName] = useState('');

  const { me } = useAccount();
  const [auth, setAuth] = useState<null | 'login' | 'register'>(null);
  const finish = () => {
    const jump = LEVELS.find((l) => l.id === level)?.jump;
    try {
      if (jump) localStorage.setItem(PENDING_JUMP, jump);
    } catch {
      /* e'tiborsiz */
    }
    update((s) => ({ ...s, onboarded: true, dailyGoal: goal, name: name.trim() || me.user?.name || s.name }));
  };

  if (auth) {
    return (
      <div className="onboard">
        <div className="onboard-top">
          <button type="button" className="icon-btn" onClick={() => setAuth(null)} aria-label="Orqaga">
            ←
          </button>
        </div>
        <AuthScreen
          backdrop
          initial={auth}
          onDone={() => {
            // Serverdagi progress yuklansa, ilova o'zi asosiy ekranga o'tadi; yangi hisob bo'lsa — onboarding davom etadi.
            setAuth(null);
            if (step === LAST) finish();
            else if (step === 0) setStep(1);
          }}
          onSkip={step === LAST ? finish : () => setAuth(null)}
        />
      </div>
    );
  }

  return (
    <div className="onboard">
      {step > 0 && (
        <div className="onboard-top">
          <button type="button" className="icon-btn" onClick={() => setStep(step - 1)} aria-label="Orqaga">
            ←
          </button>
          <div className="progress">
            <div className="progress-fill" style={{ width: `${(step / LAST) * 100}%` }} />
          </div>
        </div>
      )}

      {step === 0 && (
        <div className="onboard-hero">
          <LangPick />
          <Mascot mood="cheer" size={200} className="bounce-in" />
          <h1 className="brand">Voilà!</h1>
          <p className="lead">Fransuz tilini o'zbek tilida — bepul, qiziqarli va samarali.</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => { speak('Salut ! Bienvenue !'); setStep(1); }}>
            Boshlash
          </button>
          {!me.user && (
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => setAuth('login')}>
              Menda hisob bor
            </button>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="onboard-step ob-intro">
          <div className="say">
            <Mascot mood="happy" size={90} />
            <div className="bubble">Voilà! da sizni nimalar kutmoqda 👇</div>
          </div>
          <div className="ob-features">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="ob-feature" style={{ ['--c1' as string]: f.c1, ['--c2' as string]: f.c2, ['--i' as string]: i }}>
                <span className="ob-f-ico">
                  <Ic name={f.icon} size={26} />
                </span>
                <span>
                  <b>{f.title}</b>
                  <small>{f.text}</small>
                </span>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-success btn-lg" onClick={() => setStep(2)}>
            Ajoyib, davom etamiz
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="onboard-step">
          <div className="say">
            <Mascot mood="think" size={90} />
            <div className="bubble">Fransuz tilini qanchalik bilasiz?</div>
          </div>
          <div className="options ob-levels">
            {LEVELS.map((l) => (
              <button key={l.id} type="button" className={`option row ob-level ${level === l.id ? 'selected' : ''}`} onClick={() => setLevel(l.id)}>
                <span className="ob-bars" aria-hidden="true">
                  {[0, 1, 2, 3].map((k) => (
                    <i key={k} className={k < l.bars ? 'on' : ''} />
                  ))}
                </span>
                <span className="ob-level-text">
                  <b>{l.title}</b>
                  <span className="muted">{l.sub}</span>
                </span>
              </button>
            ))}
          </div>
          {LEVELS.find((l) => l.id === level)?.jump && (
            <p className="ob-note">
              <Ic name="bolt" size={16} /> {`Tanishuvdan so'ng ${LEVELS.find((l) => l.id === level)!.jump} darajasiga qisqa test — o'tsangiz, oldingi darslar ochiladi.`}
            </p>
          )}
          <button type="button" className="btn btn-success btn-lg" disabled={!level} onClick={() => setStep(4)}>
            Davom etish
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="onboard-step">
          <div className="say">
            <Mascot mood="think" size={90} />
            <div className="bubble">Nima uchun fransuz tilini o'rganmoqchisiz?</div>
          </div>
          <div className="options">
            {REASONS.map((r) => (
              <button key={r} type="button" className={`option ${reason === r ? 'selected' : ''}`} onClick={() => setReason(r)}>
                {r}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-success btn-lg" disabled={!reason} onClick={() => setStep(3)}>
            Davom etish
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="onboard-step">
          <div className="say">
            <Mascot mood="happy" size={90} />
            <div className="bubble">Kunlik maqsadingizni tanlang</div>
          </div>
          <div className="options">
            {GOALS.map((g) => (
              <button key={g.xp} type="button" className={`option row ${goal === g.xp ? 'selected' : ''}`} onClick={() => setGoal(g.xp)}>
                <b>{g.label}</b>
                <span className="muted">{g.time}</span>
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-success btn-lg" onClick={() => setStep(5)}>
            Davom etish
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="onboard-step">
          <div className="say">
            <Mascot mood="cheer" size={90} />
            <div className="bubble">Ismingiz nima? «Je m'appelle ...»</div>
          </div>
          <input className="text-input" autoFocus value={name} maxLength={24} placeholder="Ismingiz" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && name.trim() && (me.user ? finish() : setAuth('register'))} />
          <button type="button" className="btn btn-primary btn-lg" disabled={!name.trim()} onClick={() => (me.user ? finish() : setAuth('register'))}>
            Davom etish
          </button>
        </div>
      )}
    </div>
  );
}
