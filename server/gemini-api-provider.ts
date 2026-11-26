// No-cost path: Gemini Developer API (Google AI Studio key). One adapter serves text, speech recognition
// (Gemini audio understanding) and speech synthesis (Gemini TTS). The key stays on the server only.
import {
  AiProviderError,
  type AiPrompt,
  type AiProvider,
  type SynthesisRequest,
  type SynthesisResult,
  type TranscriptionRequest,
  type TranscriptionResult,
} from './ai-provider.ts';
import { pcmToWav } from './google-cloud-provider.ts';
import type { AiKeyProblemDetail } from './ai-alerts.ts';

export const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
export const GEMINI_API_TEXT_MODELS = new Set(['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.1-flash-lite']);
const TEXT_ATTEMPT_MS = 8_000;
const TTS_ATTEMPT_MS = 25_000;
export const GEMINI_API_TTS_MODELS = new Set(['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts']);

export interface GeminiApiProviderConfig {
  readonly apiKey?: string;
  /** Primary first; a later model is tried only when Google rejected the earlier one with 429 (not processed). */
  readonly textModels: readonly string[];
  readonly ttsModels: readonly string[];
  readonly voice: string;
  readonly style?: string;
  /** Per-attempt time limits (defaults 8 s text, 25 s speech). */
  readonly textAttemptMs?: number;
  readonly ttsAttemptMs?: number;
  /** Pause before repeating an overloaded primary model (tests pass 0). */
  readonly retryDelayMs?: number;
  /** Called when Google refuses the key (limit reached or key invalid) so the operator can be alerted. */
  readonly onKeyProblem?: (problem: AiKeyProblemDetail) => void;
}

const STT_INSTRUCTION = `Sen nutqni matnga aylantiruvchisan. Gapiruvchi — fransuz tilini o'rganayotgan o'zbek o'quvchi; u AI ustoz «Vivi» bilan gaplashyapti.
- Audiodagi BARCHA aytilgan so'zlarni boshidan oxirigacha AYNAN yoz: hech bir qismini (o'zbekcha ham, fransuzcha ham) tashlab ketma, tarjima qilma, javob berma, o'zingdan so'z qo'shma.
- Nutq o'zbekcha, fransuzcha yoki aralash bo'lishi mumkin: o'zbekcha — lotin yozuvida (o', g', sh, ch), fransuzcha — fransuz imlosida (urg'u belgilari bilan).
- O'quvchining grammatik xatolarini TUZATMA.
- Ustozning oxirgi gapi faqat ism va so'zlarni to'g'ri yozish uchun beriladi; uni audioda aytilmagan bo'lsa matnga qo'shma, lekin audioda aytilgan gapni u bilan o'xshash deb tashlab ham ketma.
- Nutq eshitilmasa yoki tushunarsiz bo'lsa — text bo'sh.
- language: "uz", "fr" yoki "mixed".`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function candidateParts(value: unknown): Record<string, unknown>[] {
  if (!isRecord(value) || !Array.isArray(value.candidates)) throw new AiProviderError('invalid_response');
  const candidate = value.candidates[0];
  if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
    throw new AiProviderError('invalid_response');
  }
  return candidate.content.parts.filter(isRecord);
}

function candidateText(value: unknown): string {
  const text = candidateParts(value).map((part) => part.text).filter((t): t is string => typeof t === 'string').join('');
  if (!text) throw new AiProviderError('invalid_response');
  return text;
}

function parseJsonText(text: string): unknown {
  try {
    return JSON.parse(text.replace(/^﻿/, '').trim());
  } catch {
    throw new AiProviderError('invalid_response');
  }
}

function promptBody(prompt: AiPrompt): Record<string, unknown> {
  if (!prompt || !Array.isArray(prompt.contents) || prompt.contents.length === 0) throw new AiProviderError('provider_unavailable');
  const generationConfig: Record<string, unknown> = { ...(prompt.generationConfig ?? {}), responseMimeType: 'application/json' };
  // Gemini 3 "thinking" models otherwise spend the whole output budget on thoughts and cut the reply
  // (seen live: gemini-3.6-flash → finishReason MAX_TOKENS after 27 characters). Minimal thinking keeps
  // replies complete and fast; flash-lite accepts the same setting.
  if (!generationConfig.thinkingConfig) generationConfig.thinkingConfig = { thinkingLevel: 'minimal' };
  return {
    ...(prompt.systemInstruction ? { systemInstruction: { parts: [{ text: prompt.systemInstruction }] } } : {}),
    contents: prompt.contents.map((c) => ({ role: c.role, parts: c.parts.map((part: { readonly text: string }) => ({ text: part.text })) })),
    generationConfig,
    ...(prompt.safetySettings ? { safetySettings: prompt.safetySettings } : {}),
  };
}

const AUDIO_MIME = /^audio\/(webm|ogg|mp4|mpeg|wav|x-wav|aac|flac|mp3)$/;

export function createGeminiApiProvider(config: GeminiApiProviderConfig, fetchImpl: typeof fetch): AiProvider {
  /**
   * Attempt plan for the free tier: primary model; if it was only overloaded (503) or too slow, the primary
   * once more after a short pause; then each fallback. Every attempt has its own time limit so one hung call
   * cannot eat the whole route deadline. 429 (limit) moves straight on — repeating the same model won't help.
   */
  const post = async (
    models: readonly string[],
    allowed: Set<string>,
    body: Record<string, unknown>,
    signal: AbortSignal | undefined,
    attemptMs: number,
  ): Promise<unknown> => {
    const key = config.apiKey?.trim();
    if (!key || /[\r\n\s]/.test(key)) throw new AiProviderError('auth_unavailable');
    const usable = [...new Set(models.filter((m) => allowed.has(m)))];
    if (!usable.length) throw new AiProviderError('provider_unavailable');
    let lastStatus = 0;
    const quotaRefused = new Set<string>();
    let daily = false;
    const report = (problem: AiKeyProblemDetail) => {
      try { config.onKeyProblem?.(problem); } catch { /* alerts never break a request */ }
    };
    const plan: { model: string; retryOf?: string }[] = [{ model: usable[0] }, { model: usable[0], retryOf: usable[0] }, ...usable.slice(1).map((model) => ({ model }))];
    let lastTransient = false;
    for (const step of plan) {
      if (signal?.aborted) throw new AiProviderError('request_aborted');
      if (step.retryOf) {
        if (!lastTransient) continue; // only repeat after an overload/timeout, never after a limit refusal
        await new Promise((resolve) => setTimeout(resolve, config.retryDelayMs ?? 400));
        if (signal?.aborted) throw new AiProviderError('request_aborted');
      }
      const model = step.model;
      // The last fallback is the final chance (and a slower model), so it gets 1.5× the time.
      const isLast = step === plan[plan.length - 1] && !step.retryOf;
      const attempt = AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(isLast ? Math.round(attemptMs * 1.5) : attemptMs)]);
      let res: Response;
      try {
        res = await fetchImpl(`${GEMINI_API_BASE}/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify(body),
          signal: attempt,
        });
      } catch {
        if (signal?.aborted) throw new AiProviderError('request_aborted');
        lastTransient = true; // per-attempt timeout or network blip → try the next step
        lastStatus = 504;
        continue;
      }
      if (res.status === 429 || res.status === 503 || res.status === 500) {
        // Refused or overloaded before processing: the next step may take it (free tier, no billing).
        lastStatus = res.status;
        lastTransient = res.status !== 429;
        const detail = await res.text().catch(() => '');
        if (res.status === 429) {
          quotaRefused.add(model);
          if (/PerDay|per[ _-]?day|daily/i.test(detail)) daily = true;
        }
        continue;
      }
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        if ((res.status === 400 || res.status === 401 || res.status === 403) && /API_KEY_INVALID|API key (not valid|expired)|PERMISSION_DENIED|API_KEY_SERVICE_BLOCKED/i.test(detail)) {
          report({ kind: 'invalid_key', model });
          throw new AiProviderError('auth_unavailable', res.status);
        }
        throw new AiProviderError('upstream_error', res.status);
      }
      try {
        return await res.json();
      } catch {
        if (signal?.aborted) throw new AiProviderError('request_aborted');
        lastTransient = true;
        lastStatus = 504;
        continue;
      }
    }
    // Every model refused on quota → the key's free limit is used up.
    if (usable.every((m) => quotaRefused.has(m))) report({ kind: 'quota', model: usable[0], daily });
    throw new AiProviderError('upstream_error', lastStatus || undefined);
  };

  const generateJson = async (prompt: AiPrompt, signal?: AbortSignal) =>
    parseJsonText(candidateText(await post(config.textModels, GEMINI_API_TEXT_MODELS, promptBody(prompt), signal, config.textAttemptMs ?? TEXT_ATTEMPT_MS)));

  return Object.freeze({
    name: 'google-gemini-api' as const,
    serviceNames: ['google-gemini-api'] as const,

    async *streamTutor(prompt: AiPrompt, signal?: AbortSignal): AsyncIterable<string> {
      yield candidateText(await post(config.textModels, GEMINI_API_TEXT_MODELS, promptBody(prompt), signal, config.textAttemptMs ?? TEXT_ATTEMPT_MS));
    },

    generateJson,

    async transcribe(request: TranscriptionRequest, signal?: AbortSignal): Promise<TranscriptionResult> {
      const mime = (request.mimeType ?? 'audio/webm').split(';')[0];
      if (!(request.audio instanceof Uint8Array) || request.audio.byteLength === 0 || !AUDIO_MIME.test(mime)) {
        throw new AiProviderError('provider_unavailable');
      }
      const expected = request.autoLanguage ? 'aralash yoki noma\'lum' : request.languageCode === 'fr-FR' ? 'fransuzcha' : 'o\'zbekcha';
      const body = {
        systemInstruction: { parts: [{ text: STT_INSTRUCTION }] },
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: mime, data: Buffer.from(request.audio).toString('base64') } },
            { text: `Kutilgan til (taxmin): ${expected}.${request.context ? ` Ustozning oxirgi gapi: «${request.context}»` : ''}` },
          ],
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 400,
          thinkingConfig: { thinkingLevel: 'minimal' },
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: { text: { type: 'STRING' }, language: { type: 'STRING', enum: ['uz', 'fr', 'mixed'] } },
            required: ['text'],
          },
        },
      };
      const parsed = parseJsonText(candidateText(await post(config.textModels, GEMINI_API_TEXT_MODELS, body, signal, config.textAttemptMs ?? TEXT_ATTEMPT_MS))) as { text?: unknown; language?: unknown };
      const text = typeof parsed?.text === 'string' ? parsed.text.trim().slice(0, 4000) : '';
      if (!text) return { segments: [] };
      if (parsed.language === 'mixed') {
        // Two segment language tags make the review step ask the learner to confirm a code-switched transcript.
        return { segments: [{ languageCode: 'uz-UZ', alternatives: [{ transcript: text }] }, { languageCode: 'fr-FR', alternatives: [] }] };
      }
      const languageCode = parsed.language === 'fr' ? 'fr-FR' : parsed.language === 'uz' ? 'uz-UZ' : undefined;
      return { segments: [{ ...(languageCode ? { languageCode } : {}), alternatives: [{ transcript: text }] }] };
    },

    async synthesize(request: SynthesisRequest, signal?: AbortSignal): Promise<SynthesisResult> {
      if (typeof request?.text !== 'string' || !request.text.trim()) throw new AiProviderError('provider_unavailable');
      const spoken = config.style ? `${config.style}\n\n${request.text}` : request.text;
      const response = await post(config.ttsModels, GEMINI_API_TTS_MODELS, {
        contents: [{ role: 'user', parts: [{ text: spoken }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voice } } },
        },
      }, signal, config.ttsAttemptMs ?? TTS_ATTEMPT_MS);
      const inline = candidateParts(response).map((part) => part.inlineData).find(isRecord);
      const mimeType = typeof inline?.mimeType === 'string' ? inline.mimeType : '';
      const data = typeof inline?.data === 'string' ? inline.data : '';
      if (!data || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) throw new AiProviderError('invalid_response');
      const bytes = Buffer.from(data, 'base64');
      if (bytes.subarray(0, 4).toString('ascii') === 'RIFF') return { audio: bytes, mimeType: 'audio/wav' };
      const rate = Number(/rate=(\d{4,6})/i.exec(mimeType)?.[1] ?? 24_000);
      if (!/^audio\/(l16|pcm)/i.test(mimeType) || rate < 8_000 || rate > 48_000 || bytes.length === 0 || bytes.length % 2 !== 0) {
        throw new AiProviderError('invalid_response');
      }
      return { audio: pcmToWav(bytes, rate), mimeType: 'audio/wav' };
    },
  });
}
