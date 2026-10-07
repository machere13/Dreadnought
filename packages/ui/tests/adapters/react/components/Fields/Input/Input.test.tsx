import { cleanup, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { Input } from '@dreadnought/ui/react';

afterEach(cleanup);

it('renders compact library Buttons for numerical steps', async () => {
  render(<Input type="number" aria-label="Quantity" defaultValue="1" stepButtonLabels={{ decrease: 'Уменьшить', increase: 'Увеличить' }} />);
  const increase = screen.getByRole('button', { name: 'Увеличить' });
  expect(increase.classList.contains('dreadnought-text-button')).toBe(true);
  expect(increase.getAttribute('data-size')).toBe('compact');
  await userEvent.click(increase);
  expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('2');
});

it('covers autofilled control without clipping its text background', () => {
  const css = postcss.parse(readFileSync(resolve('packages/ui/src/presentation/Fields/Input/Input.module.css'), 'utf8'));
  const layer = css.nodes.find((node) => node.type === 'atrule');
  const autofill = layer?.nodes?.find((node) => node.type === 'rule' && node.selector.includes('[data-slot="control"]:-webkit-autofill'));
  expect(autofill?.nodes?.some((node) => node.type === 'decl' && node.prop === 'background-clip')).toBe(false);
  expect(autofill?.nodes?.some((node) => node.type === 'decl' && node.prop === 'box-shadow' && node.value === 'inset 0 0 0 100vmax var(--dreadnought-input-bg)')).toBe(true);
  expect(autofill?.nodes?.some((node) => node.type === 'decl' && node.prop === '-webkit-text-fill-color' && node.value === 'var(--dreadnought-input-text)')).toBe(true);
});

it('composes styled and consumer classes while preserving adapter semantics', () => {
  render(<Input aria-label="Search" type="search" invalid className="custom" />);
  const input = screen.getByRole('searchbox', { name: 'Search' });
  expect(input.parentElement?.classList.contains('custom')).toBe(true);
  expect(input.parentElement?.classList.contains('dreadnought-text-input')).toBe(true);
  expect(input.getAttribute('aria-invalid')).toBe('true');
});

it('uses eye icons for password visibility without visible button text', async () => {
  const user = userEvent.setup();
  render(<Input type="password" aria-label="Password" passwordVisibilityLabels={{ show: 'Показать пароль', hide: 'Скрыть пароль' }} />);
  const show = screen.getByRole('button', { name: 'Показать пароль' });
  expect(show.querySelector('svg')).not.toBeNull();
  expect(show.textContent).toBe('');
  await user.click(show);
  expect(screen.getByRole('button', { name: 'Скрыть пароль' }).querySelector('svg')).not.toBeNull();
});
