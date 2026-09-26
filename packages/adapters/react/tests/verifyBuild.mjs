import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const artifact = (name) => readFileSync(new URL(`../dist/${name}`, import.meta.url), 'utf8');

assert.match(artifact('styled.js'), /@dreadnought\/ui\/style\.css/);
assert.match(artifact('styled.js'), /Button\/Button\.js/);

for (const name of ['index.js', 'logic.js', 'unstyled.js']) {
  assert.doesNotMatch(artifact(name), /@dreadnought\/ui|style\.css/);
}
