import { describe, expect, it } from 'vitest';
import { buildDictionary, loadDictionary, searchDictionary } from './dictionary.ts';

describe('lug\'at', () => {
  const src = ['{"id":"a","word":"사과","pos":"noun","sourceGloss":"apple; apology"}', '{"id":"b","word":"사과하다","pos":"verb","sourceGloss":"to apologize"}', '{"id":"c","word":"과일","pos":"noun","sourceGloss":"fruit"}'].join('\n');
  const uz = ['{"id":"a","uz":"olma; kechirim","status":"ai_draft"}', '{"id":"b","uz":"kechirim so\'ramoq","status":"ai_draft"}', '{"id":"c","uz":"x","status":"source_only"}'].join('\n');
  const all = buildDictionary(src, uz);

  it('koreyscha so\'rov: aniq moslik birinchi, keyin boshlanishi', () => {
    expect(searchDictionary(all, '사과').items.map((e) => e.word)).toEqual(['사과', '사과하다']);
  });
  it('o\'zbekcha va inglizcha bo\'yicha qidiradi', () => {
    expect(searchDictionary(all, 'olma').items[0].word).toBe('사과');
    expect(searchDictionary(all, 'fruit').items[0].word).toBe('과일');
  });
  it('faqat manba (source_only) yozuvlarida o\'zbekcha izoh ko\'rsatilmaydi', () => {
    expect(all.find((e) => e.id === 'c')!.uz).toBe('');
  });
  it('turkum bo\'yicha filtr va sahifalash', () => {
    expect(searchDictionary(all, '', 1, 'verb').total).toBe(1);
    expect(searchDictionary(all, '', 99).page).toBe(1);
  });
  it('haqiqiy lug\'at: 30 000 noyob so\'z', () => {
    const real = loadDictionary();
    expect(real.length).toBe(30000);
    expect(new Set(real.map((e) => e.id)).size).toBe(30000);
    expect(searchDictionary(real, '안녕').total).toBeGreaterThan(0);
    expect(searchDictionary(real, '').items[0].word).toBe('것');
  });
});
