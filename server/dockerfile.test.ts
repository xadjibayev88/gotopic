// Server ilova kodidan (../src/...) runtime import qilgan har bir fayl Docker image'ga ko'chirilishi shart,
// aks holda Railway'da server ERR_MODULE_NOT_FOUND bilan yiqiladi.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');

describe('Dockerfile', () => {
  it('copies every app file the server imports at runtime', () => {
    const docker = readFileSync(join(root, 'Dockerfile'), 'utf8');
    const copied = [...docker.matchAll(/^COPY --from=build \/app\/(\S+)/gm)].map((m) => m[1]);
    const needed = new Set<string>();
    for (const f of readdirSync(join(root, 'server'))) {
      if (!f.endsWith('.ts') || f.endsWith('.test.ts')) continue;
      const src = readFileSync(join(root, 'server', f), 'utf8');
      // `import type` yo'qoladi — faqat haqiqiy importlar.
      for (const m of src.matchAll(/^import (?!type )[^;]*?from '\.\.\/(src\/[^']+)'/gm)) needed.add(m[1]);
    }
    expect(needed.size).toBeGreaterThan(0);
    for (const n of needed) expect(copied.some((c) => n === c || n.startsWith(`${c}/`)), `${n} Dockerfile'da yo'q`).toBe(true);
  });
});
