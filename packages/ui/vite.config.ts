import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', '@dreadnought/react/unstyled'],
    },
  },
  plugins: [{
    name: 'dreadnought-ui-css-import',
    renderChunk(code, chunk) {
      if (chunk.isEntry) return `import './style.css';\n${code}`;
      return null;
    },
  }],
});
