import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function hallmarkCssStamp(): Plugin {
  return {
    name: 'hallmark-css-stamp',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const worldsCss = fs.readFileSync(path.resolve(__dirname, 'src/styles/worlds.css'), 'utf8');
      const stampLines = worldsCss
        .split('\n')
        .filter((l) => l.startsWith('/* Hallmark') || l.startsWith(' * '))
        .join('\n');
      for (const file of Object.values(bundle)) {
        if (file.type === 'asset' && file.fileName.endsWith('.css') && typeof file.source === 'string') {
          file.source = `${stampLines}\n${file.source}`;
        }
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [hallmarkCssStamp()],
  server: {
    host: '127.0.0.1',
    port: 4173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
});
