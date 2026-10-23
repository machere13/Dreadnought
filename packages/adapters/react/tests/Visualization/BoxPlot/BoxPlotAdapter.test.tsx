import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const data = [
  { id: 'a', label: 'Команда A', values: [1, 2, 3, 4, 5, 6, 7, 100, 100] },
  { id: 'b', label: 'Команда B', values: [5, 5, 5] },
  { id: 'c', label: 'Без измерений', values: [] },
];

it('exposes quartiles and exact outliers in tooltip and table with keyboard navigation', () => {
  render(<adapters.BoxPlotAdapter label="Сроки" data={data} />);
  const images = screen.getAllByRole('img');
  expect(images).toHaveLength(2);
  act(() => images[0].focus());
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.textContent).toContain('Медиана5');
  expect(tooltip.textContent).toContain('Q13');
  expect(tooltip.textContent).toContain('Q37');
  expect(tooltip.textContent).toContain('100 × 2');
  expect(tooltip.querySelector('[data-ui="mark"]')).toBeTruthy();
  fireEvent.keyDown(images[0], { key: 'ArrowDown' });
  expect(document.activeElement).toBe(images[1]);
  fireEvent.keyDown(images[1], { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Сроки: Статистика' });
  expect(within(table).getByText('100 × 2')).toBeTruthy();
  const empty = within(table).getByRole('row', { name: /Без измерений/ });
  expect(empty.textContent).toContain('Нет данных');
});

it('does not reopen a hovered old group after keyboard focus has moved', () => {
  vi.useFakeTimers();
  render(<adapters.BoxPlotAdapter label="Сроки" data={data} />);
  const images = screen.getAllByRole('img');
  fireEvent.pointerEnter(images[0]);
  act(() => images[0].focus());
  fireEvent.keyDown(images[0], { key: 'ArrowDown' });
  act(() => vi.advanceTimersByTime(150));
  expect(screen.getByRole('tooltip').textContent).toContain('Команда B');
  expect(screen.getByRole('tooltip').textContent).not.toContain('Команда A');
});

it('pages both plot and table and removes stale tooltips when data changes', () => {
  const { rerender } = render(<adapters.BoxPlotAdapter label="Сроки" data={data} pageSize={1} />);
  act(() => screen.getByRole('img').focus());
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Команда B');
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Предыдущая страница данных' }));
  expect(screen.queryByRole('tooltip')).toBeNull();
  rerender(<adapters.BoxPlotAdapter label="Сроки" data={[]} pageSize={1} />);
  expect(screen.queryAllByRole('img')).toHaveLength(0);
  expect(screen.getByText('Нет данных')).toBeTruthy();
});
