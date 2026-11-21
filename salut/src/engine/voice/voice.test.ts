import { describe, expect, it } from 'vitest';
import { displayText, extractCues, langSegments, SentenceSplitter, speechText, talkStats } from './markers';
import { compareStats, type SessionRecord } from './prefs';

describe('markers', () => {
  it('extracts shape and actions and hides them from text', () => {
    const { clean, cue } = extractCues('[[shape:heart]][[do:hop]] Zo\'r! [[do:nope]] [[shape:xx]]');
    expect(cue).toEqual({ shape: 'heart', actions: ['hop'] });
    expect(clean.trim()).toBe("Zo'r!");
  });
  it('strips audio tags for display and for non-v3 speech', () => {
    expect(displayText('[laughs] [fr]Oui[/fr] juda yaxshi')).toBe('[fr]Oui[/fr] juda yaxshi');
    expect(speechText('[laughs] [fr]Oui[/fr]', false)).toBe('Oui');
    expect(speechText('[laughs] [fr]Oui[/fr]', true)).toBe('[laughs] Oui');
  });
  it('splits a stream into sentences as soon as they complete, never inside [fr]', () => {
    const sp = new SentenceSplitter();
    expect(sp.push('Salom! Bugun ')).toEqual(['Salom!']);
    expect(sp.push('[fr]Ça va ? Oui.[/fr] deymiz. Keyin')).toEqual(['Bugun [fr]Ça va ? Oui.[/fr] deymiz.']);
    expect(sp.flush()).toEqual(['Keyin']);
  });
  it('splits languages for browser voices', () => {
    expect(langSegments('Ayting: [fr]Bonjour ![/fr] — salom.')).toEqual([
      { fr: false, text: 'Ayting:' },
      { fr: true, text: 'Bonjour !' },
      { fr: false, text: '— salom.' },
    ]);
  });
  it('counts talk statistics', () => {
    expect(talkStats(['Je suis Ali. Je suis ouzbek!', 'merci'])).toEqual({ words: 7, sentences: 3, unique: 5 });
  });
});

describe('records', () => {
  const rec = (id: string, words: number, speakingMs: number): SessionRecord => ({
    id, at: 0, character: 'classic', role: 'free', durationMs: 0, speakingMs, stats: { words, sentences: 1, unique: words }, turns: [],
  });
  it('detects personal records and improvement over last session', () => {
    const c = compareStats({ stats: { words: 30, sentences: 1, unique: 10 }, speakingMs: 5000 }, [rec('b', 20, 9000), rec('a', 25, 1000)]);
    expect(c.words).toEqual({ record: true, up: true });
    expect(c.speaking).toEqual({ record: false, up: false });
  });
});
