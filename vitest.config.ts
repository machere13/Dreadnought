import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    maxWorkers: 2,
    environment: 'jsdom',
    include: ['packages/**/tests/**/*.test.{ts,tsx}', 'apps/**/tests/**/*.test.{ts,tsx}', 'tools/**/tests/**/*.test.{ts,tsx}'],
  },
});
