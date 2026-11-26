import type { AiContent, AiPrompt } from './ai-provider.ts';
import type { AiRouteExecutionContext, AiRouteKey, AiRouteOperation, AiRoutePrepared, AiRouteResult } from './ai-routes.ts';
import { type TutorRequest, buildContents, parseTutorReply, parseTutorRequest, SAFETY, systemInstruction, tutorSseEvents, TUTOR_RESPONSE_SCHEMA, TutorReplyError } from './tutor.ts';
import {
  cleanFeedback,
  cleanMemory,
  feedbackBody,
  memoryBody,
  parseFeedbackRequest,
  parseMemoryRequest,
  parseSttRequest,
  parseTranslateRequest,
  ttsText,
  translateBody,
  type FeedbackRequest,
  type MemoryRequest,
  type SttRequest,
  type TranslateRequest,
} from './voice.ts';
import type { AiUsage } from './ai-quota.ts';
import { reviewSttResult } from '../src/engine/voice/stt-result.ts';

const TEXT_MODEL_FOR_PROMPT_SHAPING = '';
const ZERO_USAGE = Object.freeze({ requests: 1, tokens: 0, sttAudioSeconds: 0, ttsCharacters: 0, ttsAudioSeconds: 0 });

function withUsage(tokens: number, extras: Partial<AiUsage> = {}): AiUsage {
  return Object.freeze({ ...ZERO_USAGE, tokens: Math.max(0, Math.ceil(tokens)), ...extras });
}

export function ttsSecondsUpperBound(text: string): number {
  return Math.ceil(text.length / 5) + 5;
}

function textLength(value: string): number {
  return Math.ceil(value.length / 4);
}

function promptFromLegacyBody(body: Record<string, unknown>): AiPrompt {
  const rawInstruction = body.systemInstruction as { parts?: Array<{ text?: unknown }> } | undefined;
  const systemInstruction = rawInstruction?.parts?.find((part) => typeof part.text === 'string')?.text;
  const rawContents = Array.isArray(body.contents) ? body.contents : [];
  const contents: AiContent[] = rawContents.map((raw) => {
    const item = raw as { role?: unknown; parts?: Array<{ text?: unknown }> };
    if (item.role !== 'user' && item.role !== 'model') throw new Error('Invalid minimized prompt role');
    const parts = (item.parts ?? []).filter((part) => typeof part?.text === 'string').map((part) => ({ text: part.text as string }));
    if (!parts.length) throw new Error('Invalid minimized prompt content');
    return { role: item.role, parts };
  });
  if (!contents.length) throw new Error('Empty minimized prompt');
  return Object.freeze({
    ...(typeof systemInstruction === 'string' ? { systemInstruction } : {}),
    contents: Object.freeze(contents),
    ...(body.generationConfig && typeof body.generationConfig === 'object'
      ? { generationConfig: Object.freeze({ ...(body.generationConfig as Record<string, unknown>) }) }
      : {}),
    ...(Array.isArray(body.safetySettings) ? { safetySettings: Object.freeze(body.safetySettings as Readonly<Record<string, unknown>>[]) } : {}),
  });
}

function tutorPrompt(request: TutorRequest): AiPrompt {
  const generationConfig = {
    temperature: 0.75,
    topP: 0.95,
    maxOutputTokens: request.mode === 'voice' ? 320 : 700,
    responseMimeType: 'application/json',
    responseSchema: TUTOR_RESPONSE_SCHEMA,
  };
  return Object.freeze({
    systemInstruction: systemInstruction(request),
    contents: Object.freeze(buildContents(request).map((item) => Object.freeze({
      role: item.role,
      parts: Object.freeze(item.parts.map((part) => Object.freeze({ text: part.text }))),
    }))),
    generationConfig: Object.freeze(generationConfig),
    safetySettings: SAFETY,
  });
}

function operation<T>(options: {
  readonly maxBodyBytes: number;
  readonly parse: (body: unknown) => T | string;
  readonly minimize: (input: T) => unknown;
  readonly estimateUsage: (input: T) => AiUsage;
  readonly sanitizeResult?: (result: unknown, input: T) => unknown;
  readonly formatResult?: (result: unknown, input: T) => AiRouteResult;
}): AiRouteOperation {
  return Object.freeze({
    maxBodyBytes: options.maxBodyBytes,
    prepare(body: unknown): AiRoutePrepared | string {
      const input = options.parse(body);
      if (typeof input === 'string') return input;
      return Object.freeze({ input, usage: options.estimateUsage(input) });
    },
    minimize(input: unknown): unknown {
      return options.minimize(input as T);
    },
    async run(_input: unknown, context: AiRouteExecutionContext) {
      const providerResult = await context.providerCall();
      if (options.formatResult) return options.formatResult(providerResult, _input as T);
      return { status: 200, body: options.sanitizeResult ? options.sanitizeResult(providerResult, _input as T) : providerResult };
    },
  });
}

const disabledLiveOperation: AiRouteOperation = Object.freeze({
  maxBodyBytes: 0,
  prepare: () => 'Live is disabled',
  minimize: () => null,
  run: async () => ({ status: 503, body: { code: 'live_disabled' } }),
});

/**
 * Route-specific data boundaries for all six non-Live AI endpoints. These operations are supplied
 * to the route factory for accurate tests, but production readiness remains hard-disabled.
 */
export function createAiRouteOperations(options: { readonly geminiAudioHints?: boolean } = {}): Readonly<Record<AiRouteKey, AiRouteOperation>> {
  const tutor = operation<TutorRequest>({
    maxBodyBytes: 64 * 1024,
    parse: parseTutorRequest,
    minimize: tutorPrompt,
    estimateUsage: (input) => withUsage(
      textLength(input.message) + input.history.reduce((sum, turn) => sum + textLength(turn.text), 0)
        + input.context.words.reduce((sum, word) => sum + textLength(word), 0)
        + input.context.mistakes.reduce((sum, mistake) => sum + textLength(mistake), 0)
        + textLength(input.context.memory) + 900,
    ),
    formatResult: (result) => {
      try {
        const reply = parseTutorReply(result);
        return { status: 200, body: reply, sseEvents: tutorSseEvents(reply) };
      } catch (error) {
        if (error instanceof TutorReplyError) return { status: 502, body: { code: error.code, message: error.message } };
        throw error;
      }
    },
  });
  const feedback = operation<FeedbackRequest>({
    maxBodyBytes: 128 * 1024,
    parse: parseFeedbackRequest,
    minimize: (input) => promptFromLegacyBody(feedbackBody(input, TEXT_MODEL_FOR_PROMPT_SHAPING)),
    estimateUsage: (input) => withUsage(2 * (input.turns.reduce((sum, turn) => sum + turn.text.length, 0) + 500)),
    sanitizeResult: cleanFeedback,
  });
  const translation = operation<TranslateRequest>({
    maxBodyBytes: 8 * 1024,
    parse: parseTranslateRequest,
    minimize: (input) => promptFromLegacyBody(translateBody(input, TEXT_MODEL_FOR_PROMPT_SHAPING)),
    estimateUsage: (input) => withUsage(2 * (input.text.length + input.context.length + 300)),
    sanitizeResult: (result) => {
      const value = (result ?? {}) as { uz?: unknown; say?: unknown };
      const uz = typeof value.uz === 'string' ? value.uz.trim().slice(0, 200) : '';
      const say = typeof value.say === 'string' ? value.say.trim().slice(0, 120) : '';
      return uz ? { uz, ...(say ? { say } : {}) } : { uz: '' };
    },
  });
  const memory = operation<MemoryRequest>({
    maxBodyBytes: 64 * 1024,
    parse: parseMemoryRequest,
    minimize: (input) => promptFromLegacyBody(memoryBody(input, TEXT_MODEL_FOR_PROMPT_SHAPING)),
    estimateUsage: (input) => withUsage(2 * (input.memory.length + input.turns.reduce((sum, turn) => sum + turn.text.length, 0) + 500)),
    // The client reads `{ memory }`; a bare string body was silently ignored.
    sanitizeResult: (result) => ({ memory: cleanMemory(result) }),
  });
  const stt = operation<SttRequest>({
    maxBodyBytes: 4 * 1024 * 1024,
    parse: (body) => {
      const parsed = parseSttRequest(body);
      if (typeof parsed === 'string') return parsed;
      if (!/^[A-Za-z0-9+/]+={0,2}$/.test(parsed.audio) || parsed.audio.length % 4 !== 0) return 'Invalid audio data';
      return parsed;
    },
    minimize: (input) => Object.freeze({
      audio: Uint8Array.from(Buffer.from(input.audio, 'base64')),
      // The provider contract requires a single explicit language; auto currently uses Uzbek.
      languageCode: input.hint === 'fr' ? 'fr-FR' : 'uz-UZ',
      // Cloud STT needs only bytes + language. Gemini audio understanding also needs the container type,
      // and Vivi's last line helps it spell names; these are forwarded only in that mode.
      ...(options.geminiAudioHints
        ? { mimeType: input.mime, autoLanguage: input.hint === 'auto', ...(input.context ? { context: input.context.slice(-300) } : {}) }
        : {}),
    }),
    estimateUsage: (input) => withUsage(0, {
      // Compressed browser audio (Opus ≈ 2–4 KB/s): bytes/2000 is a safe upper bound on seconds.
      sttAudioSeconds: Math.min(60, Math.max(1, Math.ceil((input.audio.length * 3 / 4) / 2_000))),
    }),
    sanitizeResult: (result, input) => {
      const raw = (result ?? {}) as { segments?: Array<{ languageCode?: unknown; alternatives?: Array<{ transcript?: unknown; confidence?: unknown }> }> };
      const segments = Array.isArray(raw.segments) ? raw.segments : [];
      const primaryTexts = segments.map((segment) => {
        const best = Array.isArray(segment.alternatives) ? segment.alternatives[0]?.transcript : undefined;
        return typeof best === 'string' ? best.trim() : '';
      });
      const text = primaryTexts.filter(Boolean).join(' ').slice(0, 4000);
      const alternatives: string[] = [];
      segments.forEach((segment, segmentIndex) => {
        const segmentAlternatives = Array.isArray(segment.alternatives) ? segment.alternatives.slice(1) : [];
        for (const alternative of segmentAlternatives) {
          if (typeof alternative.transcript !== 'string' || !alternative.transcript.trim()) continue;
          const variant = [...primaryTexts];
          variant[segmentIndex] = alternative.transcript.trim();
          const fullVariant = variant.filter(Boolean).join(' ').slice(0, 4000);
          if (fullVariant && fullVariant !== text && !alternatives.includes(fullVariant)) alternatives.push(fullVariant);
          if (alternatives.length === 8) break;
        }
      });
      const confidenceValues = segments.flatMap((segment) => {
        const best = Array.isArray(segment.alternatives) ? segment.alternatives[0]?.confidence : undefined;
        return typeof best === 'number' && Number.isFinite(best) ? [best] : [];
      });
      const confidence = confidenceValues.length === 1 ? confidenceValues[0] : undefined;
      const languageCodes = segments
        .map((segment) => typeof segment.languageCode === 'string' ? segment.languageCode.trim().slice(0, 32) : '')
        .filter(Boolean);
      return reviewSttResult({
        text,
        languageCodes,
        alternatives,
        ...(confidence !== undefined ? { confidence } : {}),
        ...(input.hint === 'uz' ? { expectedLanguage: 'uz-UZ' as const } : input.hint === 'fr' ? { expectedLanguage: 'fr-FR' as const } : {}),
      });
    },
  });
  const tts = operation<{ text: string }>({
    maxBodyBytes: 8 * 1024,
    parse: (body) => {
      if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Invalid TTS request';
      const text = ttsText((body as Record<string, unknown>).text);
      return text ? { text } : 'Empty TTS request';
    },
    minimize: (input) => Object.freeze({ text: input.text }),
    // Upper bound reservation (speech is ≥ ~5 chars/s); settling above the hold would trip the global kill switch.
    estimateUsage: (input) => withUsage(0, { ttsCharacters: input.text.length, ttsAudioSeconds: ttsSecondsUpperBound(input.text) }),
    formatResult: (result, input) => {
      const value = result as { audio?: unknown; mimeType?: unknown } | null;
      if (!value || !(value.audio instanceof Uint8Array) || value.mimeType !== 'audio/wav' || value.audio.byteLength < 44) {
        return { status: 502, body: { code: 'tts_failed', message: 'Ovoz yaratilmadi.' } };
      }
      // 16-bit mono PCM at the WAV header's sample rate → real audio seconds for quota settlement.
      const bytes = Buffer.from(value.audio.buffer, value.audio.byteOffset, value.audio.byteLength);
      const rate = bytes.readUInt32LE(24) || 24_000;
      const seconds = Math.min(ttsSecondsUpperBound(input.text), Math.max(1, Math.ceil((bytes.byteLength - 44) / (rate * 2))));
      return {
        status: 200,
        body: null,
        binary: { data: value.audio, contentType: 'audio/wav' },
        actualUsage: withUsage(0, { ttsCharacters: input.text.length, ttsAudioSeconds: seconds }),
      };
    },
  });

  return Object.freeze({
    'POST /api/tutor': tutor,
    'POST /api/tutor/feedback': feedback,
    'POST /api/live/token': disabledLiveOperation,
    'POST /api/translate': translation,
    'POST /api/tutor/memory': memory,
    'POST /api/stt': stt,
    'POST /api/tts': tts,
  });
}
