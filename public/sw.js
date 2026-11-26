// Oddiy offline kesh: birinchi tarmoq, xato bo'lsa kesh (navigatsiya), statik fayllar uchun kesh-birinchi.
// Kesh nomi build versiyasiga bog'liq (sw.js?v=...): yangi versiyada eski kesh butunlay o'chadi.
const CACHE = 'voila-' + (new URL(self.location.href).searchParams.get('v') || 'v6');
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest', './icon.svg'])));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // API so'rovlari hech qachon keshlanmaydi (hisob, obuna, progress doim yangi bo'lishi shart).
  if (url.origin === location.origin && (url.pathname.includes('/api/') || url.pathname.endsWith('/version.json'))) return;
  // Uchinchi tomon (Google kirish, reklama, to'lov) — brauzerning o'ziga qoldiramiz.
  if (url.origin !== location.origin && !url.hostname.endsWith('fonts.googleapis.com') && !url.hostname.endsWith('fonts.gstatic.com')) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && (new URL(req.url).origin === location.origin || req.url.includes('fonts.g'))) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
