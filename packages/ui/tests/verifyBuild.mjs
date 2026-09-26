import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const artifact = (name) => readFileSync(fileURLToPath(new URL(`../dist/${name}`, import.meta.url)), 'utf8');
const js = artifact('index.js');
const reactJs = artifact('react.js');
const css = artifact('style.css');
const types = artifact('index.d.ts');
const reactTypes = artifact('adapters/react/index.d.ts');

const styleRules = postcss.parse(css).nodes;
assert.ok(styleRules.length > 0, 'UI CSS must contain component rules');
assert.doesNotMatch(css, /!important/, 'component styles must not depend on !important');
for (const rule of styleRules) {
  assert.equal(rule.type, 'atrule', 'component CSS must not have unlayered top-level rules');
  assert.equal(rule.name, 'layer');
  assert.equal(rule.params, 'dreadnought');
}

assert.doesNotMatch(js, /(?:react|jsx-runtime|style\.css)/i);
assert.match(reactJs, /import ['"]\.\/style\.css['"]/);
assert.match(reactJs, /import ['"]@dreadnought\/themes\/default\.css['"]/);
assert.match(js, /buttonPresentation/);
assert.match(js, /inputPresentation/);
assert.match(js, /textAreaPresentation/);
assert.match(css, /--dreadnought-button-primary-bg/);
assert.match(css, /--dreadnought-input-border-invalid/);
assert.match(css, /--dreadnought-text-area-text/);
assert.match(css, /--dreadnought-input-bg/);
assert.match(css, /--dreadnought-text-area-bg/);
assert.match(css, /min-height:calc\(var\(--dreadnought-text-area-min-rows\)/);
assert.match(css, /max-height:calc\(var\(--dreadnought-text-area-max-rows\)/);
assert.match(css, /resize:none/);
assert.match(css, /border:var\(--dreadnought-button-border-width\)/);
assert.match(css, /text-decoration:var\(--dreadnought-button-text-decoration\)/);
assert.match(css, /box-shadow:var\(--dreadnought-button-shadow\)/);
assert.match(css, /width:var\(--dreadnought-button-icon-size\)/);
assert.match(css, /--dreadnought-button-spinner-timing/);
assert.match(css, /--dreadnought-button-spinner-iteration-count/);
assert.match(css, /--dreadnought-button-spinner-rotation/);
assert.match(artifact('presentation/Button/buttonPresentation.d.ts'), /buttonPresentation/);
assert.match(artifact('presentation/Input/inputPresentation.d.ts'), /inputPresentation/);
assert.match(artifact('presentation/TextArea/textAreaPresentation.d.ts'), /textAreaPresentation/);
assert.doesNotMatch(types, /React|ButtonProps|InputProps|TextAreaProps/);
assert.match(reactTypes, /components\/index\.ts/);

const presentation = await import('../dist/index.js');
for (const name of ['buttonPresentation', 'inputPresentation', 'textAreaPresentation']) {
  assert.ok(presentation[name]?.root, `${name} must be exported from the built package`);
}
for (const name of ['Button', 'Input', 'TextArea']) {
  assert.equal(name in presentation, false, `${name} must only be exported by the React entrypoint`);
}
