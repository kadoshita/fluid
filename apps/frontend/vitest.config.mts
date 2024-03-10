import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: 'test',
    globals: true,
    watch: false,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
  },
});
