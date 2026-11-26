#!/usr/bin/env python3
"""legacy/public/catalog.json dagi grammatika (GRAM), o'qish (READ) va tinglash (LISTEN) mashqlarini
src/data/topik.ts ga o'tkazadi. Savollarda birinchi variant — to'g'ri javob (ilova o'zi aralashtiradi)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, 'legacy', 'public', 'catalog.json')))['data']
gram = [{'q': g[0], 'a': g[1], 'options': g[2], 'why': g[3], 'cat': g[4]} for g in d['GRAM']]
def texts(items):
    return [{'title': t['title'], 'lines': [{'who': l[0], 'ko': l[1]} for l in t['lines']], 'uz': t['uz'], 'qs': [{'q': q[0], 'options': q[1]} for q in t['qs']]} for t in items]
out = '''// TOPIK uslubidagi mashqlar (eski Go Topic katalogidan). AVTOMATIK: python3 scripts/build-topik-data.py
// Rasmiy TOPIK savollari emas — mualliflik mashqlari. Savollarda birinchi variant to'g'ri javob.

export interface GramItem { q: string; a: string; options: string[]; why: string; cat: string }
export interface TextQ { q: string; options: string[] }
export interface TopikText { title: string; lines: { who: number; ko: string }[]; uz: string; qs: TextQ[] }

export const GRAM_CATS: string[] = ''' + json.dumps([c for c in d['GCATS'] if c != 'Hammasi'], ensure_ascii=False) + ''';
export const GRAMMAR: GramItem[] = ''' + json.dumps(gram, ensure_ascii=False, indent=1) + ''';
export const READING: TopikText[] = ''' + json.dumps(texts(d['READ']), ensure_ascii=False, indent=1) + ''';
export const LISTENING: TopikText[] = ''' + json.dumps(texts(d['LISTEN']), ensure_ascii=False, indent=1) + ''';
'''
open(os.path.join(ROOT, 'src', 'data', 'topik.ts'), 'w').write(out)
print(len(gram), 'grammatika,', len(d['READ']), "o'qish,", len(d['LISTEN']), 'tinglash')
