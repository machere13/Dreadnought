import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve as absolute } from 'node:path';
import { createRequire } from 'node:module';

const postcss = createRequire(absolute('packages/ui/package.json'))('postcss');

const root = absolute('packages/themes/src/default/tokens');
const tokens = new Map();
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.tokens.css')) {
      postcss.parse(readFileSync(path, 'utf8')).walkRules((rule) => {
        if (rule.selector !== ':root') return;
        rule.walkDecls((declaration) => {
          tokens.set(declaration.prop, {
            css: declaration.prop,
            raw: declaration.value,
            source: relative(root, path).replaceAll('\\', '/'),
          });
        });
      });
    }
  }
}
walk(root);
function resolve(css, trail = []) {
  if (trail.includes(css)) throw new Error(`Circular token: ${css}`);
  const token = tokens.get(css);
  if (!token) throw new Error(`Missing token: ${css}`);
  const alias = token.raw.match(/^var\((--[\w-]+)\)$/)?.[1];
  if (alias) return { ...resolve(alias, [...trail, css]), alias };
  const color = token.raw.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)%\)$/);
  if (color)
    return {
      type: 'COLOR',
      value: { r: +color[1] / 255, g: +color[2] / 255, b: +color[3] / 255, a: +color[4] / 100 },
    };
  if (token.raw === 'transparent') return { type: 'COLOR', value: { r: 0, g: 0, b: 0, a: 0 } };
  const number = token.raw.match(/^(-?[\d.]+)(px|rem)?$/);
  if (number) return { type: 'FLOAT', value: +number[1] * (number[2] === 'rem' ? 16 : 1) };
  return { type: 'STRING', value: token.raw.replace(/\s+/g, ' ') };
}
function scope(css, type) {
  if (type === 'COLOR') {
    if (/text|foreground|-(fg)(-|$)/.test(css)) return ['TEXT_FILL'];
    if (/border|focus|stroke/.test(css)) return ['STROKE_COLOR'];
    return ['FRAME_FILL', 'SHAPE_FILL'];
  }
  if (type === 'STRING') return [];
  if (/font-size/.test(css)) return ['FONT_SIZE'];
  if (/font-weight/.test(css)) return ['FONT_WEIGHT'];
  if (/line-height/.test(css)) return [];
  if (/opacity/.test(css)) return ['OPACITY'];
  if (/radius/.test(css)) return ['CORNER_RADIUS'];
  if (/padding|gap|spacing|offset/.test(css)) return ['GAP'];
  if (/border-width|focus-width/.test(css)) return ['STROKE_FLOAT'];
  if (/size|width|height/.test(css)) return ['WIDTH_HEIGHT'];
  return [];
}
const exported = [...tokens.values()].map((token) => {
  const resolved = resolve(token.css);
  const parts = token.source.split('/');
  const group = parts[0] === 'global' ? 'Global' : `Components / ${parts[1]}`;
  const name =
    parts[0] === 'global'
      ? `${parts[1].split('.')[0]}/${token.css.replace('--dreadnought-', '')}`
      : `${parts[2]}/${token.css.replace('--dreadnought-', '')}`;
  return { ...token, ...resolved, group, name, scopes: scope(token.css, resolved.type) };
});
const styles = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'body-1',
  'body-2',
  'body-3',
  'label-1',
  'label-2',
  'caption-1',
  'caption-2',
].map((role) => ({
  role,
  size: resolve(`--dreadnought-font-size-${role}`).value,
  weight: resolve(`--dreadnought-font-weight-${role}`).value,
  lineHeight: resolve(`--dreadnought-line-height-${role}`).value * 100,
}));
export const data = { tokens: exported, styles };
