// Facebook, Apple va Telegram orqali kirish. Har bir tugma faqat server sozlangan bo'lsa ko'rinadi.
import { currentLang } from '../i18n';
import { useState } from 'react';
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

  // Telegram (sayt): rasmiy Telegram.Login.auth — popup orqali; vidjetning data-onauth'i eval talab qiladi
  // va saytning CSP'si (unsafe-eval yo'q) uni bloklaydi, shuning uchun o'z tugmamiz.
  const telegram = async () => {
    const botId = cfg?.telegramBotId;
    if (!botId) return onError('Telegram orqali kirish sozlanmagan');
    try {
      setBusy('telegram');
      await loadScript('https://telegram.org/js/telegram-widget.js?22');
      window.Telegram!.Login!.auth({ bot_id: botId, request_access: 'write', lang: currentLang() }, (user) => {
        if (user && typeof user === 'object') void finish('telegram', { data: user });
        else setBusy(null);
      });
    } catch {
      setBusy(null);
      onError("Telegram yuklanmadi — boshqa usul bilan kiring");
    }
  };

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
          disabled={!!busy || (!tgWebApp && !cfg.telegramBotId)}
          onClick={() => (tgWebApp ? void finish('telegram', { initData: window.Telegram!.WebApp!.initData }) : void telegram())}
        >
          <svg className="si" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M21.4 4.3 18.3 19c-.2 1-.9 1.3-1.8.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2l-11 6.9-4.7-1.5c-1-.3-1-1 .2-1.5l18.5-7.1c.9-.3 1.6.2 1.4 1.4z" /></svg>
          {busy === 'telegram' ? 'Kuting…' : 'Telegram bilan davom etish'}
        </button>
      )}
    </div>
  );
}
