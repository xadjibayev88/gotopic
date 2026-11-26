export type AiProvider = 'google-agent-platform' | 'google-gemini-api';
export type AiModel = 'gemini-3.5-flash-lite' | 'gemini-3.1-flash-lite';
export type AiLocation = 'asia-southeast1' | 'europe-west4';

export interface AiQuotaConfig {
  readonly requestsPerDay: number | null;
  readonly tokensPerDay: number | null;
  readonly sttAudioSecondsPerDay: number | null;
  readonly ttsCharactersPerDay: number | null;
  readonly ttsAudioSecondsPerDay: number | null;
  readonly subjectRequestsPerDay: number | null;
  readonly subjectTokensPerDay: number | null;
  readonly subjectSttAudioSecondsPerDay: number | null;
  readonly subjectTtsCharactersPerDay: number | null;
  readonly subjectTtsAudioSecondsPerDay: number | null;
  readonly spendUsdPerDay: number | null;
}

export interface AiRuntimeConfig {
  /** Effective gate used by the server route registry. */
  readonly providerEnabled: boolean;
  /**
   * Google Agent Platform Live stays false until an approved POC proves Node/hosting WebSocket,
   * server-only ADC, user/session binding, revoke/cancel, timeout, atomic quota, location and lifecycle.
   */
  readonly liveEnabled: false;
  readonly provider: AiProvider | null;
  readonly model: AiModel | null;
  readonly location: AiLocation | null;
  /** Operator attestation only; the parser does not inspect or validate ADC credentials. */
  readonly adcOperatorAttested: boolean;
  readonly projectConfigured: boolean;
  readonly verification: Readonly<{
    provider: boolean;
    model: boolean;
    location: boolean;
    projectAccess: boolean;
  }>;
  readonly quota: Readonly<AiQuotaConfig>;
  readonly killSwitchActive: boolean;
  /** Inputs are complete and explicitly verified, excluding the kill switch/adapter. */
  readonly configurationReady: boolean;
}

const VERIFIED_PROVIDERS = new Set<string>(['google-agent-platform', 'google-gemini-api']);
const VERIFIED_MODELS = new Set<string>(['gemini-3.5-flash-lite']);
// Gemini Developer API (AI Studio key) text models; the free tier serves these without a billing account.
const GEMINI_API_MODELS = new Set<string>(['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']);
// These locations are documented in the approved design as candidate Google Cloud regions.
// They are not proof of model access: project-specific availability must be attested separately.
const VERIFIED_LOCATION_CANDIDATES = new Set<string>(['asia-southeast1', 'europe-west4']);
// The server-only Google adapter (google-cloud-provider.ts + google-auth.ts ADC) is installed and tested.
// Enabling still requires every operator value below; missing or unverified input keeps AI closed.
const GOOGLE_PROVIDER_TRANSPORT_READY = true;

function exactTrue(value: string | undefined): boolean {
  return value === 'true';
}

function positiveInteger(value: string | undefined): number | null {
  if (!value || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function positiveDecimal(value: string | undefined): number | null {
  if (!value || !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseQuota(env: NodeJS.ProcessEnv): Readonly<AiQuotaConfig> {
  return Object.freeze({
    requestsPerDay: positiveInteger(env.VIVI_AI_MAX_REQUESTS_PER_DAY),
    tokensPerDay: positiveInteger(env.VIVI_AI_MAX_TOKENS_PER_DAY),
    sttAudioSecondsPerDay: positiveInteger(env.VIVI_AI_MAX_STT_AUDIO_SECONDS_PER_DAY),
    ttsCharactersPerDay: positiveInteger(env.VIVI_AI_MAX_TTS_CHARACTERS_PER_DAY),
    ttsAudioSecondsPerDay: positiveInteger(env.VIVI_AI_MAX_TTS_AUDIO_SECONDS_PER_DAY),
    subjectRequestsPerDay: positiveInteger(env.VIVI_AI_MAX_SUBJECT_REQUESTS_PER_DAY),
    subjectTokensPerDay: positiveInteger(env.VIVI_AI_MAX_SUBJECT_TOKENS_PER_DAY),
    subjectSttAudioSecondsPerDay: positiveInteger(env.VIVI_AI_MAX_SUBJECT_STT_AUDIO_SECONDS_PER_DAY),
    subjectTtsCharactersPerDay: positiveInteger(env.VIVI_AI_MAX_SUBJECT_TTS_CHARACTERS_PER_DAY),
    subjectTtsAudioSecondsPerDay: positiveInteger(env.VIVI_AI_MAX_SUBJECT_TTS_AUDIO_SECONDS_PER_DAY),
    spendUsdPerDay: positiveDecimal(env.VIVI_AI_MAX_SPEND_USD_PER_DAY),
  });
}

function allQuotaValuesPositive(quota: Readonly<AiQuotaConfig>): boolean {
  return Object.values(quota).every((value) => typeof value === 'number' && value > 0);
}

/**
 * Parse the server-only AI configuration. Any missing, malformed, or unverified value fails closed.
 * `VIVI_AI_ADC_OPERATOR_ATTESTED` is an operator assertion that ADC was configured and separately
 * verified; this function does not look up credentials, read credential files, or make auth/API calls.
 * Live is deliberately hard-disabled regardless of environment input.
 */
export function loadAiRuntimeConfig(env: NodeJS.ProcessEnv): AiRuntimeConfig {
  const rawProvider = env.VIVI_AI_PROVIDER;
  const rawModel = env.VIVI_AI_MODEL;
  const rawLocation = env.GOOGLE_CLOUD_LOCATION;
  const provider = rawProvider && VERIFIED_PROVIDERS.has(rawProvider) ? (rawProvider as AiProvider) : null;
  const geminiApi = provider === 'google-gemini-api';
  const model = rawModel && (geminiApi ? GEMINI_API_MODELS : VERIFIED_MODELS).has(rawModel) ? (rawModel as AiModel) : null;
  const location = rawLocation && VERIFIED_LOCATION_CANDIDATES.has(rawLocation) ? (rawLocation as AiLocation) : null;
  const adcOperatorAttested = exactTrue(env.VIVI_AI_ADC_OPERATOR_ATTESTED);
  const projectConfigured = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(env.GOOGLE_CLOUD_PROJECT_ID ?? '');
  const projectAccessVerified = exactTrue(env.VIVI_AI_PROJECT_CONFIG_VERIFIED);
  const verification = Object.freeze({
    provider: provider !== null,
    model: model !== null && projectAccessVerified,
    location: location !== null && projectAccessVerified,
    projectAccess: projectConfigured && projectAccessVerified,
  });
  const quota = parseQuota(env);
  const killSwitchActive = env.VIVI_AI_KILL_SWITCH !== 'off';
  // Gemini API mode needs only a server-side API key: no Cloud project, region or ADC.
  // Classic `AIza…` keys and the newer `AQ.…` format (which contains dots) are both accepted.
  const geminiApiKeyPresent = /^[A-Za-z0-9_.-]{20,}$/.test(env.GEMINI_API_KEY?.trim() ?? '');
  const configurationReady = geminiApi
    ? exactTrue(env.VIVI_AI_ENABLED) && model !== null && geminiApiKeyPresent && allQuotaValuesPositive(quota)
    : exactTrue(env.VIVI_AI_ENABLED) &&
    provider !== null &&
    model !== null &&
    location !== null &&
    adcOperatorAttested &&
    projectConfigured &&
    projectAccessVerified &&
    allQuotaValuesPositive(quota);

  return Object.freeze({
    providerEnabled: configurationReady && !killSwitchActive && GOOGLE_PROVIDER_TRANSPORT_READY,
    liveEnabled: false,
    provider,
    model,
    location,
    adcOperatorAttested,
    projectConfigured,
    verification,
    quota,
    killSwitchActive,
    configurationReady,
  });
}

const QUOTA_ENV: Readonly<Record<keyof AiQuotaConfig, string>> = Object.freeze({
  requestsPerDay: 'VIVI_AI_MAX_REQUESTS_PER_DAY',
  tokensPerDay: 'VIVI_AI_MAX_TOKENS_PER_DAY',
  sttAudioSecondsPerDay: 'VIVI_AI_MAX_STT_AUDIO_SECONDS_PER_DAY',
  ttsCharactersPerDay: 'VIVI_AI_MAX_TTS_CHARACTERS_PER_DAY',
  ttsAudioSecondsPerDay: 'VIVI_AI_MAX_TTS_AUDIO_SECONDS_PER_DAY',
  subjectRequestsPerDay: 'VIVI_AI_MAX_SUBJECT_REQUESTS_PER_DAY',
  subjectTokensPerDay: 'VIVI_AI_MAX_SUBJECT_TOKENS_PER_DAY',
  subjectSttAudioSecondsPerDay: 'VIVI_AI_MAX_SUBJECT_STT_AUDIO_SECONDS_PER_DAY',
  subjectTtsCharactersPerDay: 'VIVI_AI_MAX_SUBJECT_TTS_CHARACTERS_PER_DAY',
  subjectTtsAudioSecondsPerDay: 'VIVI_AI_MAX_SUBJECT_TTS_AUDIO_SECONDS_PER_DAY',
  spendUsdPerDay: 'VIVI_AI_MAX_SPEND_USD_PER_DAY',
});

/**
 * Operator diagnostics: the NAMES of settings that keep AI closed (never their values).
 * Safe to expose on /api/health so a host without log access can see what to fix.
 */
export function aiConfigProblems(env: NodeJS.ProcessEnv): readonly string[] {
  const config = loadAiRuntimeConfig(env);
  const problems: string[] = [];
  if (env.VIVI_AI_ENABLED !== 'true') problems.push('VIVI_AI_ENABLED');
  if (!config.provider) problems.push('VIVI_AI_PROVIDER');
  if (!config.model) problems.push('VIVI_AI_MODEL');
  if (config.provider === 'google-gemini-api') {
    if (!/^[A-Za-z0-9_.-]{20,}$/.test(env.GEMINI_API_KEY?.trim() ?? '')) problems.push('GEMINI_API_KEY');
  } else if (config.provider) {
    if (!config.location) problems.push('GOOGLE_CLOUD_LOCATION');
    if (!config.adcOperatorAttested) problems.push('VIVI_AI_ADC_OPERATOR_ATTESTED');
    if (!config.projectConfigured) problems.push('GOOGLE_CLOUD_PROJECT_ID');
    if (env.VIVI_AI_PROJECT_CONFIG_VERIFIED !== 'true') problems.push('VIVI_AI_PROJECT_CONFIG_VERIFIED');
  }
  for (const [field, name] of Object.entries(QUOTA_ENV) as [keyof AiQuotaConfig, string][]) {
    if (!(typeof config.quota[field] === 'number' && (config.quota[field] as number) > 0)) problems.push(name);
  }
  if (config.killSwitchActive) problems.push('VIVI_AI_KILL_SWITCH');
  return Object.freeze(problems);
}
