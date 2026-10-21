import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { data } from './tokens.mjs';

const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite/package.json'))('esbuild');
const output = new URL('../../output/figma-plugin/', import.meta.url);
await mkdir(output, { recursive: true });
await build({
  entryPoints: [fileURLToPath(new URL('./main.js', import.meta.url))],
  outfile: fileURLToPath(new URL('code.js', output)),
  bundle: true,
  format: 'iife',
  target: 'es2017',
  define: { __TOKENS__: JSON.stringify(data) },
  legalComments: 'none',
});
await writeFile(new URL('ui.html', output), await readFile(new URL('./ui.html', import.meta.url)));
await writeFile(
  new URL('README.md', output),
  await readFile(new URL('./README.md', import.meta.url)),
);
await writeFile(
  new URL('manifest.json', output),
  JSON.stringify(
    {
      name: 'Dreadnought — Local Sync',
      id: 'dreadnought-local-sync',
      api: '1.0.0',
      main: 'code.js',
      ui: 'ui.html',
      editorType: ['figma'],
      documentAccess: 'dynamic-page',
      networkAccess: { allowedDomains: ['none'] },
    },
    null,
    2,
  ),
);
console.log(`Figma plugin: ${fileURLToPath(new URL('manifest.json', output))}`);
console.log(`${data.tokens.length} tokens, ${data.styles.length} text styles.`);
