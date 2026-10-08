import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { afterEach, expect, it } from 'vitest';
import { TextArea } from '@dreadnought/ui/react';

afterEach(cleanup);

it('focuses with one border and keeps the error border while focused', () => {
  const css = postcss.parse(
    readFileSync(
      resolve('packages/ui/src/presentation/Fields/TextArea/TextArea.module.css'),
      'utf8',
    ),
  );
  const focusRules = css.nodes
    .flatMap((node) => (node.type === 'atrule' ? (node.nodes ?? []) : []))
    .filter((node) => node.type === 'rule' && node.selector.includes(':focus-visible'));
  expect(
    focusRules.some((rule) =>
      rule.nodes.some(
        (node) => node.type === 'decl' && node.prop === 'outline' && node.value === 'none',
      ),
    ),
  ).toBe(true);
  const normalFocus = focusRules.find((rule) =>
    rule.selector.replaceAll("'", '"').includes(':not([aria-invalid="true"])'),
  );
  expect(
    normalFocus?.nodes.some((node) => node.type === 'decl' && node.prop === 'border-color'),
  ).toBe(true);
});

it('adds local styling without changing adapter semantics', () => {
  render(<TextArea aria-label="Notes" invalid className="custom" rows={3} />);
  const area = screen.getByRole('textbox', { name: 'Notes' });
  expect(area.classList.contains('custom')).toBe(true);
  expect(area.classList.contains('dreadnought-text-text-area')).toBe(true);
  expect(area.getAttribute('aria-invalid')).toBe('true');
  expect(area.getAttribute('rows')).toBe('3');
});

it('passes manual resize limits to the styled field without leaking custom props to DOM', () => {
  render(<TextArea aria-label="Notes" rows={4} minRows={2} maxRows={6} />);
  const area = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
  expect(area.getAttribute('rows')).toBe('4');
  expect(area.style.getPropertyValue('--dreadnought-text-area-min-rows')).toBe('2');
  expect(area.style.getPropertyValue('--dreadnought-text-area-max-rows')).toBe('6');
  expect(area.hasAttribute('data-min-rows')).toBe(true);
  expect(area.hasAttribute('data-max-rows')).toBe(true);
  expect(area.hasAttribute('minRows')).toBe(false);
});
