import {
  AiProviderError,
  type AiPrompt,
  type AiProvider,
  type SpeechLanguageCode,
  type SynthesisRequest,
  type SynthesisResult,
  type TranscriptionRequest,
  type TranscriptionResult,
} from './ai-provider.ts';

export const GOOGLE_CLOUD_PLATFORM_SCOPE = 'https://www.googleapis.com/auth/cloud-platform' as const;

export interface GoogleAccessTokenSource {
  /** Production callers may bind this to Google ADC; tests inject a fake and make no auth calls. */
  getAccessToken(scope: typeof GOOGLE_CLOUD_PLATFORM_SCOPE): Promise<string>;
}

export interface VerifiedServiceConfig {
  readonly model?: string;
  readonly location?: string;
  readonly verified?: boolean;
}

export interface VerifiedSttConfig extends VerifiedServiceConfig {
  readonly recognizer?: string;
  /** Per-language regions: Chirp 2 serves uz-UZ and fr-FR from different documented locations. */
  readonly locations?: Readonly<Partial<Record<SpeechLanguageCode, string>>>;
}

export interface VerifiedTtsConfig extends VerifiedServiceConfig {
  readonly voice?: string;
  /** Optional natural-language delivery instruction placed before the text (Gemini TTS style control). */
  readonly style?: string;
}

/** All model, location, recognizer and voice choices are supplied explicitly; none have defaults. */
export interface GoogleCloudProviderConfig {
  readonly provider?: string;
  readonly projectId?: string;
  readonly projectAccessVerified?: boolean;
  readonly text?: VerifiedServiceConfig;
  readonly speechToText?: VerifiedSttConfig;
  readonly textToSpeech?: VerifiedTtsConfig;
}

export interface GoogleCloudProviderDependencies {
  readonly auth: GoogleAccessTokenSource;
  /** Required injection: this module never falls back to the process-global fetch. */
  readonly fetchImpl: typeof fetch;
}

interface JsonRecord {
  readonly [key: string]: unknown;
}

const TEXT_MODELS = new Set(['gemini-3.5-flash-lite']);
const TEXT_LOCATIONS = new Set(['asia-southeast1', 'europe-west4']);
const STT_MODELS = new Set(['chirp_2']);
const STT_LOCATION_BY_LANGUAGE: Readonly<Record<SpeechLanguageCode, string>> = {
  'uz-UZ': 'asia-southeast1',
  'fr-FR': 'europe-west4',
};
const TTS_MODELS = new Set(['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts']);
const TTS_ENDPOINTS: Readonly<Record<string, string>> = {
  global: 'https://aiplatform.googleapis.com',
  us: 'https://aiplatform.us.rep.googleapis.com',
  eu: 'https://aiplatform.eu.rep.googleapis.com',
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validProjectId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value);
}

function validRecognizer(value: unknown): value is string {
  return typeof value === 'string' && (value === '_' || /^[a-z][a-z0-9-]{0,61}[a-z0-9]$/.test(value));
}

function validVoice(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 128 && !/[\u0000-\u001f\u007f]/.test(value);
}

function requiredProject(config: GoogleCloudProviderConfig): string {
  if (
    config.provider !== 'google-agent-platform' ||
    config.projectAccessVerified !== true ||
    !validProjectId(config.projectId)
  ) {
    throw new AiProviderError('provider_unavailable');
  }
  return config.projectId;
}

function textEndpoint(config: GoogleCloudProviderConfig): string {
  const projectId = requiredProject(config);
  const service = config.text;
  if (
    !service ||
    service.verified !== true ||
    typeof service.model !== 'string' || !TEXT_MODELS.has(service.model) ||
    typeof service.location !== 'string' || !TEXT_LOCATIONS.has(service.location)
  ) {
    throw new AiProviderError('provider_unavailable');
  }
  return `https://${service.location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${service.location}/publishers/google/models/${service.model}:generateContent`;
}

function sttEndpoint(config: GoogleCloudProviderConfig, languageCode: SpeechLanguageCode): { url: string; model: string } {
  const projectId = requiredProject(config);
  const service = config.speechToText;
  if (
    !service ||
    service.verified !== true ||
    service.model !== 'chirp_2' ||
    !STT_MODELS.has(service.model) ||
    (service.locations?.[languageCode] ?? service.location) !== STT_LOCATION_BY_LANGUAGE[languageCode] ||
    !validRecognizer(service.recognizer)
  ) {
    throw new AiProviderError('provider_unavailable');
  }
  const location = STT_LOCATION_BY_LANGUAGE[languageCode];
  // Speech-to-Text v2 regional recognizers are served only from the matching regional endpoint.
  return {
    url: `https://${location}-speech.googleapis.com/v2/projects/${projectId}/locations/${location}/recognizers/${service.recognizer}:recognize`,
    model: service.model,
  };
}

function ttsEndpoint(config: GoogleCloudProviderConfig): { url: string; voice: string; style?: string } {
  const projectId = requiredProject(config);
  const service = config.textToSpeech;
  if (
    !service ||
    service.verified !== true ||
    typeof service.model !== 'string' || !TTS_MODELS.has(service.model) ||
    typeof service.location !== 'string' || !Object.prototype.hasOwnProperty.call(TTS_ENDPOINTS, service.location) ||
    !validVoice(service.voice)
  ) {
    throw new AiProviderError('provider_unavailable');
  }
  const host = TTS_ENDPOINTS[service.location];
  return {
    url: `${host}/v1/projects/${projectId}/locations/${service.location}/publishers/google/models/${service.model}:generateContent`,
    voice: service.voice,
    ...(typeof service.style === 'string' && service.style.trim() ? { style: service.style.trim().slice(0, 400) } : {}),
  };
}

/** Gemini TTS returns raw 16-bit little-endian PCM (`audio/L16;codec=pcm;rate=24000`); browsers need a WAV header. */
export function pcmToWav(pcm: Buffer, sampleRate: number, channels = 1): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * 2;
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(channels * 2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function pcmRate(mimeType: string): number | null {
  if (!/^audio\/(l16|pcm)\b/i.test(mimeType)) return null;
  const match = /rate=(\d{4,6})/i.exec(mimeType);
  const rate = match ? Number(match[1]) : 24_000;
  return rate >= 8_000 && rate <= 48_000 ? rate : null;
}

function promptPayload(prompt: AiPrompt, jsonMode: boolean): JsonRecord {
  const rawContents: unknown = prompt?.contents;
  if (!Array.isArray(rawContents) || rawContents.length === 0) throw new AiProviderError('provider_unavailable');
  const contents = (rawContents as AiPrompt['contents']).map((content) => {
    const rawParts: unknown = content?.parts;
    if (!content || (content.role !== 'user' && content.role !== 'model') || !Array.isArray(rawParts) || rawParts.length === 0) {
      throw new AiProviderError('provider_unavailable');
    }
    const parts = (rawParts as AiPrompt['contents'][number]['parts']).map((part) => {
      if (!part || typeof part.text !== 'string') throw new AiProviderError('provider_unavailable');
      return { text: part.text };
    });
    return { role: content.role, parts };
  });
  const generationConfig: Record<string, unknown> = { ...(prompt.generationConfig ?? {}) };
  if (jsonMode) generationConfig.responseMimeType = 'application/json';

  return {
    ...(typeof prompt.systemInstruction === 'string' && prompt.systemInstruction.length > 0
      ? { systemInstruction: { parts: [{ text: prompt.systemInstruction }] } }
      : {}),
    contents,
    ...(Object.keys(generationConfig).length > 0 ? { generationConfig } : {}),
    ...(prompt.safetySettings ? { safetySettings: prompt.safetySettings } : {}),
  };
}

function extractCandidateText(value: unknown): string {
  if (!isRecord(value) || !Array.isArray(value.candidates)) throw new AiProviderError('invalid_response');
  const candidate = value.candidates[0];
  if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
    throw new AiProviderError('invalid_response');
  }
  const text = candidate.content.parts
    .filter((part): part is JsonRecord => isRecord(part))
    .map((part) => part.text)
    .filter((part): part is string => typeof part === 'string')
    .join('');
  if (!text) throw new AiProviderError('invalid_response');
  return text;
}

function parseTranscription(value: unknown): TranscriptionResult {
  if (!isRecord(value) || !Array.isArray(value.results)) throw new AiProviderError('invalid_response');
  const segments = value.results.map((raw): TranscriptionResult['segments'][number] => {
    if (!isRecord(raw) || !Array.isArray(raw.alternatives)) throw new AiProviderError('invalid_response');
    const alternatives = raw.alternatives.map((alternative) => {
      if (!isRecord(alternative) || typeof alternative.transcript !== 'string') throw new AiProviderError('invalid_response');
      return {
        transcript: alternative.transcript,
        ...(typeof alternative.confidence === 'number' && Number.isFinite(alternative.confidence)
          ? { confidence: alternative.confidence }
          : {}),
      };
    });
    return {
      ...(typeof raw.languageCode === 'string' ? { languageCode: raw.languageCode } : {}),
      alternatives,
    };
  });
  return { segments };
}

async function readJson(response: Response, signal?: AbortSignal): Promise<unknown> {
  if (signal?.aborted) throw new AiProviderError('request_aborted');
  if (!response.ok) throw new AiProviderError('upstream_error', response.status);
  try {
    const body = await response.json();
    if (signal?.aborted) throw new AiProviderError('request_aborted');
    return body;
  } catch {
    if (signal?.aborted) throw new AiProviderError('request_aborted');
    throw new AiProviderError('invalid_response');
  }
}

function awaitWithAbort<T>(value: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return value;
  if (signal.aborted) return Promise.reject(new AiProviderError('request_aborted'));
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(new AiProviderError('request_aborted'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
    value.then(
      (result) => {
        signal.removeEventListener('abort', onAbort);
        resolve(result);
      },
      (error) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

function isValidRiffWave(audio: Buffer): boolean {
  if (
    audio.length < 12 ||
    audio.toString('ascii', 0, 4) !== 'RIFF' ||
    audio.readUInt32LE(4) !== audio.length - 8 ||
    audio.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    return false;
  }

  let offset = 12;
  let format: { tag: number; blockAlign: number } | undefined;
  const dataChunkSizes: number[] = [];

  while (offset < audio.length) {
    if (audio.length - offset < 8) return false;
    const chunkId = audio.toString('ascii', offset, offset + 4);
    const chunkSize = audio.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkSize;
    if (chunkEnd > audio.length) return false;

    if (chunkId === 'fmt ') {
      if (format || chunkSize < 16) return false;
      const tag = audio.readUInt16LE(chunkStart);
      const channels = audio.readUInt16LE(chunkStart + 2);
      const sampleRate = audio.readUInt32LE(chunkStart + 4);
      const byteRate = audio.readUInt32LE(chunkStart + 8);
      const blockAlign = audio.readUInt16LE(chunkStart + 12);
      const bitsPerSample = audio.readUInt16LE(chunkStart + 14);
      if (!tag || !channels || !sampleRate || !byteRate || !blockAlign || !bitsPerSample) return false;
      if (
        tag === 1 &&
        (bitsPerSample % 8 !== 0 || blockAlign !== channels * bitsPerSample / 8 || byteRate !== sampleRate * blockAlign)
      ) {
        return false;
      }
      format = { tag, blockAlign };
    } else if (chunkId === 'data') {
      if (chunkSize === 0) return false;
      dataChunkSizes.push(chunkSize);
    }

    const nextOffset = chunkEnd + (chunkSize % 2);
    if (nextOffset > audio.length) return false;
    offset = nextOffset;
  }

  if (!format || dataChunkSizes.length === 0) return false;
  if (format.tag === 1 && dataChunkSizes.some((size) => size % format.blockAlign !== 0)) return false;
  return true;
}

export function createGoogleCloudProvider(
  config: GoogleCloudProviderConfig,
  dependencies: GoogleCloudProviderDependencies,
): AiProvider {
  const postJson = async (url: string, body: JsonRecord, signal?: AbortSignal): Promise<unknown> => {
    if (signal?.aborted) throw new AiProviderError('request_aborted');
    if (!dependencies?.auth || typeof dependencies.auth.getAccessToken !== 'function' || typeof dependencies.fetchImpl !== 'function') {
      throw new AiProviderError('provider_unavailable');
    }

    let token: string;
    try {
      token = await awaitWithAbort(dependencies.auth.getAccessToken(GOOGLE_CLOUD_PLATFORM_SCOPE), signal);
    } catch {
      if (signal?.aborted) throw new AiProviderError('request_aborted');
      throw new AiProviderError('auth_unavailable');
    }
    if (typeof token !== 'string' || token.length === 0 || /[\r\n]/.test(token)) {
      throw new AiProviderError('auth_unavailable');
    }
    if (signal?.aborted) throw new AiProviderError('request_aborted');

    let response: Response;
    try {
      response = await dependencies.fetchImpl(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
        ...(signal ? { signal } : {}),
      });
    } catch {
      throw new AiProviderError(signal?.aborted ? 'request_aborted' : 'upstream_error');
    }
    return readJson(response, signal);
  };

  const generateText = async (prompt: AiPrompt, signal?: AbortSignal): Promise<string> => {
    const url = textEndpoint(config);
    const payload = promptPayload(prompt, false);
    const response = await postJson(url, payload, signal);
    return extractCandidateText(response);
  };

  return Object.freeze({
    name: 'google-agent-platform' as const,
    // Consent keeps Cloud Speech separate from Agent Platform although this adapter owns both transports.
    serviceNames: ['google-agent-platform', 'google-cloud-speech-to-text'] as const,

    /**
     * The documented stream REST method returns a stream of GenerateContentResponse instances, but the
     * REST reference does not specify the wire framing. Until a verified decoder is available, this
     * method uses the documented unary JSON method and yields one complete text chunk.
     */
    async *streamTutor(prompt: AiPrompt, signal?: AbortSignal): AsyncIterable<string> {
      yield await generateText(prompt, signal);
    },

    async generateJson(prompt: AiPrompt, signal?: AbortSignal): Promise<unknown> {
      const url = textEndpoint(config);
      const payload = promptPayload(prompt, true);
      const response = await postJson(url, payload, signal);
      const text = extractCandidateText(response);
      try {
        return JSON.parse(text) as unknown;
      } catch {
        throw new AiProviderError('invalid_response');
      }
    },

    async transcribe(request: TranscriptionRequest, signal?: AbortSignal): Promise<TranscriptionResult> {
      const service = sttEndpoint(config, request.languageCode);
      if (!(request.audio instanceof Uint8Array) || request.audio.byteLength === 0) throw new AiProviderError('provider_unavailable');
      const payload = {
        config: {
          model: service.model,
          languageCodes: [request.languageCode],
          autoDecodingConfig: {},
        },
        content: Buffer.from(request.audio).toString('base64'),
      };
      const response = await postJson(service.url, payload, signal);
      return parseTranscription(response);
    },

    async synthesize(request: SynthesisRequest, signal?: AbortSignal): Promise<SynthesisResult> {
      const service = ttsEndpoint(config);
      if (typeof request?.text !== 'string' || request.text.trim().length === 0) throw new AiProviderError('provider_unavailable');
      const spoken = service.style ? `${service.style}\n\n${request.text}` : request.text;
      const payload: JsonRecord = {
        contents: [{ role: 'user', parts: [{ text: spoken }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: service.voice } } },
        },
      };
      const response = await postJson(service.url, payload, signal);
      if (!isRecord(response) || !Array.isArray(response.candidates)) throw new AiProviderError('invalid_response');
      const candidate = response.candidates[0];
      if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
        throw new AiProviderError('invalid_response');
      }
      const audioParts = candidate.content.parts.filter(
        (part): part is JsonRecord => isRecord(part) && isRecord(part.inlineData),
      );
      if (audioParts.length !== 1) throw new AiProviderError('invalid_response');
      const inlineData = audioParts[0].inlineData as JsonRecord;
      const mimeType = typeof inlineData.mimeType === 'string' ? inlineData.mimeType : '';
      const rate = pcmRate(mimeType);
      if (
        (mimeType !== 'audio/wav' && rate === null) ||
        typeof inlineData.data !== 'string' ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(inlineData.data)
      ) {
        throw new AiProviderError('invalid_response');
      }
      const decoded = Buffer.from(inlineData.data, 'base64');
      if (rate !== null && (decoded.length === 0 || decoded.length % 2 !== 0)) throw new AiProviderError('invalid_response');
      const audio = rate !== null ? pcmToWav(decoded, rate) : decoded;
      if (!isValidRiffWave(audio)) throw new AiProviderError('invalid_response');
      return { audio, mimeType: 'audio/wav' } satisfies SynthesisResult;
    },
  });
}
