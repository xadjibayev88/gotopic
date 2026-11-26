import { describe, expect, it, vi } from 'vitest';
import { displayText, extractCues, langSegments, SentenceSplitter, speechText, talkStats } from './markers';
import { compareStats, type SessionRecord } from './prefs';
import { TtsQueue } from './tts';

describe('markers', () => {
  it('extracts only approved actions and hides shape and unknown markers from text', () => {
    const { clean, cue } = extractCues('[[shape:heart]][[do:hop]] Zo\'r! [[do:nope]] [[shape:xx]]');
    expect(cue).toEqual({ actions: ['hop'] });
    expect(clean.trim()).toBe("Zo'r!");
  });
  it('accepts shorthand markers and drops unknown ones', () => {
    const { clean, cue } = extractCues('[[tall]] [[point]] [[zzz]] Yetarli emas.');
    expect(cue).toEqual({ actions: [] });
    expect(clean.trim()).toBe('Yetarli emas.');
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

describe('TTS request retry policy', () => {
  it.each([
    ['retryable 503 response', async () => new Response('{}', { status: 503 }), 'tts_failed'],
    ['quota 429 response', async () => new Response('{"code":"ai_quota_exhausted"}', { status: 429 }), 'tts_quota'],
    ['ambiguous network failure', async () => { throw new TypeError('connection reset'); }, 'tts_failed'],
  ])('does not retry after %s', async (_label, response, expectedFailure) => {
    const fetchMock = vi.fn(response);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const queue = new TtsQueue('elevenlabs');
    const onFail = vi.fn();
    queue.onFail = onFail;
    try {
      const fetchAudio = (queue as unknown as { fetchAudio(raw: string, signal: AbortSignal): Promise<Blob | null> }).fetchAudio.bind(queue);
      const result = await fetchAudio('Bonjour', new AbortController().signal);
      expect(result).toBeNull();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(onFail).toHaveBeenCalledWith(expectedFailure);
    } finally {
      queue.dispose();
      vi.unstubAllGlobals();
    }
  });
});

import { answerLang } from './markers';
import { parseRich as parseRichAns } from '../tutor';

describe('answerLang — mikrofon tilini avtomatik tanlash', () => {
  it('model belgisi ustun', () => {
    expect(answerLang("Zo'r! Endi ayting: [fr]Je m'appelle Ali.[/fr] [[ans:fr]]")).toBe('fr');
    expect(answerLang('Bugun nima o\'rganamiz? [[ans:uz]]')).toBe('uz');
  });
  it('belgisiz — matndan taxmin', () => {
    expect(answerLang("Qani, buni fransuzcha ayting: men talabaman.")).toBe('fr');
    expect(answerLang("[fr]Comment tu t'appelles ?[/fr]")).toBe('fr');
    expect(answerLang('Bugun kayfiyatingiz qanday?')).toBeNull();
  });
  it('belgi chatda ko\'rinmaydi (oqim paytida ham)', () => {
    const txt = parseRichAns('Salom! [[ans:fr]]').map((s) => s.text).join('');
    expect(txt).not.toContain('[[');
    expect(parseRichAns('Salom [[an', true).map((s) => s.text).join('')).not.toContain('[[');
  });
});

describe('answerLang — fransuzcha savol belgidan ustun', () => {
  it("oxirgi fransuzcha savol + tarjima → fr", () => {
    expect(answerLang("Tanishamiz: [fr]Comment tu t'appelles ?[/fr] (komma tü appel) — isming nima?\n\n[[ans:uz]]")).toBe('fr');
    expect(answerLang("[fr]Bonjour ![/fr] — salom. Bugun nimani o'rganamiz? [[ans:uz]]")).toBe('uz');
  });
});

describe('effektlar: rasm va noto\'g\'ri teglar', () => {
  it('[[img:...]] ajratiladi va matndan olinadi', () => {
    const { clean, cue } = extractCues("[[shape:heart]] Voy, [[img:Ulug'bek Rahmatullayev]] kabi romantik!");
    expect(cue.image).toBe("Ulug'bek Rahmatullayev");
    expect(cue.actions).toEqual([]);
    expect(clean).not.toContain('[[');
  });
  it('«[[fr]» xatosi tuzatiladi', () => {
    expect(parseRichAns('ey [[fr]mon amour[/fr] — muhabbatim').find((s) => s.kind === 'fr')?.text).toBe('mon amour');
  });
});

describe('ovoz teglari va xavfsiz Vivi imo-ishoralari', () => {
  it('maps laughter only to approved giggle and strips unsafe/sound tags without side effects', () => {
    expect(extractCues('[laughs] Voy!').cue.actions).toContain('giggle');
    expect(extractCues('[crying] Nega?').cue).toEqual({ actions: [] });
    expect(extractCues('[fart] Uzr.').cue).toEqual({ actions: [] });
    expect(extractCues('[burps] Pardon.').cue).toEqual({ actions: [] });
    const f = extractCues('[fuck] Bu fignya.');
    expect(f.cue).toEqual({ actions: [] });
    expect(f.clean).not.toContain('[fuck]');
    expect(speechText('[boundaries] Chegaralarni belgilaymiz.', true)).toBe('Chegaralarni belgilaymiz.');
  });
});

describe('noto\'g\'ri yozilgan belgilar', () => {
  it('bitta qavsli belgilar ham ishlaydi va ko\'rinmaydi', () => {
    const r = extractCues("Jonim, xuddi [img:Samarqand] Registondagi [do:flip] mushukdek.");
    expect(r.cue.image).toBe('Samarqand');
    expect(r.cue.actions).toEqual([]);
    expect(r.clean).not.toMatch(/\[/);
    const segs = parseRichAns('Salom, mening [[fr]mon chéri[/fr]] sho\'xginam!');
    expect(segs.find((x) => x.kind === 'fr')?.text).toBe('mon chéri');
    expect(segs.map((x) => x.text).join('')).not.toContain('[');
  });
});

describe('yopuvchi ovoz teglari', () => {
  it('[/sarcastic] ko\'rinmaydi', () => {
    expect(displayText('[sarcastic] Machine à thé[/sarcastic]?! Blin.')).toBe('Machine à thé?! Blin.');
  });
});


describe('Task 7 text-only TTS cascade', () => {
  it('does not fall back to local speech when the configured TTS request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })));
    vi.stubGlobal('speechSynthesis', { getVoices: () => [], speak: vi.fn(), cancel: vi.fn() });
    vi.stubGlobal('SpeechSynthesisUtterance', class { onend: (() => void) | null = null; onerror: (() => void) | null = null; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const queue = new TtsQueue('elevenlabs');
    const speak = vi.mocked(speechSynthesis.speak);
    try {
      queue.push('Bonjour !');
      queue.end();
      await vi.waitFor(() => expect(queue.busy).toBe(false));
      expect(speak).not.toHaveBeenCalled();
    } finally {
      queue.dispose();
      vi.unstubAllGlobals();
    }
  });

  it('supports an explicit text-only engine without invoking browser speech or the TTS endpoint', async () => {
    const fetchMock = vi.fn();
    const speak = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('speechSynthesis', { getVoices: () => [], speak, cancel: vi.fn() });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const queue = new TtsQueue('text' as never);
    try {
      queue.push('J’explique en ouzbek.');
      queue.end();
      await vi.waitFor(() => expect(queue.busy).toBe(false));
      expect(fetchMock).not.toHaveBeenCalled();
      expect(speak).not.toHaveBeenCalled();
    } finally {
      queue.dispose();
      vi.unstubAllGlobals();
    }
  });
});


describe('Task 7 TTS fallback must remain text-only', () => {
  const installBrowserVoice = () => {
    const speak = vi.fn((utterance: { onend?: (() => void) | null }) => {
      queueMicrotask(() => utterance.onend?.());
    });
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [{ lang: 'uz-UZ', name: 'Natural' }],
      speak,
      cancel: vi.fn(),
    });
    vi.stubGlobal('SpeechSynthesisUtterance', class {
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      onboundary: (() => void) | null = null;
      lang = '';
      voice: unknown;
      rate = 1;
      constructor(readonly text: string) {}
    });
    return speak;
  };

  it('does not speak locally after a failed configured TTS request', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const speak = installBrowserVoice();
    const queue = new TtsQueue('elevenlabs');
    try {
      queue.push('Bonjour !');
      queue.end();
      await vi.waitFor(() => expect(queue.busy).toBe(false));
      expect(speak).not.toHaveBeenCalled();
    } finally {
      queue.dispose();
      vi.unstubAllGlobals();
    }
  });

  it('keeps an unverified text-only engine silent and does not request audio', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const speak = installBrowserVoice();
    const queue = new TtsQueue('text' as never);
    try {
      queue.push('J’explique en ouzbek.');
      queue.end();
      await vi.waitFor(() => expect(queue.busy).toBe(false));
      expect(fetchMock).not.toHaveBeenCalled();
      expect(speak).not.toHaveBeenCalled();
    } finally {
      queue.dispose();
      vi.unstubAllGlobals();
    }
  });
});


describe('Task 8 legacy marker safety', () => {
  it('does not turn shape, unsafe action, or sound-effect markers into mascot commands', () => {
    const result = extractCues('[[shape:heart]] [[do:flip]] [spit] [punch] [slap] [fart] [burp] Salom.');
    expect(result.cue).toEqual({ actions: [] });
    expect(result.clean.trim()).toBe('Salom.');
  });

  it('still permits a safe legacy action without any shape or sound side effect', () => {
    expect(extractCues('[[do:wave]] Salom.').cue).toEqual({ actions: ['wave'] });
  });

  it('removes bare unsafe and sound commands instead of exposing or executing them', () => {
    const result = extractCues('[flip] [angry] [sfx:bell] [sound:meow] [[shape:cat]] Oddiy matn.');
    expect(result.cue).toEqual({ actions: [] });
    expect(result.clean.trim()).toBe('Oddiy matn.');
    expect(speechText('[flip] [angry] [sfx:bell] Oddiy matn.', true)).toBe('Oddiy matn.');
  });

  it.each([
    ['soundeffect', '[soundeffect:meow]'],
    ['sound-effect', '[sound-effect:meow]'],
    ['sound_effect', '[sound_effect:meow]'],
    ['double bracket', '[[soundeffect:meow]]'],
    ['unclosed soundeffect', '[soundeffect:meow'],
    ['unclosed sound-effect', '[sound-effect:meow'],
    ['unclosed sound_effect', '[sound_effect:meow'],
    ['malformed double bracket', '[[soundeffect:meow]'],
    ['unclosed marker with later bracketed safe text', '[soundeffect:meow Safe text [safe] after.'],
    ['malformed double bracket with later bracketed safe text', '[[soundeffect:meow Safe text [safe] after.'],
  ])('strips %s command markers from display and speech text', (_label, marker) => {
    const source = `${marker} Safe text.`;
    expect(extractCues(source).clean.toLowerCase()).not.toMatch(/sound(?:[-_ ]?effect)/);
    expect(displayText(source).toLowerCase()).not.toMatch(/sound(?:[-_ ]?effect)/);
    expect(speechText(source, true).toLowerCase()).not.toMatch(/sound(?:[-_ ]?effect)/);
    if (_label.includes('unclosed') || _label.includes('malformed')) {
      const expected = _label.includes('later bracketed') ? 'Safe text [safe] after. Safe text.' : 'Safe text.';
      expect(extractCues(source).clean.trim()).toBe(expected);
      expect(speechText(source, true)).toBe(expected);
    }
  });
});
