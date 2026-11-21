// Krua ustoz — mijoz tomoni: kontekst yig'ish, oqimli so'rov, javobni bo'laklash.
import { ALL_LESSONS } from '../data/course';
import type { GameState } from './game';

export type Scenario = 'free' | 'cafe' | 'meet' | 'grammar' | 'mistakes';

export interface ChatMessage {
  id: string;
  role: 'user' | 'tutor';
  text: string;
  error?: boolean;
  ts: number;
}

export interface ScenarioInfo {
  id: Scenario;
  title: string;
  icon: string;
  greet: (name: string) => string;
  suggestions: string[];
}

export const SCENARIOS: ScenarioInfo[] = [
  {
    id: 'free',
    title: 'Erkin suhbat',
    icon: '💬',
    greet: (n) =>
      `${n ? `${n}, ` : ''}[fr]Salut ![/fr] (salyu) Men Krua — beretli kruasan va sizning fransuz tili ustozingizman. Xohlagan narsangizni so'rang: so'z, grammatika, Parij... Faqat meni choyga botirmang, iltimos 😄 Bugun nimadan boshlaymiz?`,
    suggestions: ['Fransuzlar qanday salomlashadi?', 'Menga 3 ta foydali ibora o\'rgat', 'Fransuzcha bir hazil aytib ber'],
  },
  {
    id: 'cafe',
    title: 'Parij kafesi',
    icon: '☕',
    greet: () =>
      `[fr]Bonjour ! Bienvenue au café ![/fr] (Salom! Kafega xush kelibsiz!) Men bugun ofitsiantman. Buyurtmani fransuzcha bering — qo'rqmang, men faqat narxni baland aytaman, xatoni emas. [fr]Qu'est-ce que vous voulez ?[/fr] (Nima xohlaysiz?)`,
    suggestions: ['Bonjour ! Un café, s\'il vous plaît.', 'Le menu, s\'il vous plaît.', 'Qanday javob beraman?'],
  },
  {
    id: 'meet',
    title: 'Tanishuv',
    icon: '🤝',
    greet: () =>
      `[fr]Salut ! Je m'appelle Krua. Et toi ?[/fr] (Salom! Mening ismim Krua. Seningchi?) Tasavvur qiling, Parijdagi parkda tanishdik. Fransuzcha javob berishga harakat qiling — bilmasangiz o'zbekcha yozing, birga tuzamiz.`,
    suggestions: ["Je m'appelle Ali.", 'Je suis ouzbek.', 'Qanday tanishtiraman o\'zimni?'],
  },
  {
    id: 'grammar',
    title: 'Grammatika',
    icon: '📐',
    greet: () =>
      `Grammatika — fransuz tilining eng nozik qismi, xuddi mening qatlamlarim kabi 🥐 Savolingizni bering: artikllar, rod, fe'llar, inkor — hammasini oddiy misollar bilan tushuntiraman.`,
    suggestions: ['un va une ning farqi nima?', "être fe'lini tushuntir", 'Inkor gap qanday tuziladi?'],
  },
  {
    id: 'mistakes',
    title: 'Xatolarim',
    icon: '🩹',
    greet: () => `Darslardagi xatolaringizni ko'rib chiqamiz. Xato — bu o'rganishning eng mazali qismi. Tayyormisiz?`,
    suggestions: ['Ha, xatolarimni tushuntir', 'Eng ko\'p qaysi xatoni qilyapman?'],
  },
];

export function learnerContext(s: GameState) {
  const lessons = ALL_LESSONS.filter((l) => s.lessonsDone[l.id]);
  const words = Object.entries(s.words)
    .sort((a, b) => b[1].strength - a[1].strength)
    .map(([fr]) => fr)
    .slice(0, 80);
  const sentences = new Map(ALL_LESSONS.flatMap((l) => l.sentences).map((x) => [x.fr, x.uz]));
  const vocab = new Map(ALL_LESSONS.flatMap((l) => l.words).map((w) => [w.fr, w.uz]));
  const mistakes = Object.entries(s.mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([ref]) => {
      const [kind, ...rest] = ref.split(':');
      const key = rest.join(':');
      if (kind === 's') return `gap: "${key}" = "${sentences.get(key) ?? ''}"`;
      if (kind === 'w') return `so'z: "${key}" = "${vocab.get(key) ?? ''}"`;
      return '';
    })
    .filter(Boolean);
  return { name: s.name, lessons: lessons.map((l) => l.title), words, mistakes, streak: s.streak };
}

export class TutorError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** /api/tutor ga so'rov yuboradi va matn bo'laklarini onDelta orqali uzatadi. */
export async function askTutor(
  payload: { scenario: Scenario; message: string; history: { role: 'user' | 'tutor'; text: string }[]; context: ReturnType<typeof learnerContext>; character?: string; lang?: string },
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch('./api/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new TutorError('offline', "Internetga ulanib bo'lmadi. Aloqani tekshirib, qayta urinib ko'ring.");
  }
  const ct = res.headers.get('content-type') ?? '';
  if (!res.ok || !ct.includes('text/event-stream') || !res.body) {
    const body = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
    throw new TutorError(body?.code ?? 'upstream', body?.message ?? 'AI ustoz hozircha javob bera olmadi.');
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    buf += dec.decode(value ?? new Uint8Array(), { stream: !done });
    let i: number;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const line = buf.slice(0, i).replace(/^data:\s?/, '');
      buf = buf.slice(i + 2);
      if (!line) continue;
      const ev = JSON.parse(line) as { t?: string; done?: boolean; error?: string; message?: string };
      if (ev.t) onDelta(ev.t);
      if (ev.error) throw new TutorError(ev.error, ev.message ?? 'Javob uzilib qoldi.');
      if (ev.done) return;
    }
    if (done) return;
  }
}

export type Segment = { kind: 'text' | 'fr' | 'bold'; text: string };

/** "[fr]...[/fr]" va "**...**" belgilarini bo'laklarga ajratadi (oqim davomida chala teglarga chidamli). */
export function parseRich(input: string, streaming = false): Segment[] {
  let text = input;
  if (streaming) text = text.replace(/\[\/?f?r?\]?$/i, '').replace(/\*$/, '');
  const out: Segment[] = [];
  const re = /\[fr\]([\s\S]*?)(\[\/fr\]|$)|\*\*([^*]+)\*\*/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) });
    if (m[1] !== undefined) {
      if (m[1].trim()) out.push({ kind: 'fr', text: m[1] });
    } else out.push({ kind: 'bold', text: m[3] });
    last = re.lastIndex;
    if (m[0] === '') re.lastIndex++;
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
  return out.map((s) => (s.kind === 'text' ? { ...s, text: s.text.replace(/\[\/?fr\]/gi, '') } : s)).filter((s) => s.text);
}

export function frenchParts(text: string): string[] {
  return parseRich(text)
    .filter((s) => s.kind === 'fr')
    .map((s) => s.text.trim());
}

/** Ekranda va tarixda ko'rsatish uchun teglarsiz matn. */
export function plainText(text: string): string {
  return parseRich(text)
    .map((s) => s.text)
    .join('');
}
