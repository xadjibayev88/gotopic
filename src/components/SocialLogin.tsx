// Facebook, Apple va Telegram orqali kirish. Har bir tugma faqat server sozlangan bo'lsa ko'rinadi.
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '../state/account';

type FB = { init: (o: Record<string, unknown>) => void; login: (cb: (r: { authResponse?: { accessToken?: string } }) => void, o?: Record<string, unknown>) => void };
type AppleAuth = { auth: { init: (o: Record<string, unknown>) => void; signIn: () => Promise<{ authorization?: { id_token?: string }; user?: { name?: { firstName?: string } } }> } };
declare global {
  interface Window {
    FB?: FB;
    AppleID?: AppleAuth;
    Telegram?: {
      WebApp?: { initData?: string };
      Login?: { auth: (o: { bot_id: number; request_access?: string; lang?: string }, cb: (user: Record<string, unknown> | false) => void) => void };
    };
  }
}

const scripts = new Map<string, Promise<void>>();
function loadScript(src: string): Promise<void> {
  let p = scripts.get(src);
  if (!p) {
    p = new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => ok();
      s.onerror = () => {
        scripts.delete(src);
        fail(new Error(src));
      };
      document.head.appendChild(s);
    });
    scripts.set(src, p);
  }
  return p;
}

export function SocialLogin({ onDone, onError }: { onDone: () => void; onError: (m: string) => void }) {
  const { me, signInSocial } = useAccount();
  const cfg = me.auth;
  const [busy, setBusy] = useState<string | null>(null);
  const tgWebApp = typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;

  const finish = async (provider: 'facebook' | 'apple' | 'telegram', payload: Record<string, unknown>) => {
    setBusy(provider);
    const err = await signInSocial(provider, payload);
    setBusy(null);
    if (err) onError(err);
    else onDone();
  };

  // Telegram (sayt/brauzer): bosilganda Telegram ilovasi ochiladi (t.me/<bot>?start=login_<kod>), botda
  // «Tasdiqlash» bosiladi — sayt fonda kutib turadi va o'zi kiradi. Popup va telefon raqami so'ralmaydi.
  const [tgWait, setTgWait] = useState<{ code: string; bot: string } | null>(null);
  const prefetched = useRef<Promise<{ code: string; bot: string } | null> | null>(null);
  const newCode = () =>
    fetch('./api/auth/telegram/start', { method: 'POST', credentials: 'include' })
      .then((r) => (r.ok ? (r.json() as Promise<{ code: string; bot: string }>) : null))
      .catch(() => null);
  // Kodni oldindan olamiz — bosilganda Telegram darhol ochiladi (brauzer tashqi ilovani faqat bosish paytida ochadi).
  useEffect(() => {
    if (cfg?.telegramBot && !tgWebApp && !prefetched.current) prefetched.current = newCode();
  }, [cfg?.telegramBot, tgWebApp]); // eslint-disable-line react-hooks/exhaustive-deps
  const tgLink = (w: { code: string; bot: string }) => `https://t.me/${w.bot}?start=login_${w.code}`;
  const openTelegram = (w: { code: string; bot: string }) => {
    // tg:// — o'rnatilgan Telegram ilovasini sahifani tark etmasdan ochadi; ochilmasa pastdagi havola bor.
    location.href = `tg://resolve?domain=${w.bot}&start=login_${w.code}`;
  };
  const telegram = async () => {
    setBusy('telegram');
    let w = await (prefetched.current ?? newCode());
    prefetched.current = null;
    if (!w) w = await newCode();
    if (!w) {
      setBusy(null);
      return onError("Telegram bilan kirish hozir ishlamayapti — boshqa usul bilan kiring");
    }
    setTgWait(w);
    openTelegram(w);
  };
  useEffect(() => {
    if (!tgWait) return;
    let stop = false;
    const started = Date.now();
    const check = async () => {
      if (stop) return;
      const r = await fetch(`./api/auth/telegram/check?code=${encodeURIComponent(tgWait.code)}`, { credentials: 'include' })
        .then((x) => (x.ok ? (x.json() as Promise<{ status: string }>) : null))
        .catch(() => null);
      if (stop || !r) return;
      if (r.status === 'ok') {
        stop = true;
        setTgWait(null);
        await finish('telegram', { loginCode: tgWait.code });
      } else if (r.status === 'expired' || Date.now() - started > 10 * 60_000) {
        stop = true;
        setTgWait(null);
        setBusy(null);
        onError('Kirish vaqti tugadi — tugmani qayta bosing');
      }
    };
    const id = window.setInterval(check, 2000);
    const onShow = () => !document.hidden && void check();
    document.addEventListener('visibilitychange', onShow);
    window.addEventListener('focus', onShow);
    return () => {
      stop = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onShow);
      window.removeEventListener('focus', onShow);
    };
  }, [tgWait]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cfg || (!cfg.facebookAppId && !cfg.appleClientId && !cfg.telegramBot)) return null;

  const facebook = async () => {
    try {
      setBusy('facebook');
      await loadScript('https://connect.facebook.net/en_US/sdk.js');
      window.FB!.init({ appId: cfg.facebookAppId, version: 'v21.0', cookie: false, xfbml: false });
      window.FB!.login(
        (r) => {
          const token = r.authResponse?.accessToken;
          if (token) void finish('facebook', { accessToken: token });
          else setBusy(null);
        },
        { scope: 'public_profile,email' },
      );
    } catch {
      setBusy(null);
      onError("Facebook yuklanmadi — boshqa usul bilan kiring");
    }
  };

  const apple = async () => {
    try {
      setBusy('apple');
      await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
      window.AppleID!.auth.init({ clientId: cfg.appleClientId, scope: 'name email', redirectURI: `${location.origin}${location.pathname}`, usePopup: true });
      const r = await window.AppleID!.auth.signIn();
      const idToken = r.authorization?.id_token;
      if (!idToken) return setBusy(null);
      await finish('apple', { idToken, name: r.user?.name?.firstName ?? '' });
    } catch (e) {
      setBusy(null);
      if (!/popup_closed|cancel/i.test(String((e as { error?: string })?.error ?? e))) onError("Apple orqali kirib bo'lmadi — qayta urinib ko'ring");
    }
  };

  return (
    <div className="social-login">
      {cfg.facebookAppId && (
        <button type="button" className="btn btn-social fb" disabled={!!busy} onClick={facebook}>
          <span className="si">f</span> {busy === 'facebook' ? 'Kuting…' : 'Facebook bilan davom etish'}
        </button>
      )}
      {cfg.appleClientId && (
        <button type="button" className="btn btn-social apple" disabled={!!busy} onClick={apple}>
          <svg className="si" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.86-.76-1.47.02-2.83.86-3.59 2.17-1.53 2.65-.39 6.58 1.1 8.73.73 1.05 1.6 2.23 2.73 2.19 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.3-3.48zM14.2 6.1c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.65-1.05 1.68-.92 2.67.97.08 1.96-.49 2.56-1.22z"/></svg> {busy === 'apple' ? 'Kuting…' : 'Apple bilan davom etish'}
        </button>
      )}
      {cfg.telegramBot && (
        <button
          type="button"
          className="btn btn-social tg"
          disabled={!!busy}
          onClick={() => (tgWebApp ? void finish('telegram', { initData: window.Telegram!.WebApp!.initData }) : void telegram())}
        >
          <svg className="si" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M21.4 4.3 18.3 19c-.2 1-.9 1.3-1.8.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2l-11 6.9-4.7-1.5c-1-.3-1-1 .2-1.5l18.5-7.1c.9-.3 1.6.2 1.4 1.4z" /></svg>
          {tgWait ? "Telegram'da tasdiqlang…" : busy === 'telegram' ? 'Kuting…' : 'Telegram bilan davom etish'}
        </button>
      )}
      {tgWait && (
        <div className="tg-wait" role="status">
          <span className="tg-wait-dot" aria-hidden="true" />
          <p>
            Telegram'da <b>Start</b> → <b>✅ Tasdiqlash</b> ni bosing va shu yerga qayting — avtomatik kirasiz.
          </p>
          <div className="tg-wait-row">
            <a href={tgLink(tgWait)} target="_blank" rel="noreferrer">
              Telegram ochilmadimi?
            </a>
            <button type="button" className="btn-link" onClick={() => (setTgWait(null), setBusy(null))}>
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
