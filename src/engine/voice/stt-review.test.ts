import { describe, expect, it } from 'vitest';
import { reviewSttResult, type SttReviewMetadata } from './stt';

interface Fixture {
  readonly id: string;
  readonly group: 'Uzbek' | 'French' | 'mixed Uzbek–French' | 'unknown';
  readonly input: SttReviewMetadata;
  readonly detectedLanguage: 'uz-UZ' | 'fr-FR' | 'unknown';
  readonly reasons: readonly string[];
}

// Synthetic metadata only. These are not recordings and are never sent to any provider.
const fixtures: Fixture[] = [
  { id: 'uz-01-clear-with-confidence', group: 'Uzbek', input: { text: 'Men yaxshiman', languageCodes: ['uz-UZ'], confidence: 0.91 }, detectedLanguage: 'uz-UZ', reasons: [] },
  { id: 'uz-02-confidence-absent', group: 'Uzbek', input: { text: 'Men yaxshiman', languageCodes: ['uz-UZ'] }, detectedLanguage: 'uz-UZ', reasons: ['confidence_missing'] },
  { id: 'uz-03-alternative-disagrees', group: 'Uzbek', input: { text: 'Men yaxshiman', languageCodes: ['uz-UZ'], confidence: 0.82, alternatives: ['Men yaxshiman', 'Men yaxshimanmi'] }, detectedLanguage: 'uz-UZ', reasons: ['alternatives_conflict'] },
  { id: 'uz-04-unexpected-French', group: 'Uzbek', input: { text: 'Bonjour', languageCodes: ['fr-FR'], expectedLanguage: 'uz-UZ', confidence: 0.9 }, detectedLanguage: 'fr-FR', reasons: ['language_mismatch'] },
  { id: 'uz-05-unrecognized-locale', group: 'Uzbek', input: { text: 'Salom', languageCodes: ['uz-Latn-UZ'], confidence: 0.7 }, detectedLanguage: 'unknown', reasons: ['language_unknown'] },
  { id: 'uz-06-noise-flagged', group: 'Uzbek', input: { text: 'Ha', languageCodes: ['uz-UZ'], confidence: 0.6, noiseSuspected: true }, detectedLanguage: 'uz-UZ', reasons: ['possible_noise'] },
  { id: 'uz-07-empty-recognition', group: 'Uzbek', input: { text: '   ', languageCodes: ['uz-UZ'] }, detectedLanguage: 'uz-UZ', reasons: ['confidence_missing', 'empty_transcript'] },
  { id: 'uz-08-target-phrase-differs', group: 'Uzbek', input: { text: 'Men maktabga bordim', languageCodes: ['uz-UZ'], confidence: 0.9, targetPhrase: 'Men maktabga boraman' }, detectedLanguage: 'uz-UZ', reasons: ['target_phrase_mismatch'] },
  { id: 'uz-09-conflict-and-no-confidence', group: 'Uzbek', input: { text: 'U kitob o‘qiydi', languageCodes: ['uz-UZ'], alternatives: ['U kitob o‘qiyapti'] }, detectedLanguage: 'uz-UZ', reasons: ['confidence_missing', 'alternatives_conflict'] },
  { id: 'uz-10-noise-and-language-mismatch', group: 'Uzbek', input: { text: 'Boraman', languageCodes: ['uz-UZ'], expectedLanguage: 'fr-FR', confidence: 0.5, noiseSuspected: true }, detectedLanguage: 'uz-UZ', reasons: ['language_mismatch', 'possible_noise'] },
  { id: 'uz-11-expected-language-matches', group: 'Uzbek', input: { text: 'Rahmat', languageCodes: ['uz-UZ'], expectedLanguage: 'uz-UZ', confidence: 0.98 }, detectedLanguage: 'uz-UZ', reasons: [] },
  { id: 'uz-12-alternative-same-after-normalizing', group: 'Uzbek', input: { text: '  Salom, dunyo! ', languageCodes: ['uz-UZ'], confidence: 0.8, alternatives: ['Salom, dunyo!'] }, detectedLanguage: 'uz-UZ', reasons: [] },
  { id: 'fr-01-clear-with-confidence', group: 'French', input: { text: 'Je voudrais un café.', languageCodes: ['fr-FR'], confidence: 0.93 }, detectedLanguage: 'fr-FR', reasons: [] },
  { id: 'fr-02-confidence-absent', group: 'French', input: { text: 'Je voudrais un café.', languageCodes: ['fr-FR'] }, detectedLanguage: 'fr-FR', reasons: ['confidence_missing'] },
  { id: 'fr-03-alternative-disagrees', group: 'French', input: { text: 'Je vais au marché.', languageCodes: ['fr-FR'], confidence: 0.8, alternatives: ['Je vais au marché.', 'Je vais à la marche.'] }, detectedLanguage: 'fr-FR', reasons: ['alternatives_conflict'] },
  { id: 'fr-04-unexpected-Uzbek', group: 'French', input: { text: 'Men tayyorman', languageCodes: ['uz-UZ'], expectedLanguage: 'fr-FR', confidence: 0.87 }, detectedLanguage: 'uz-UZ', reasons: ['language_mismatch'] },
  { id: 'fr-05-unknown-provider-language', group: 'French', input: { text: 'Ça va', languageCodes: ['und'], confidence: 0.72 }, detectedLanguage: 'unknown', reasons: ['language_unknown'] },
  { id: 'fr-06-noise-flagged', group: 'French', input: { text: 'Merci', languageCodes: ['fr-FR'], confidence: 0.65, noiseSuspected: true }, detectedLanguage: 'fr-FR', reasons: ['possible_noise'] },
  { id: 'fr-07-empty-recognition', group: 'French', input: { text: '', languageCodes: ['fr-FR'] }, detectedLanguage: 'fr-FR', reasons: ['confidence_missing', 'empty_transcript'] },
  { id: 'fr-08-target-phrase-sensitive', group: 'French', input: { text: 'Je suis vingt ans', languageCodes: ['fr-FR'], confidence: 0.88, targetPhrase: 'J’ai vingt ans' }, detectedLanguage: 'fr-FR', reasons: ['target_phrase_mismatch'] },
  { id: 'fr-09-target-phrase-matches', group: 'French', input: { text: 'J’ai vingt ans.', languageCodes: ['fr-FR'], confidence: 0.88, targetPhrase: 'J’ai vingt ans' }, detectedLanguage: 'fr-FR', reasons: [] },
  { id: 'fr-10-alternative-includes-primary-and-variant', group: 'French', input: { text: 'Je m’appelle Ali', languageCodes: ['fr-FR'], confidence: 0.88, alternatives: ['Je m’appelle Ali', 'Je m’appelle Alix'] }, detectedLanguage: 'fr-FR', reasons: ['alternatives_conflict'] },
  { id: 'fr-11-correct-alternative-only', group: 'French', input: { text: 'Nous allons au musée', languageCodes: ['fr-FR'], confidence: 0.71, alternatives: ['Nous allons au musée'] }, detectedLanguage: 'fr-FR', reasons: [] },
  { id: 'fr-12-confidence-value-is-not-a-cutoff', group: 'French', input: { text: 'Il fait beau', languageCodes: ['fr-FR'], confidence: 0.02 }, detectedLanguage: 'fr-FR', reasons: [] },
  { id: 'mix-01-code-switch-segments', group: 'mixed Uzbek–French', input: { text: 'Men vais au marché', languageCodes: ['uz-UZ', 'fr-FR'], confidence: 0.77 }, detectedLanguage: 'unknown', reasons: ['code_switch'] },
  { id: 'mix-02-code-switch-without-confidence', group: 'mixed Uzbek–French', input: { text: 'Bugun je travaille', languageCodes: ['uz-UZ', 'fr-FR'] }, detectedLanguage: 'unknown', reasons: ['confidence_missing', 'code_switch'] },
  { id: 'mix-03-code-switch-target-phrase', group: 'mixed Uzbek–French', input: { text: 'Men aime les pommes', languageCodes: ['uz-UZ', 'fr-FR'], confidence: 0.81, targetPhrase: 'J’aime les pommes' }, detectedLanguage: 'unknown', reasons: ['code_switch', 'target_phrase_mismatch'] },
  { id: 'mix-04-code-switch-alternative-conflict', group: 'mixed Uzbek–French', input: { text: 'Men parle français', languageCodes: ['uz-UZ', 'fr-FR'], confidence: 0.7, alternatives: ['Men parle français', 'Je parle français'] }, detectedLanguage: 'unknown', reasons: ['alternatives_conflict', 'code_switch'] },
  { id: 'mix-05-code-switch-noise', group: 'mixed Uzbek–French', input: { text: 'Men suis prêt', languageCodes: ['uz-UZ', 'fr-FR'], confidence: 0.7, noiseSuspected: true }, detectedLanguage: 'unknown', reasons: ['code_switch', 'possible_noise'] },
  { id: 'mix-06-repeated-language-tags', group: 'mixed Uzbek–French', input: { text: 'Bonjour, men keldim', languageCodes: ['fr-FR', 'fr-FR', 'uz-UZ'], confidence: 0.75 }, detectedLanguage: 'unknown', reasons: ['code_switch'] },
  { id: 'mix-07-one-language-code-is-unknown', group: 'mixed Uzbek–French', input: { text: 'Je boraman', languageCodes: ['fr-FR', 'xx-XX'], confidence: 0.75 }, detectedLanguage: 'unknown', reasons: ['code_switch'] },
  { id: 'mix-08-mixed-empty', group: 'mixed Uzbek–French', input: { text: '', languageCodes: ['uz-UZ', 'fr-FR'] }, detectedLanguage: 'unknown', reasons: ['confidence_missing', 'code_switch', 'empty_transcript'] },
  { id: 'mix-09-code-switch-expected-French', group: 'mixed Uzbek–French', input: { text: 'Men veux partir', languageCodes: ['uz-UZ', 'fr-FR'], expectedLanguage: 'fr-FR', confidence: 0.8 }, detectedLanguage: 'unknown', reasons: ['code_switch'] },
  { id: 'mix-10-noise-and-no-confidence', group: 'mixed Uzbek–French', input: { text: 'Ha, oui', languageCodes: ['uz-UZ', 'fr-FR'], noiseSuspected: true }, detectedLanguage: 'unknown', reasons: ['confidence_missing', 'code_switch', 'possible_noise'] },
  { id: 'unknown-01-no-language-metadata', group: 'unknown', input: { text: 'Salom' }, detectedLanguage: 'unknown', reasons: ['confidence_missing', 'language_unknown'] },
  { id: 'unknown-02-missing-locale-with-alternative', group: 'unknown', input: { text: 'Ça va', alternatives: ['Ça va', 'Ça va bien'] }, detectedLanguage: 'unknown', reasons: ['confidence_missing', 'alternatives_conflict', 'language_unknown'] },
  { id: 'unknown-03-invalid-confidence-is-not-trusted', group: 'unknown', input: { text: 'Salut', languageCodes: ['fr-FR'], confidence: Number.NaN }, detectedLanguage: 'fr-FR', reasons: ['confidence_missing'] },
  { id: 'unknown-04-unknown-language-with-noise', group: 'unknown', input: { text: '???', languageCodes: ['unknown'], confidence: 0.4, noiseSuspected: true }, detectedLanguage: 'unknown', reasons: ['language_unknown', 'possible_noise'] },
];

describe('STT result review metadata (synthetic fixtures)', () => {
  it('covers at least 30 labeled Uzbek, French, mixed, and unknown metadata cases', () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(30);
    expect(new Set(fixtures.map((fixture) => fixture.id)).size).toBe(fixtures.length);
    expect(new Set(fixtures.map((fixture) => fixture.group))).toEqual(new Set(['Uzbek', 'French', 'mixed Uzbek–French', 'unknown']));
  });

  it.each(fixtures)('$id ($group)', ({ input, detectedLanguage, reasons }) => {
    const result = reviewSttResult(input);
    expect(result.detectedLanguage).toBe(detectedLanguage);
    expect(result.reviewReasons).toEqual(reasons);
    expect(result.text).toBe(input.text.trim());
    expect(result.alternatives).toEqual(input.alternatives ?? []);
    if (input.confidence !== undefined && Number.isFinite(input.confidence)) expect(result.confidence).toBe(input.confidence);
    else expect(result.confidence).toBeUndefined();
  });

  it('preserves numeric confidence as metadata without applying an uncalibrated numeric cutoff', () => {
    for (const confidence of [0.01, 0.49, 0.99]) {
      const result = reviewSttResult({ text: 'Bonjour', languageCodes: ['fr-FR'], confidence });
      expect(result.confidence).toBe(confidence);
      expect(result.reviewReasons).not.toContain('confidence_low');
    }
  });
});
