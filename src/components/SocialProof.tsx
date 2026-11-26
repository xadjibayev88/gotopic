// Ijtimoiy isbot — faqat HAQIQIY ma'lumot: tasdiqlangan izohlar, haqiqiy xaridlar, haqiqiy statistika.
import { useEffect, useState } from 'react';
import { accountApi, useAccount } from '../state/account';

export interface SocialData {
  reviews: { id: number; name: string; rating: number; text: string; verified: boolean; createdAt: number }[];
  avg: number | null;
  count: number;
  recent: { name: string; plan: string; at: number }[];
  users: number;
  supers: number;
  support: string | null;
}

let cache: { at: number; data: SocialData } | null = null;
export function useSocial(): SocialData | null {
  const [d, setD] = useState<SocialData | null>(cache?.data ?? null);
  useEffect(() => {
    if (cache && Date.now() - cache.at < 60_000) return;
    let alive = true;
    void fetch('./api/social')
      .then((r) => (r.ok ? r.json() : null))
      .then((j: SocialData | null) => {
        if (!j || !alive) return;
        cache = { at: Date.now(), data: j };
        setD(j);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  return d;
}

const ago = (t: number) => {
  const m = Math.max(1, Math.round((Date.now() - t) / 60_000));
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} soat oldin` : `${Math.round(h / 24)} kun oldin`;
};
const initials = (n: string) => n.split(/\s+/).map((x) => x[0]).join('').slice(0, 2).toUpperCase();
const Stars = ({ n }: { n: number }) => (
  <span className="rv-stars" aria-label={`${n} / 5`}>
    {'★★★★★'.slice(0, Math.round(n))}
    <i>{'★★★★★'.slice(Math.round(n))}</i>
  </span>
);

/** O'quvchilar izohlari (faqat admin tasdiqlaganlari) + o'rtacha baho. */
export function Reviews({ data }: { data: SocialData | null }) {
  if (!data) return null;
  return (
    <section className="rv-section">
      <div className="rv-head">
        <h3>
          💬 O'quvchilar izohlari
          {data.avg !== null && (
            <>
              {' '}
              ({data.avg.toFixed(1)}/5 ⭐)
            </>
          )}
        </h3>
        {data.count > 0 && <span className="rv-badge">Haqiqiy foydalanuvchilar</span>}
      </div>
      {data.reviews.length === 0 ? (
        <p className="muted rv-empty">Hozircha izohlar yo'q — birinchi bo'lib fikringizni qoldiring 👇</p>
      ) : (
        <div className="rv-list">
          {data.reviews.map((r) => (
            <article key={r.id} className={`rv-card ${r.verified ? 'verified' : ''}`}>
              <div className="rv-top">
                <span className="rv-ava">{r.verified ? '💎' : initials(r.name)}</span>
                <div className="rv-who">
                  <b>{r.name}</b>
                  {r.verified && <small>✓ Super obunachi</small>}
                </div>
                <Stars n={r.rating} />
              </div>
              <p>«{r.text}»</p>
            </article>
          ))}
        </div>
      )}
      <ReviewForm />
    </section>
  );
}

/** Izoh qoldirish (hisobga kirganlar uchun; admin tasdiqlagach ko'rinadi). */
export function ReviewForm() {
  const { me } = useAccount();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'sent' | 'mine'>('idle');
  const [mine, setMine] = useState<{ rating: number; text: string; status: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!me.user) return;
    void accountApi<{ review: { rating: number; text: string; status: string } | null }>('reviews/mine').then((r) => {
      if (r.ok && r.body.review) {
        setMine(r.body.review);
        setState('mine');
      }
    });
  }, [me.user]);

  if (!me.user) return <p className="muted rv-login">Izoh qoldirish uchun profilingizga kiring.</p>;
  if (state === 'sent' || (state === 'mine' && mine))
    return (
      <div className="rv-thanks">
        <b>{state === 'sent' || mine?.status === 'pending' ? '🙏 Rahmat! Izohingiz tekshirilmoqda.' : mine?.status === 'approved' ? '✅ Izohingiz saytda ko\'rinmoqda. Rahmat!' : 'Izohingiz chiqarilmadi.'}</b>
        <button type="button" className="btn btn-text" onClick={() => { setText(mine?.text ?? text); setRating(mine?.rating ?? rating); setState('idle'); }}>
          Tahrirlash
        </button>
      </div>
    );

  const submit = async () => {
    setErr(null);
    setState('busy');
    const r = await accountApi<{ message?: string }>('reviews', { method: 'POST', body: JSON.stringify({ rating, text }) });
    if (!r.ok) {
      setState('idle');
      return setErr(r.body.message ?? "Yuborib bo'lmadi");
    }
    setMine({ rating, text, status: 'pending' });
    setState('sent');
  };
  return (
    <div className="rv-form">
      <b>Fikringizni qoldiring</b>
      <div className="rv-pick" role="radiogroup" aria-label="Baho">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}>
            ★
          </button>
        ))}
      </div>
      <textarea className="text-input" rows={3} maxLength={400} placeholder="Voilà va Vivi haqida fikringiz…" value={text} onChange={(e) => setText(e.target.value)} />
      {err && <p className="auth-error">{err}</p>}
      <button type="button" className="btn btn-primary btn-beam" disabled={state === 'busy' || text.trim().length < 10} onClick={() => void submit()}>
        {state === 'busy' ? 'Yuborilmoqda…' : 'Yuborish'}
      </button>
    </div>
  );
}

/** «Yangi xarid!» — faqat haqiqatan to'langan obunalar (oxirgi 7 kun). Ma'lumot bo'lmasa — ko'rinmaydi. */
export function PurchaseToast({ data }: { data: SocialData | null }) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);
  const list = data?.recent ?? [];
  useEffect(() => {
    if (!list.length || closed) return;
    const first = setTimeout(() => setShow(true), 2500);
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setI((n) => (n + 1) % list.length);
        setShow(true);
      }, 600);
    }, 9000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [list.length, closed]);
  if (!list.length || closed) return null;
  const p = list[i % list.length];
  return (
    <div className={`buy-toast ${show ? 'show' : ''}`} role="status">
      <span className="buy-ico">💎</span>
      <div className="buy-body">
        <div className="buy-top">
          <b>🔥 YANGI XARID!</b>
          <small>{ago(p.at)}</small>
        </div>
        <span className="buy-name">{p.name}</span>
        <small className="buy-plan">Voilà Super — {p.plan}</small>
      </div>
      <button type="button" className="buy-x" aria-label="Yopish" onClick={() => setClosed(true)}>
        ✕
      </button>
    </div>
  );
}

/** To'lovda muammo bo'lsa — qo'llab-quvvatlash (Telegram). */
export function SupportRow({ data }: { data: SocialData | null }) {
  if (!data?.support) return null;
  return (
    <p className="support-row">
      <span>❓ To'lovda muammo bo'lsa:</span>
      <a href={`https://t.me/${data.support}`} target="_blank" rel="noreferrer">
        @{data.support}
      </a>
    </p>
  );
}

/** Haqiqiy statistika (kamida 20 foydalanuvchi bo'lganda ko'rinadi). */
export function StatsLine({ data }: { data: SocialData | null }) {
  if (!data || data.users < 20) return null;
  const round = (n: number) => (n >= 100 ? `${Math.floor(n / 10) * 10}+` : String(n));
  return (
    <p className="stats-line">
      👥 <b>{round(data.users)}</b> o'quvchi Voilà bilan fransuz tilini o'rganmoqda{data.supers >= 5 ? <> · 💎 <b>{round(data.supers)}</b> Super obunachi</> : null}
    </p>
  );
}
