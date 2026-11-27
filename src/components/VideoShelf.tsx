// «Videolar» javoni: kartochkalar gorizontal suriladi; bosilganda to'liq ekranli pleyer (keyingisiga o'zi o'tadi).
import { useEffect, useState } from 'react';
import { PROMO_VIDEOS } from '../data/videos';

export function VideoShelf({ title = 'Videolar' }: { title?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const v = open === null ? null : PROMO_VIDEOS[open];
  return (
    <section className="vshelf">
      <h2>{title}</h2>
      <div className="vshelf-row">
        {PROMO_VIDEOS.map((p, i) => (
          <button key={p.id} type="button" className="vcard" onClick={() => setOpen(i)} aria-label={`${p.title} — videoni ko'rish`}>
            <img src={`./videos/${p.id}.jpg`} alt="" loading="lazy" />
            <span className="vplay" aria-hidden="true">▶</span>
            <span className="vmeta">
              <b>{p.title}</b>
              <small>{p.len}</small>
            </span>
          </button>
        ))}
      </div>
      {v && (
        <div className="vmodal" role="dialog" aria-label={v.title} onClick={() => setOpen(null)}>
          <video
            key={v.id}
            src={`./videos/${v.id}.mp4`}
            poster={`./videos/${v.id}.jpg`}
            autoPlay
            controls
            playsInline
            onClick={(e) => e.stopPropagation()}
            onEnded={() => setOpen((o) => (o !== null && o < PROMO_VIDEOS.length - 1 ? o + 1 : null))}
          />
          <button type="button" className="vclose" aria-label="Yopish" onClick={() => setOpen(null)}>
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
