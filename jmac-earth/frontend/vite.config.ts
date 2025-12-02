import { randomFillSync } from 'crypto';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  (globalThis as any).crypto = {
    getRandomValues: (arr: Uint8Array) => {
      randomFillSync(arr);
      return arr;
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@hooks', replacement: path.resolve(__dirname, 'src/hooks') },
      { find: '@pages', replacement: path.resolve(__dirname, 'src/pages') },
      { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
      { find: '@app/types', replacement: path.resolve(__dirname, 'src/types/index.ts') },
      { find: '@app/types/*', replacement: path.resolve(__dirname, 'src/types/*') }
    ]
  }
});
