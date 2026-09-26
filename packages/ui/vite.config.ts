import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  plugins: [{
    name: 'dreadnought-react-styles',
    generateBundle(_options, bundle) {
      const reactEntry = Object.values(bundle).find((output) => output.type === 'chunk' && output.name === 'react');
      if (reactEntry?.type === 'chunk') {
        reactEntry.code = `import './style.css';\nimport '@dreadnought/themes/default.css';\n${reactEntry.code}`;
      }
    },
  }],
  build: {
    lib: {
      entry: { index: 'src/index.ts', react: 'src/react.ts' },
      formats: ['es'],
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['@dreadnought/react/unstyled', 'react', 'react/jsx-runtime'],
    },
  },
});
