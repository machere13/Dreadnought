// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'postcss';
import { expect, it } from 'vitest';

it('bounds the table filter itself and allows its contents to scroll instead of enlarging the page', () => {
  const css = parse(
    readFileSync(
      resolve('packages/ui/src/presentation/DataDisplay/Table/Table.module.css'),
      'utf8',
    ),
  );
  const declarations = new Map<string, string>();
  css.walkRules((rule) => {
    if (rule.selector === ".root [data-slot='filter-menu']") {
      rule.walkDecls((declaration) => {
        declarations.set(declaration.prop, declaration.value);
      });
    }
  });
  expect(declarations.get('box-sizing')).toBe('border-box');
  expect(declarations.get('min-width')).toBe('0');
  expect(declarations.get('width')).toBe('max-content');
  expect(declarations.get('max-width')).toBe('100vw');
  expect(declarations.get('max-height')).toBe('100dvh');
  expect(declarations.get('overflow')).toBe('auto');
  expect(declarations.get('grid-template-columns')).toBe('minmax(0, 1fr)');
});
