import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { compile, LANGUAGES, translateText } from './index';

const dict = {
  'Darsni boshlash': 'Start lesson',
  '{0} kun {1} soat': '{0} d {1} h',
  '{0} liga': '{0} league',
  Oltin: 'Gold',
  'Siz {0} ligaga tushdingiz. Bu hafta qaytib chiqing!': 'You dropped to the {0} league. Climb back this week!',
  'Bu hafta ': 'This week ',
};
const t = compile(dict);

describe('interface translation', () => {
  it('translates exact strings and keeps surrounding spaces', () => {
    expect(translateText('Darsni boshlash', t)).toBe('Start lesson');
    expect(translateText('  Darsni   boshlash ', t)).toBe(' Start lesson ');
    expect(translateText('Bu hafta ', t)).toBe('This week ');
  });
  it('fills template placeholders, translating inner parts when known', () => {
    expect(translateText('3 kun 15 soat', t)).toBe('3 d 15 h');
    expect(translateText('Oltin liga', t)).toBe('Gold league');
    expect(translateText('Siz Oltin ligaga tushdingiz. Bu hafta qaytib chiqing!', t)).toBe('You dropped to the Gold league. Climb back this week!');
  });
  it('leaves unknown text, numbers and French alone', () => {
    expect(translateText('merci beaucoup', t)).toBeNull();
    expect(translateText('140', t)).toBeNull();
  });
  it('ships a dictionary for every non-Uzbek language with the same placeholders', () => {
    const dir = join(import.meta.dirname, 'locales');
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    for (const l of LANGUAGES.filter((x) => x.id !== 'uz')) expect(files).toContain(`${l.id}.json`);
    for (const f of files) {
      const d = JSON.parse(readFileSync(join(dir, f), 'utf8')) as Record<string, string>;
      for (const [k, v] of Object.entries(d)) {
        const need = (k.match(/\{\d+\}/g) ?? []).sort().join();
        expect((v.match(/\{\d+\}/g) ?? []).sort().join(), `${f}: ${k}`).toBe(need);
      }
    }
  });
});
