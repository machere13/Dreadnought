import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import * as adapter from '../../../src/unstyled.ts';

afterEach(cleanup);
it('keeps content mounted but inert until loading completes', () => {
  expect(adapter).toHaveProperty('LoaderAdapter');
  const { rerender } = render(
    <adapter.LoaderAdapter label="Загрузка данных">
      <button>Сохранить</button>
    </adapter.LoaderAdapter>,
  );
  expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Загрузка данных');
  expect(screen.getByText('Сохранить').parentElement?.hasAttribute('inert')).toBe(true);
  rerender(
    <adapter.LoaderAdapter loading={false}>
      <button>Сохранить</button>
    </adapter.LoaderAdapter>,
  );
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.getByRole('button').parentElement?.hasAttribute('inert')).toBe(false);
});
it('renders a standalone indicator with an accessible name and custom graphic', () => {
  expect(adapter).toHaveProperty('LoaderAdapter');
  render(<adapter.LoaderAdapter label="Подождите" indicator={<span>graphic</span>} />);
  expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Подождите');
  expect(screen.getByText('graphic').closest('[aria-hidden="true"]')).toBeTruthy();
});
