import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Har bir build'ning o'z versiyasi: ilova yangi versiyani o'zi aniqlab, yangilanadi.
const BUILD = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

export default defineConfig({
  base: './',
  define: { __BUILD__: JSON.stringify(BUILD) },
  plugins: [
    react(),
    {
      name: 'voila-version',
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build: BUILD }) });
      },
    },
  ],
  server: { proxy: { '/api': 'http://localhost:8787' } },
  test: { environment: 'node' },
} as any);
