import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  test: {
    dir: 'test',
    mockReset: true,
    restoreMocks: true,
    globals: true,
  },
  plugins: [WxtVitest()],
});
