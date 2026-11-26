// Rasm effekti: Vivi gapida tilga olingan odam / joy / narsaning rasmi (Vikipediyadan) qalqib chiqadi.
import { useEffect, useState } from 'react';

type Found = { url: string; title: string } | null;
const cache = new Map<string, Promise<Found>>();

async function search(lang: string, q: string): Promise<Found> {
  const u = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  Object.entries({
    action: 'query',
    format: 'json',
    origin: '*',
    generator: 'search',
    gsrsearch: q,
    gsrlimit: '3',
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: '480',
  }).forEach(([k, v]) => u.searchParams.set(k, v));
  const r = await fetch(u, { signal: AbortSignal.timeout(4000) });
  if (!r.ok) return null;
  const j = (await r.json()) as { query?: { pages?: Record<string, { index: number; title: string; thumbnail?: { source: string } }> } };
  const pages = Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  const hit = pages.find((p) => p.thumbnail?.source);
  return hit ? { url: hit.thumbnail!.source, title: hit.title } : null;
}

/** Bir nechta tildagi Vikipediyadan birinchi topilgan rasm (natija keshlanadi). */
export function findImage(q: string): Promise<Found> {
  const key = q.toLowerCase();
  let p = cache.get(key);
  if (!p) {
    p = (async () => {
      for (const lang of ['uz', 'ru', 'en']) {
        try {
          const f = await search(lang, q);
          if (f) return f;
        } catch {
          /* keyingi til */
        }
      }
      return null;
    })();
    cache.set(key, p);
  }
  return p;
}

/** Ovozli suhbatda: avatar tepasida bir necha soniya qalqib turadigan rasm. */
export function ImagePop({ query, ms = 5200 }: { query: string; ms?: number }) {
  const [found, setFound] = useState<Found>(null);
  const [hide, setHide] = useState(false);
  useEffect(() => {
    let alive = true;
    setFound(null);
    setHide(false);
    findImage(query).then((f) => alive && setFound(f));
    const t = setTimeout(() => alive && setHide(true), ms);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, ms]);
  if (!found || hide) return null;
  return (
    <figure className="img-pop" aria-label={found.title}>
      <img src={found.url} alt={found.title} referrerPolicy="no-referrer" />
      <figcaption>{found.title}</figcaption>
    </figure>
  );
}

/** Matnli chatda: xabar ichidagi kichik rasm kartasi. */
export function InlineImage({ query }: { query: string }) {
  const [found, setFound] = useState<Found>(null);
  useEffect(() => {
    let alive = true;
    findImage(query).then((f) => alive && setFound(f));
    return () => {
      alive = false;
    };
  }, [query]);
  if (!found) return null;
  return (
    <figure className="img-inline">
      <img src={found.url} alt={found.title} loading="lazy" referrerPolicy="no-referrer" />
      <figcaption>{found.title}</figcaption>
    </figure>
  );
}
