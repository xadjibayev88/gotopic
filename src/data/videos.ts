// Ilova haqidagi qisqa motion videolar (public/videos/*.mp4 — 720p, poster *.jpg).
export interface PromoVideo { id: string; title: string; len: string }
export const PROMO_VIDEOS: PromoVideo[] = [
  { id: 'showreel', title: "15 soniyada Go Topic", len: '15 s' },
  { id: 'promo', title: "Tanishuv", len: '30 s' },
  { id: '1-dars', title: "5 daqiqalik dars", len: '15 s' },
  { id: '2-ai', title: "Hori AI ustoz", len: '18 s' },
  { id: '3-oyin', title: "O'yin kabi", len: '15 s' },
  { id: '4-imkoniyat', title: "Imkoniyatlar", len: '15 s' },
];
