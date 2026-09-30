import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  vite: {
    cacheDir: process.env.NODE_ENV === 'production'
      ? 'node_modules/.vite-production'
      : 'node_modules/.vite-development',
  },
});
