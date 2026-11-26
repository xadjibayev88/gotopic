import { normalizeMarkers } from './voice/markers';
// Vivi ustoz — mijoz tomoni: kontekst yig'ish, oqimli so'rov, javobni bo'laklash.
import { ALL_LESSONS } from '../data/course';
import type { GameState } from './game';
import { validateViviCue, type ViviCue } from '../shared/vivi-cue';

export type Scenario = 'free' | 'cafe' | 'meet' | 'grammar' | 'mistakes';

export interface ChatMessage {
  id: string;
  role: 'user' | 'tutor';
  text: string;
  error?: boolean;
  /** Bepul limit tugadi — Super taklifi ko'rsatiladi. */
  upsell?: boolean;
  /** Optional structured metadata, kept separate from learner-facing text. */
  cue?: ViviCue;
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
      `${n ? `${n}, ` : ''}[fr]Salut ![/fr] (salyu) Men Vivi — parijlik mushukcha va sizning fransuz tili ustozingizman. Xohlagan narsangizni so'rang: so'z, grammatika, Parij... Faqat qornimni silamang, darsni unutib qo'yaman 😸 Bugun nimadan boshlaymiz?`,
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
      `[fr]Salut ! Je m'appelle Vivi. Et toi ?[/fr] (Salom! Mening ismim Vivi. Seningchi?) Tasavvur qiling, Parijdagi parkda tanishdik. Fransuzcha javob berishga harakat qiling — bilmasangiz o'zbekcha yozing, birga tuzamiz.`,
    suggestions: ["Je m'appelle Ali.", 'Je suis ouzbek.', 'Qanday tanishtiraman o\'zimni?'],
  },
  {
    id: 'grammar',
    title: 'Grammatika',
    icon: '📐',
    greet: () =>
      `Grammatika — fransuz tilining eng nozik qismi, xuddi kalava ipidek chigal, lekin birga yechamiz 🧶 Savolingizni bering: artikllar, rod, fe'llar, inkor — hammasini oddiy misollar bilan tushuntiraman.`,
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
  return { name: s.name, lessons: lessons.map((l) => l.title), words, mistakes, streak: s.streak, memory: s.memory ?? '' };
}

/** Suhbatdan keyin faqat foydalanuvchi ko'rib, aniq tasdiqlagan turnlar bilan Vivi xotirasini yangilaydi. */
export async function updateMemory(
  memory: string,
  turns: { role: 'user' | 'tutor'; text: string }[],
  name: string,
  confirmed: boolean,
): Promise<string | null> {
  if (confirmed !== true || !turns.some((t) => t.role === 'user')) return null;
  try {
    const res = await fetch('./api/tutor/memory', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ memory, turns: turns.slice(-40), name }),
    });
    if (!res.ok) return null;
    const b = (await res.json()) as { memory?: string };
    return typeof b.memory === 'string' && b.memory.trim() ? b.memory : null;
  } catch {
    return null;
  }
}

export class TutorError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

/** Return only a user-visible error entry; partial stream text is never a completed chat turn. */
export function tutorFailureMessage(e: unknown): Pick<ChatMessage, 'role' | 'text' | 'error' | 'upsell'> | null {
  if (e instanceof Error && e.name === 'AbortError') return null;
  const tutorError = e instanceof TutorError;
  return {
    role: 'tutor',
    text: tutorError ? e.message : 'Kutilmagan xato yuz berdi.',
    error: true,
    upsell: tutorError && e.code === 'daily_limit',
  };
}

export const TUTOR_RETRY_DELAY_MS = 1200;

/** /api/tutor ga so'rov yuboradi va matn bo'laklarini onDelta orqali uzatadi. */
export async function askTutor(
  payload: { scenario: Scenario; message: string; history: { role: 'user' | 'tutor'; text: string }[]; context: ReturnType<typeof learnerContext>; character?: string; lang?: string; explicit?: boolean },
  onDelta: (text: string) => void,
  signal?: AbortSignal,
  onCue?: (cue: ViviCue) => void,
): Promise<void> {
  let res!: Response;
  // Google's free tier is sometimes briefly overloaded. The server already retries; if it still could not
  // get a reply (503/504 before any text was sent), the client waits a moment and asks once more.
  for (let attempt = 0; ; attempt++) {
    try {
      res = await fetch('./api/tutor', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal });
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw e;
      throw new TutorError('offline', "Internetga ulanib bo'lmadi. Aloqani tekshirib, qayta urinib ko'ring.");
    }
    const ct = res.headers.get('content-type') ?? '';
    if (res.ok && ct.includes('text/event-stream') && res.body) break;
    const body = (await res.json().catch(() => null)) as { code?: string; message?: string } | null;
    const transient = (res.status === 503 && body?.code === 'ai_upstream_error') || (res.status === 504 && body?.code === 'ai_timeout');
    if (transient && attempt === 0 && !signal?.aborted) {
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, TUTOR_RETRY_DELAY_MS);
        signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
      });
      continue;
    }
    throw new TutorError(body?.code ?? 'upstream', body?.message ?? 'AI ustoz hozircha javob bera olmadi.');
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let responseComplete = false;
  let responseText = '';
  for (;;) {
    const { value, done } = await reader.read();
    buf += dec.decode(value ?? new Uint8Array(), { stream: !done });
    let i: number;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const line = buf.slice(0, i).replace(/^data:\s?/, '');
      buf = buf.slice(i + 2);
      if (!line) continue;
      const ev = JSON.parse(line) as { t?: string; cue?: unknown; done?: boolean; error?: string; message?: string };
      if (ev.t) {
        responseText += ev.t;
        onDelta(ev.t);
      }
      if (ev.error) throw new TutorError(ev.error, ev.message ?? 'Javob uzilib qoldi.');
      if (Object.prototype.hasOwnProperty.call(ev, 'cue')) onCue?.(validateViviCue(ev.cue));
      if (ev.done) {
        if (!responseText.trim()) throw new TutorError('empty_response', 'Tutor javobi bo‘sh. Qayta urinib ko‘ring.');
        responseComplete = true;
        return;
      }
    }
    if (done) break;
  }
  if (!responseComplete) throw new TutorError('incomplete_response', 'Tutor javobi to‘liq kelmadi. Qayta urinib ko‘ring.');
}

export type Segment = { kind: 'text' | 'fr' | 'bold'; text: string };

/** "[fr]...[/fr]" va "**...**" belgilarini bo'laklarga ajratadi (oqim davomida chala teglarga chidamli). */
export function parseRich(input: string, streaming = false): Segment[] {
  // Maxfiy belgilar ([[ans:fr]], [[shape:x]] ...) ko'rinmaydi; oqimdagi chala belgi ham.
  let text = normalizeMarkers(input).replace(/\[\[[^\]]*\]\]/g, '').replace(/\[\[[^\]]*$/, '').replace(/[ \t]+$/gm, '');
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
