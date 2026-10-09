import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildKnowledge } from './buildKnowledge.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
function node(script, args = [], cwd = root) {
  const result = spawnSync(process.execPath, [script, ...args], { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Documentation build failed: ${path.basename(script)}`);
}
node(path.join(root, 'tools/catalog/src/cli.mjs'));
node(path.join(root, 'apps/docs/scripts/catalog/generateDocData.mjs'));
node(path.join(root, 'apps/docs/node_modules/astro/bin/astro.mjs'), ['build'], path.join(root, 'apps/docs'));
buildKnowledge(root, { publicOutput: process.argv.includes('--public') });
