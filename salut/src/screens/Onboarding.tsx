import { useState } from 'react';
import { useStore } from '../state/store';
import { Mascot } from '../components/Mascot';
import { speak } from '../engine/audio';
import { AuthScreen } from './Auth';
import { useAccount } from '../state/account';

const GOALS = [
  { xp: 10, label: 'Yengil', time: '5 daqiqa / kun' },
  { xp: 20, label: "O'rtacha", time: '10 daqiqa / kun' },
  { xp: 30, label: 'Jiddiy', time: '15 daqiqa / kun' },
  { xp: 50, label: 'Shiddatli', time: '20+ daqiqa / kun' },
];

const REASONS = ['✈️ Sayohat', '🎓 O\'qish', '💼 Ish', '🎬 Madaniyat', '🧠 Miya mashqi', '💡 Shunchaki qiziq'];

export function Onboarding() {
  const { update } = useStore();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(20);
  const [reason, setReason] = useState<string | null>(null);
  const [name, setName] = useState('');

  const { me } = useAccount();
  const [auth, setAuth] = useState<null | 'login' | 'register'>(null);
  const finish = () => update((s) => ({ ...s, onboarded: true, dailyGoal: goal, name: name.trim() || me.user?.name || s.name }));

  if (auth) {
    return (
      <div className="onboard">
        <div className="onboard-top">
          <button type="button" className="icon-btn" onClick={() => setAuth(null)} aria-label="Orqaga">
            ←
          </button>
        </div>
        <AuthScreen
          initial={auth}
          onDone={() => {
            // Serverdagi progress yuklansa, ilova o'zi asosiy ekranga o'tadi; yangi hisob bo'lsa — onboarding davom etadi.
            setAuth(null);
            if (step === 3) finish();
            else if (step === 0) setStep(1);
          }}
          onSkip={step === 3 ? finish : undefined}
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
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>
      )}

      {step === 0 && (
        <div className="onboard-hero">
          <Mascot mood="cheer" size={200} className="bounce-in" />
          <h1 className="brand">Salut!</h1>
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
          <button type="button" className="btn btn-success btn-lg" disabled={!reason} onClick={() => setStep(2)}>
            Davom etish
          </button>
        </div>
      )}

      {step === 2 && (
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
          <button type="button" className="btn btn-success btn-lg" onClick={() => setStep(3)}>
            Davom etish
          </button>
        </div>
      )}

      {step === 3 && (
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
