import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { expect, it } from 'vitest';

function tokensFromEntry(file: string): Map<string, string> {
  const source = readFileSync(file, 'utf8');
  const tokens = new Map<string, string>();
  for (const [, relative] of source.matchAll(/@import ['"]([^'"]+)['"]/g)) {
    if (relative.startsWith('.')) {
      for (const [key, value] of tokensFromEntry(resolve(dirname(file), relative))) {
        tokens.set(key, value);
      }
    }
  }
  for (const [, key, value] of source.matchAll(/(--dreadnought-[\w-]+):\s*([^;]+);/g)) {
    tokens.set(key, value.trim());
  }
  return tokens;
}

it('resolves Toolbar defaults through the theme entry and lets a shared scale change its gap', () => {
  const tokens = tokensFromEntry(resolve('packages/themes/src/default/index.css'));
  const resolveValue = (key: string): string | undefined => {
    const value = tokens.get(key);
    const reference = value?.match(/^var\((--[\w-]+)\)$/)?.[1];
    return reference ? resolveValue(reference) : value;
  };
  expect(resolveValue('--dreadnought-toolbar-gap')).toBe('0.5rem');
  expect(resolveValue('--dreadnought-toolbar-border-width')).toBe('0px');
  expect(resolveValue('--dreadnought-toolbar-bg')).toBe('rgb(23 23 23 / 100%)');
  tokens.set('--dreadnought-spacing-x2', '1rem');
  expect(resolveValue('--dreadnought-toolbar-gap')).toBe('1rem');
});
