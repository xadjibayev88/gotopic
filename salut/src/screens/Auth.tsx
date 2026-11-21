// Kirish / ro'yxatdan o'tish: Google, email + parol, yoki mehmon sifatida davom etish.
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '../state/account';
import { Mascot } from '../components/Mascot';

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

export function AuthScreen({ initial = 'register', onDone, onSkip, title }: { initial?: 'login' | 'register'; onDone: () => void; onSkip?: () => void; title?: string }) {
  const { me, signIn, signInGoogle } = useAccount();
  const [mode, setMode] = useState(initial);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gBtn = useRef<HTMLDivElement>(null);
  const clientId = me.googleClientId;
  const native = !!window.AndroidAuth;

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
            else onDone();
          },
        });
        window.google.accounts.id.renderButton(gBtn.current, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with', width: Math.min(360, gBtn.current.clientWidth || 320), locale: 'uz' });
      })
      .catch(() => alive && setError("Google bilan kirish yuklanmadi — email orqali kiring"));
    return () => {
      alive = false;
    };
  }, [clientId, native]); // eslint-disable-line react-hooks/exhaustive-deps

  const nativeGoogle = async () => {
    if (!clientId) return;
    setBusy(true);
    setError(null);
    try {
      const token = await androidGoogle(clientId);
      const err = await signInGoogle(token);
      if (err) setError(err);
      else onDone();
    } catch (e) {
      if (!/cancel/i.test(String((e as Error).message))) setError('Google bilan kirib bo\'lmadi — email orqali urinib ko\'ring');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await signIn(mode, email, password, name);
    setBusy(false);
    if (err) setError(err);
    else onDone();
  };

  return (
    <div className="auth">
      <div className="auth-hero">
        <Mascot mood="cheer" size={110} />
        <h1>{title ?? (mode === 'register' ? 'Profil yarating' : 'Xush kelibsiz!')}</h1>
        <p className="muted">{mode === 'register' ? "Progressingiz saqlanadi va istalgan qurilmada davom etasiz." : 'Hisobingizga kiring va o\'qishni davom ettiring.'}</p>
      </div>

      <div className="auth-card">
        {clientId &&
          (native ? (
            <button type="button" className="btn btn-google btn-lg" disabled={busy} onClick={nativeGoogle}>
              <span className="g-logo">G</span> Google bilan davom etish
            </button>
          ) : (
            <div className="gis-wrap" ref={gBtn} />
          ))}
        {clientId && <div className="auth-or"><span>yoki email bilan</span></div>}
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <input className="text-input" placeholder="Ismingiz" autoComplete="given-name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          )}
          <input className="text-input" type="email" placeholder="Email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="text-input"
            type="password"
            placeholder={mode === 'register' ? 'Parol (kamida 8 ta belgi)' : 'Parol'}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
            minLength={mode === 'register' ? 8 : 1}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
            {busy ? 'Kuting…' : mode === 'register' ? 'Profil yaratish' : 'Kirish'}
          </button>
        </form>
        <button type="button" className="btn btn-text" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(null); }}>
          {mode === 'register' ? 'Menda hisob bor — kirish' : "Hisobim yo'q — profil yaratish"}
        </button>
        {onSkip && (
          <button type="button" className="btn btn-text muted-btn" onClick={onSkip}>
            Keyinroq
          </button>
        )}
      </div>
      <p className="auth-legal">Davom etish orqali siz foydalanish shartlari va maxfiylik siyosatiga rozilik bildirasiz.</p>
    </div>
  );
}
