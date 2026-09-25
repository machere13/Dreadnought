import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const artifact = (name) => readFileSync(fileURLToPath(new URL(`../../dist/${name}`, import.meta.url)), 'utf8');
const js = artifact('index.js');
const css = artifact('style.css');
const types = artifact('index.d.ts');

assert.match(js, /import\s+['"]\.\/style\.css['"]/);
assert.doesNotMatch(js, /\bReact\.createElement\b/);
assert.match(js, /react\/jsx-runtime/);
assert.match(css, /--dreadnought-button-bg/);
assert.match(css, /--dreadnought-input-bg/);
assert.match(css, /border:var\(--dreadnought-button-border-width\)/);
assert.match(css, /text-decoration:var\(--dreadnought-button-text-decoration\)/);
assert.match(css, /box-shadow:var\(--dreadnought-button-shadow\)/);
assert.match(css, /width:var\(--dreadnought-button-icon-size\)/);
assert.match(css, /--dreadnought-button-spinner-timing/);
assert.match(css, /--dreadnought-button-spinner-iteration-count/);
assert.match(css, /--dreadnought-button-spinner-rotation/);
assert.match(types, /Button/);
assert.match(types, /Input/);
