import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const artifact = (name) => readFileSync(new URL(`../dist/${name}`, import.meta.url), 'utf8');

for (const name of ['index.js', 'logic.js', 'unstyled.js']) {
  assert.doesNotMatch(artifact(name), /@dreadnought\/ui|style\.css/);
}
