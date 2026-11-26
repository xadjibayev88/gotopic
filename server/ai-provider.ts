/** Consent/disclosure identities are distinct even when one adapter implements both Google APIs. */
export const AI_PROVIDER_NAMES = ['google-agent-platform', 'google-cloud-speech-to-text', 'google-gemini-api'] as const;
export type AiProviderName = (typeof AI_PROVIDER_NAMES)[number];

export type AiProviderErrorCode =
  | 'unsupported_provider'
  | 'provider_unavailable'
  | 'duplicate_provider'
  | 'auth_unavailable'
  | 'upstream_error'
  | 'invalid_response'
  | 'request_aborted';

const SAFE_MESSAGES: Record<AiProviderErrorCode, string> = {
  unsupported_provider: 'Unsupported AI provider.',
  provider_unavailable: 'AI provider configuration is unavailable.',
  duplicate_provider: 'AI provider registration is ambiguous.',
  auth_unavailable: 'Google authentication is unavailable.',
  upstream_error: 'Google AI request failed.',
  invalid_response: 'Google AI response was invalid.',
  request_aborted: 'AI request was cancelled.',
};

/** Safe boundary error: never includes credentials, upstream response bodies, or raw auth errors. */
export class AiProviderError extends Error {
  readonly code: AiProviderErrorCode;
  readonly status?: number;

  constructor(code: AiProviderErrorCode, status?: number) {
    super(SAFE_MESSAGES[code]);
    this.name = 'AiProviderError';
    this.code = code;
    if (status !== undefined) this.status = status;
  }
}

export interface AiTextPart {
  readonly text: string;
}

export interface AiContent {
  readonly role: 'user' | 'model';
  readonly parts: readonly AiTextPart[];
}

export interface AiPrompt {
  readonly systemInstruction?: string;
  readonly contents: readonly AiContent[];
  readonly generationConfig?: Readonly<Record<string, unknown>>;
  readonly safetySettings?: readonly Readonly<Record<string, unknown>>[];
}

export type SpeechLanguageCode = 'uz-UZ' | 'fr-FR';

export interface TranscriptionRequest {
  readonly audio: Uint8Array;
  readonly languageCode: SpeechLanguageCode;
  /** Container type of the browser recording (e.g. audio/webm); used by Gemini audio understanding. */
  readonly mimeType?: string;
  /** True when the learner did not choose a language; the transcriber may keep mixed Uzbek/French. */
  readonly autoLanguage?: boolean;
  /** Vivi's last line, only to spell names/words correctly. */
  readonly context?: string;
}

export interface SpeechAlternative {
  readonly transcript: string;
  readonly confidence?: number;
}

export interface SpeechSegment {
  readonly languageCode?: string;
  readonly alternatives: readonly SpeechAlternative[];
}

export interface TranscriptionResult {
  readonly segments: readonly SpeechSegment[];
}

export interface SynthesisRequest {
  readonly text: string;
}

export interface SynthesisResult {
  readonly audio: Uint8Array;
  readonly mimeType: 'audio/wav';
}

/** Server-side Google adapter with explicit consent/disclosure identities for its supported services. */
export interface AiProvider {
  readonly name: AiProviderName;
  readonly serviceNames: readonly AiProviderName[];
  streamTutor(prompt: AiPrompt, signal?: AbortSignal): AsyncIterable<string>;
  generateJson(prompt: AiPrompt, signal?: AbortSignal): Promise<unknown>;
  transcribe(request: TranscriptionRequest, signal?: AbortSignal): Promise<TranscriptionResult>;
  synthesize(request: SynthesisRequest, signal?: AbortSignal): Promise<SynthesisResult>;
}

export interface AiProviderRegistry {
  get(name: string): AiProvider;
  names(): readonly AiProviderName[];
}

/** Creates an explicit registry. It never substitutes a different vendor when lookup fails. */
export function createAiProviderRegistry(providers: readonly AiProvider[]): AiProviderRegistry {
  const supported = new Set<string>(AI_PROVIDER_NAMES);
  const registered = new Map<AiProviderName, AiProvider>();

  for (const provider of providers) {
    const name: unknown = provider?.name;
    if (typeof name !== 'string' || !supported.has(name)) throw new AiProviderError('unsupported_provider');
    const serviceNames: unknown = provider?.serviceNames;
    if (
      !Array.isArray(serviceNames) ||
      serviceNames.length === 0 ||
      !serviceNames.includes(name) ||
      serviceNames.some((serviceName) => typeof serviceName !== 'string' || !supported.has(serviceName))
    ) {
      throw new AiProviderError('unsupported_provider');
    }
    for (const serviceName of serviceNames as AiProviderName[]) {
      if (registered.has(serviceName)) throw new AiProviderError('duplicate_provider');
      registered.set(serviceName, provider);
    }
  }

  return Object.freeze({
    get(name: string): AiProvider {
      if (!supported.has(name)) throw new AiProviderError('unsupported_provider');
      const provider = registered.get(name as AiProviderName);
      if (!provider) throw new AiProviderError('provider_unavailable');
      return provider;
    },
    names: () => Object.freeze([...registered.keys()]),
  });
}
