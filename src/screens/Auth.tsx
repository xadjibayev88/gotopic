// Kirish / ro'yxatdan o'tish: Google, email + parol, yoki mehmon sifatida davom etish.
import { grantAllAiConsent } from '../state/ai-consent';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '../state/account';
import { SocialLogin } from '../components/SocialLogin';
import { motionAllowed } from '../engine/motion';
import { createPortal } from 'react-dom';
import { KruaLive } from '../components/KruaLive';
import { Ic } from '../components/Icons';
import type { ViviCue } from '../shared/vivi-cue';

type GoogleId = {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string; auto_select?: boolean; itp_support?: boolean }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
type AndroidAuth = { googleSignIn: (requestId: string, clientId: string) => void };
declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleId } };
    AndroidAuth?: AndroidAuth;
    __salutAuthResolve?: (id: string, token: string) => void;
    __salutAuthReject?: (id: string, message: string) => void;
  }
}

let gisPromise: Promise<void> | null = null;
function loadGis(): Promise<void> {
  gisPromise ??= new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gisPromise = null;
      reject(new Error('gis'));
    };
    document.head.appendChild(s);
  });
  return gisPromise;
}

/** Android ilovada: telefondagi Google hisobidan (Credential Manager) ID token. */
function androidGoogle(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = String(Date.now());
    window.__salutAuthResolve = (rid, token) => rid === id && resolve(token);
    window.__salutAuthReject = (rid, message) => rid === id && reject(new Error(message));
    window.AndroidAuth!.googleSignIn(id, clientId);
  });
}

const Icon = {
  user: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20c.9-3.6 3.7-5.6 7.2-5.6s6.3 2 7.2 5.6" /></svg>,
  mail: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 7 7.5 6 7.5-6" /></svg>,
  lock: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>,
  eye: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></svg>,
  eyeOff: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l18 18M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.2 3.9M6.4 6.9C3.9 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1" /></svg>,
  arrow: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
};

type Field = 'name' | 'email' | 'pass' | null;

/**
 * To'liq ekranli kirish / ro'yxatdan o'tish. Tepada jonli Vivi bilan gradient panel, pastda forma;
 * rejim almashganda panel sirpanib qarama-qarshi tomonga o'tadi (videodagi «sliding panel», vertikal).
 * Ochiq turganda pastki va yuqori menyular ko'rinmaydi (portal + to'liq qoplama), sahifa bir ekranga sig'adi.
 */
export function AuthScreen({ initial = 'register', onDone, onSkip, title }: { initial?: 'login' | 'register'; onDone: () => void; onSkip?: () => void; title?: string; backdrop?: boolean }) {
  const { me, signIn, signInGoogle } = useAccount();
  const [mode, setMode] = useState(initial);
  const [panelDown, setPanelDown] = useState(initial === 'login');
  const [agree, setAgree] = useState(false);
  const agreeRef = useRef(false);
  agreeRef.current = agree;
  const modeRef = useRef(initial);
  modeRef.current = mode;
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focus, setFocus] = useState<Field>(null);
  const [done, setDone] = useState(false);
  const [switching, setSwitching] = useState(false);
  const gBtn = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const clientId = me.googleClientId;
  const native = !!window.AndroidAuth;
  const login = mode === 'login';

  // Ochiq turganda orqadagi sahifa aylanmasin.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('auth-open');
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove('auth-open');
    };
  }, []);

  const finish = () => {
    if (modeRef.current === 'register' && agreeRef.current) void grantAllAiConsent().catch(() => undefined);
    setDone(true);
    timers.current.push(window.setTimeout(onDone, motionAllowed() ? 650 : 0));
  };

  /** Panel sirpanadi; forma o'rtada almashadi. */
  const switchMode = () => {
    if (switching) return;
    const next = login ? 'register' : 'login';
    setError(null);
    if (!motionAllowed()) {
      setMode(next);
      setPanelDown(next === 'login');
      return;
    }
    setSwitching(true);
    setPanelDown(next === 'login');
    timers.current.push(window.setTimeout(() => setMode(next), 330));
    timers.current.push(window.setTimeout(() => setSwitching(false), 760));
  };

  useEffect(() => {
    if (!clientId || native) return;
    let alive = true;
    loadGis()
      .then(() => {
        if (!alive || !gBtn.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          itp_support: true,
          callback: async (r) => {
            setBusy(true);
            const err = await signInGoogle(r.credential);
            setBusy(false);
            if (err) setError(err);
            else finish();
          },
        });
        window.google.accounts.id.renderButton(gBtn.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: Math.min(360, gBtn.current.clientWidth || 320), locale: 'uz' });
      })
      .catch(() => alive && setError("Google bilan kirish yuklanmadi — email orqali kiring"));
    return () => {
      alive = false;
    };
  }, [clientId, native, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const nativeGoogle = async () => {
    if (!clientId) return;
    setBusy(true);
    setError(null);
    try {
      const token = await androidGoogle(clientId);
      const err = await signInGoogle(token);
      if (err) setError(err);
      else finish();
    } catch (e) {
      if (!/cancel/i.test(String((e as Error).message))) setError('Google bilan kirib bo\'lmadi — email orqali urinib ko\'ring');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login && !agree) {
      setError("Ro'yxatdan o'tish uchun Vivi AI va maxfiylik shartlariga rozilik bering.");
      return;
    }
    setBusy(true);
    setError(null);
    const err = await signIn(mode, email, password, name);
    setBusy(false);
    if (err) setError(err);
    else finish();
  };

  // Jonli Vivi: forma bilan birga «yashaydi».
  const cue: ViviCue = done
    ? { state: 'idle', face: 'proud', action: 'hop', ornament: 'sparkle' }
    : busy
      ? { state: 'thinking', face: 'curious', ornament: 'thought_dots' }
      : error
        ? { state: 'idle', face: 'confused', action: 'head_tilt' }
        : switching
          ? { state: 'idle', face: 'surprised', action: 'hop' }
          : focus === 'pass'
            ? { state: 'listening', face: 'amused', action: 'blink' }
            : focus === 'email' || focus === 'name'
              ? { state: 'listening', face: 'curious', action: 'ear_perk' }
              : !login && agree
                ? { state: 'idle', face: 'happy', action: 'tail_wag', ornament: 'heart' }
                : { state: 'idle', face: 'happy', action: 'wave' };

  const hasSocial = !!(clientId || me.auth?.facebookAppId || me.auth?.appleClientId || me.auth?.telegramBot);
  const locked = !login && !agree;
  return createPortal(
    <div className={`authx ${panelDown ? 'is-down' : ''} ${switching ? 'is-switching' : ''} ${done ? 'is-done' : ''}`} role="dialog" aria-modal="true" aria-label={login ? 'Kirish' : "Ro'yxatdan o'tish"}>
      <section className="authx-panel">
        <span className="authx-blob b1" aria-hidden="true" />
        <span className="authx-blob b2" aria-hidden="true" />
        {onSkip && (
          <button type="button" className="authx-close" onClick={onSkip} aria-label="Yopish">
            <Ic name="close" size={18} />
          </button>
        )}
        <div className="authx-vivi">
          <KruaLive cue={cue} size={118} />
        </div>
        <div className="authx-hello">
          <h2>{login ? 'Yana salom!' : 'Salut, do\'stim!'}</h2>
          <p>{login ? "Hisobingiz yo'qmi? Bir daqiqada yarating." : 'Hisobingiz bormi? Kirib, progressni davom ettiring.'}</p>
          <button type="button" className="authx-ghost" onClick={switchMode} disabled={switching || busy}>
            {login ? 'Profil yaratish' : 'Kirish'}
          </button>
        </div>
      </section>

      <section className="authx-form">
        <div className="authx-inner" key={mode}>
          <h1>{login ? 'Kirish' : title ?? 'Profil yarating'}</h1>
          {hasSocial && (
            <div className={`authx-social ${locked ? 'ga-locked' : ''}`} aria-disabled={locked}>
              {clientId &&
                (native ? (
                  <button type="button" className="ga-social-btn" disabled={busy} onClick={nativeGoogle}>
                    <span className="g-logo">G</span> Google
                  </button>
                ) : (
                  <div className="ga-slot gis-wrap" ref={gBtn} />
                ))}
              <SocialLogin onDone={finish} onError={setError} />
            </div>
          )}
          {hasSocial && <div className="authx-or"><span>yoki email bilan</span></div>}

          <form onSubmit={submit} className="authx-fields">
            {!login && (
              <label className="authx-input">
                {Icon.user}
                <input placeholder="Ismingiz" aria-label="Ismingiz" autoComplete="given-name" value={name} maxLength={40} onFocus={() => setFocus('name')} onBlur={() => setFocus(null)} onChange={(e) => setName(e.target.value)} />
              </label>
            )}
            <label className="authx-input">
              {Icon.mail}
              <input type="email" placeholder="Email manzil" aria-label="Email manzil" autoComplete="email" required value={email} onFocus={() => setFocus('email')} onBlur={() => setFocus(null)} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="authx-input">
              {Icon.lock}
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={login ? 'Parol' : 'Parol (kamida 8 ta belgi)'}
                aria-label="Parol"
                autoComplete={login ? 'current-password' : 'new-password'}
                required
                minLength={login ? 1 : 8}
                value={password}
                onFocus={() => setFocus('pass')}
                onBlur={() => setFocus(null)}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="ga-eye" aria-label={showPass ? 'Parolni yashirish' : "Parolni ko'rsatish"} onClick={() => setShowPass((v) => !v)}>
                {showPass ? Icon.eyeOff : Icon.eye}
              </button>
            </label>
            {!login && (
              <label className={`authx-consent ${agree ? 'on' : ''}`}>
                <span>
                  <b>Vivi AI va maxfiylik shartlariga roziman</b>
                  <small>Suhbat, ovoz, tarjima va xotira uchun matn/audio Google Gemini'ga yuboriladi. Profilda istalgan payt o'zgartirasiz.</small>
                </span>
                <input type="checkbox" checked={agree} onChange={(e) => { setAgree(e.target.checked); setError(null); }} />
              </label>
            )}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button type="submit" className="authx-submit" disabled={busy || locked}>
              {busy ? 'Kuting…' : login ? 'Kirish' : 'Profil yaratish'} {!busy && Icon.arrow}
            </button>
          </form>

          <p className="authx-legal">
            <a href="./terms.html" target="_blank" rel="noreferrer">Foydalanish shartlari</a>
            <i aria-hidden="true">·</i>
            <a href="./privacy.html" target="_blank" rel="noreferrer">Maxfiylik siyosati</a>
            {onSkip && (
              <>
                <i aria-hidden="true">·</i>
                <button type="button" onClick={onSkip}>Keyinroq</button>
              </>
            )}
          </p>
        </div>
      </section>
    </div>,
    document.body,
  );
}
