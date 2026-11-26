// Gemini Live (bepul Gemini API rejimi): server faqat hamma shart bajarilganda bir martalik, qisqa muddatli
// ephemeral token beradi — API kalit brauzerga hech qachon chiqmaydi. Brauzer token bilan to'g'ridan-to'g'ri
// Gemini Live WebSocket'iga ulanadi. Tartib: yoqilganmi → manba → hisob → rozilik → kill switch → tezlik →
// kunlik daqiqalar → so'rov tahlili → token.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { VIVI_CUE_ACTIONS, VIVI_CUE_FACES } from '../src/shared/vivi-cue.ts';
import type { AiSubject } from './ai-consent.ts';

/** Mimika: faqat xavfsiz cue sxemasidagi qiymatlar (mijoz ham validateViviCue bilan qayta tekshiradi). */
export const LIVE_REACT_TOOL = Object.freeze({
  name: 'vivi',
  description: "Ekrandagi Vivi maskotining yuzi va imo-ishorasini o'zgartiradi. Har javobda gapirishdan oldin chaqir.",
  behavior: 'NON_BLOCKING',
  parameters: {
    type: 'OBJECT',
    properties: {
      face: { type: 'STRING', enum: [...VIVI_CUE_FACES] },
      gesture: { type: 'STRING', enum: ['none', ...VIVI_CUE_ACTIONS] },
    },
    required: ['face'],
  },
});

export interface LiveRouteDeps {
  enabled: () => boolean;
  originAllowed: (req: IncomingMessage) => boolean;
  subject: (req: IncomingMessage) => AiSubject | null;
  hasConsent: (subject: AiSubject) => boolean;
  killSwitchActive: () => boolean;
  rateLimited: (req: IncomingMessage) => string | null;
  premium: (req: IncomingMessage) => boolean;
  /** Bugun qolgan bepul jonli daqiqalar (premium uchun e'tiborsiz). */
  minutesLeft: (req: IncomingMessage) => number;
  /** Sessiya boshlandi — daqiqalar hisobini yuritish uchun. */
  markStarted: (req: IncomingMessage) => void;
  premiumMinutes: number;
  readBody: (req: IncomingMessage, max: number) => Promise<unknown>;
  /** Tutor so'rovini tahlil qilib, Live tizim ko'rsatmasini qaytaradi; xato bo'lsa — matn. */
  instruction: (subject: AiSubject, body: unknown) => string | { text: string };
  mintToken: (minutes: number, signal: AbortSignal) => Promise<string | null>;
  model: string;
  voice: string;
  respond: (res: ServerResponse, status: number, body: unknown) => void;
}

export function createLiveTokenRoute(d: LiveRouteDeps) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (!d.enabled()) return d.respond(res, 503, { code: 'live_disabled', message: 'Jonli rejim hozircha o‘chiq. Oddiy suhbatda davom eting.' });
    if (!d.originAllowed(req)) return d.respond(res, 403, { code: 'origin', message: 'Ruxsat etilmagan manba.' });
    const subject = d.subject(req);
    if (!subject) return d.respond(res, 401, { code: 'auth', message: 'Jonli suhbat uchun hisobga kiring.' });
    if (!d.hasConsent(subject)) {
      return d.respond(res, 403, { code: 'ai_consent_required', scope: 'live_session', message: 'Jonli suhbat uchun «Vivi AI va maxfiylik» bo‘limida rozilik bering.' });
    }
    if (d.killSwitchActive()) return d.respond(res, 503, { code: 'ai_kill_switch', message: 'AI so‘rovlari vaqtincha o‘chirilgan.' });
    const limited = d.rateLimited(req);
    if (limited) return d.respond(res, 429, { code: 'rate', message: limited });
    const premium = d.premium(req);
    const left = premium ? d.premiumMinutes : d.minutesLeft(req);
    if (left < 1) return d.respond(res, 429, { code: 'voice_limit', message: 'Bugungi bepul jonli suhbat vaqti tugadi. Ertaga yoki Super bilan davom eting 💜' });

    let body: unknown;
    try {
      body = await d.readBody(req, 64 * 1024);
    } catch {
      return d.respond(res, 400, { code: 'bad_request', message: 'So‘rov noto‘g‘ri.' });
    }
    const instr = d.instruction(subject, body);
    if (typeof instr !== 'string') return d.respond(res, 400, { code: 'bad_request', message: instr.text });

    const minutes = Math.max(1, Math.floor(left));
    let token: string | null = null;
    try {
      token = await d.mintToken(minutes, AbortSignal.timeout(15_000));
    } catch {
      token = null;
    }
    if (!token) return d.respond(res, 503, { code: 'upstream', message: 'Jonli rejimga ulanib bo‘lmadi — oddiy suhbatda davom eting.' });
    if (!premium) d.markStarted(req);
    const b = (body ?? {}) as { react?: unknown; vad?: unknown };
    d.respond(res, 200, {
      token,
      minutes,
      setup: {
        model: `models/${d.model}`,
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: d.voice } } } },
        systemInstruction: { parts: [{ text: instr }] },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        ...(b.react === true ? { tools: [{ functionDeclarations: [LIVE_REACT_TOOL] }] } : {}),
        ...(b.vad === 'manual' ? { realtimeInputConfig: { automaticActivityDetection: { disabled: true } } } : {}),
      },
    });
  };
}

/** Gemini API'dan bir martalik ephemeral token (uses: 1). Kalit faqat server sarlavhasida. */
export async function mintGeminiLiveToken(apiKey: string, minutes: number, signal: AbortSignal, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  const r = await fetchImpl('https://generativelanguage.googleapis.com/v1alpha/auth_tokens', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      uses: 1,
      expireTime: new Date(Date.now() + (minutes + 1) * 60_000).toISOString(),
      newSessionExpireTime: new Date(Date.now() + 90_000).toISOString(),
    }),
    signal,
  });
  const t = (await r.json().catch(() => ({}))) as { name?: unknown };
  return r.ok && typeof t.name === 'string' && t.name ? t.name : null;
}
