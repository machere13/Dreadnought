import {defineConfig} from 'vitest/config';
export default defineConfig({logLevel: 'error', resolve: {dedupe: ['react', 'react-dom']}, esbuild: {jsx: 'automatic'}, test: {
  include: ['benchmarks/token-comparison-v7/smoke.test.tsx'],
  server: {deps: {inline: [/@dreadnought/]}},
}});
