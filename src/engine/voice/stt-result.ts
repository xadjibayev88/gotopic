export type DetectedSpeechLanguage = 'uz-UZ' | 'fr-FR' | 'unknown';

export type SttReviewReason =
  | 'confidence_missing'
  | 'alternatives_conflict'
  | 'language_unknown'
  | 'code_switch'
  | 'language_mismatch'
  | 'possible_noise'
  | 'target_phrase_mismatch'
  | 'empty_transcript';

export interface SttResult {
  readonly text: string;
  readonly detectedLanguage: DetectedSpeechLanguage;
  readonly confidence?: number;
  readonly alternatives: readonly string[];
  readonly reviewReasons: readonly SttReviewReason[];
}

/** Synthetic/provider metadata consumed by the deterministic transcript-review policy. */
export interface SttReviewMetadata {
  readonly text: string;
  readonly languageCodes?: readonly string[];
  readonly confidence?: number;
  readonly alternatives?: readonly string[];
  readonly expectedLanguage?: 'uz-UZ' | 'fr-FR';
  readonly targetPhrase?: string;
  readonly noiseSuspected?: boolean;
}

function knownLanguage(code: string): Exclude<DetectedSpeechLanguage, 'unknown'> | null {
  const normalized = code.trim().toLowerCase();
  if (normalized === 'uz-uz') return 'uz-UZ';
  if (normalized === 'fr-fr') return 'fr-FR';
  return null;
}

function comparableText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[\p{P}\p{S}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function reviewSttResult(metadata: SttReviewMetadata): SttResult {
  const text = (typeof metadata.text === 'string' ? metadata.text : '').trim();
  const alternatives = (metadata.alternatives ?? [])
    .filter((alternative): alternative is string => typeof alternative === 'string')
    .map((alternative) => alternative.trim())
    .filter(Boolean)
    .slice(0, 8);
  const languageCodes = (metadata.languageCodes ?? [])
    .filter((code): code is string => typeof code === 'string' && code.trim().length > 0)
    .map((code) => code.trim());
  const distinctCodes = new Set(languageCodes.map((code) => code.toLowerCase()));
  const codeSwitch = distinctCodes.size > 1;
  const recognized = new Set(languageCodes.map(knownLanguage).filter((code): code is Exclude<DetectedSpeechLanguage, 'unknown'> => code !== null));
  const detectedLanguage: DetectedSpeechLanguage = !codeSwitch && recognized.size === 1
    ? [...recognized][0]
    : 'unknown';
  const confidence = typeof metadata.confidence === 'number' && Number.isFinite(metadata.confidence)
    && metadata.confidence >= 0 && metadata.confidence <= 1
    ? metadata.confidence
    : undefined;
  const normalizedText = comparableText(text);
  const normalizedAlternatives = new Set([normalizedText, ...alternatives.map(comparableText)].filter(Boolean));
  const reviewReasons: SttReviewReason[] = [];
  if (confidence === undefined) reviewReasons.push('confidence_missing');
  if (normalizedAlternatives.size > 1) reviewReasons.push('alternatives_conflict');
  if (!codeSwitch && detectedLanguage === 'unknown') reviewReasons.push('language_unknown');
  if (codeSwitch) reviewReasons.push('code_switch');
  if (detectedLanguage !== 'unknown' && metadata.expectedLanguage && detectedLanguage !== metadata.expectedLanguage) {
    reviewReasons.push('language_mismatch');
  }
  if (metadata.noiseSuspected) reviewReasons.push('possible_noise');
  if (metadata.targetPhrase && comparableText(text) !== comparableText(metadata.targetPhrase)) {
    reviewReasons.push('target_phrase_mismatch');
  }
  if (!text) reviewReasons.push('empty_transcript');

  return {
    text,
    detectedLanguage,
    ...(confidence !== undefined ? { confidence } : {}),
    alternatives,
    reviewReasons,
  };
}
