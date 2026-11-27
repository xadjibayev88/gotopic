// "Biz haqimizda": ilova haqida, ijtimoiy tarmoqlar va do'stlarga ulashish.
import { VideoShelf } from '../components/VideoShelf';
import { useState } from 'react';
import { Mascot } from '../components/Mascot';

declare const __BUILD__: string;
declare global {
  interface Window {
    VOILA_SITE?: { telegram?: string; telegramChat?: string; instagram?: string; youtube?: string; email?: string; shareUrl?: string };
  }
}

const SHARE_TEXT = "Go Topic — koreys tilini o'zbek tilida o'rganish ilovasi. AI ustoz Hori bilan jonli gaplashib o'rganaman, sen ham qo'shil! 🐯🇰🇷";

export function About() {
  const cfg = window.VOILA_SITE ?? {};
  const url = cfg.shareUrl?.trim() || `${location.origin}${location.pathname}`;
  const [copied, setCopied] = useState(false);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Go Topic', text: SHARE_TEXT, url });
        return;
      }
    } catch {
      return; // foydalanuvchi bekor qildi
    }
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Havolani nusxalang:', url);
    }
  };

  const links = [
    cfg.telegram && { href: cfg.telegram, icon: '✈️', title: 'Telegram kanal', sub: 'Yangiliklar, foydali iboralar, chegirmalar', cls: 'tg' },
    cfg.telegramChat && { href: cfg.telegramChat, icon: '💬', title: 'Telegram guruh', sub: "Savol-javob va qo'llab-quvvatlash", cls: 'tg' },
    cfg.instagram && { href: cfg.instagram, icon: '📸', title: 'Instagram', sub: 'Reels, hazillar va darslar', cls: 'ig' },
    cfg.youtube && { href: cfg.youtube, icon: '▶️', title: 'YouTube', sub: 'Video darslar', cls: 'yt' },
  ].filter(Boolean) as { href: string; icon: string; title: string; sub: string; cls: string }[];

  return (
    <div className="page about">
      <div className="about-hero">
        <Mascot mood="cheer" size={110} />
        <h1>Go Topic</h1>
        <p className="muted">Koreys tilini o'zbek tilida — qiziqarli, tez va samarali.</p>
      </div>

      <VideoShelf title="Ilova haqida videolar" />

      <section className="about-card">
        <h2>Biz haqimizda</h2>
        <p>
          Go Topic — koreys tilini o'zbek tilida o'rgatadigan birinchi ilova. Hangul alifbosidan TOPIK 6 gacha 35 ta bo'lim, 30 000 so'zlik lug'at, TOPIK grammatika, o'qish va tinglash mashqlari, tinglash, diktant va
          tarjima mashqlari. Eng asosiysi — AI ustoz <b>Hori</b>: u siz bilan jonli ovozda gaplashadi, xatolaringizni tuzatadi, hazil qiladi va o'tgan
          suhbatlaringizni eslab qoladi.
        </p>
        <p className="muted small">Maqsadimiz — har bir o'zbek yoshiga Seulda, Lionda yoki Monrealda bemalol gaplasha olish imkonini berish.</p>
      </section>

      <button type="button" className="btn btn-primary btn-lg share-btn" onClick={share}>
        {copied ? '✓ Havola nusxalandi' : "🎁 Ilovani do'stlarga ulashish"}
      </button>
      <a className="btn btn-ghost btn-lg share-tg" href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(SHARE_TEXT)}`} target="_blank" rel="noreferrer">
        ✈️ Telegram'da ulashish
      </a>

      {links.length > 0 && (
        <section className="about-links">
          <h2>Biz ijtimoiy tarmoqlarda</h2>
          {links.map((l) => (
            <a key={l.href} className={`social ${l.cls}`} href={l.href} target="_blank" rel="noreferrer">
              <span className="social-icon">{l.icon}</span>
              <span className="social-text">
                <b>{l.title}</b>
                <small>{l.sub}</small>
              </span>
              <span className="social-go">›</span>
            </a>
          ))}
        </section>
      )}

      <section className="about-card small-card">
        {cfg.email && (
          <p>
            ✉️ Aloqa: <a href={`mailto:${cfg.email}`}>{cfg.email}</a>
          </p>
        )}
        <p className="legal-links">
          <a href="./privacy.html" target="_blank" rel="noreferrer">
            Maxfiylik siyosati
          </a>{' '}
          ·{' '}
          <a href="./terms.html" target="_blank" rel="noreferrer">
            Foydalanish shartlari
          </a>
        </p>
        <p className="muted small">Versiya {typeof __BUILD__ === 'string' ? __BUILD__ : 'dev'}</p>
      </section>
    </div>
  );
}
