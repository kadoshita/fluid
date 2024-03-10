import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

export default defineConfig({
  srcDir: 'src',
  entrypointsDir: 'entrypoints',
  manifest: {
    name: 'fluid Web Clipper',
    icons: {
      16: '/icon16.png',
      32: '/icon32.png',
      48: '/icon48.png',
      128: '/icon128.png',
      192: '/icon192.png',
      512: '/icon512.png',
    },
  },
  vite: () => ({
    plugins: [react()],
  }),
});
