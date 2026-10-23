import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/unstyled.ts';

afterEach(cleanup);
const data = [
  { id: 'a', label: 'Начало', kind: 'start', value: 100 },
  { id: 'b', label: 'Доход', kind: 'change', value: 40 },
  { id: 'c', label: 'Подытог', kind: 'total' },
  { id: 'd', label: 'Расход', kind: 'change', value: -25 },
  { id: 'e', label: 'Остаток', kind: 'total' },
] as const;

it('shows signed changes, exact subtotal values and keyboard tooltips', () => {
  render(<adapters.WaterfallChartAdapter data={data} label="Бюджет" />);
  const first = screen.getByRole('img', { name: 'Начало: 100' });
  act(() => first.focus());
  fireEvent.keyDown(first, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'Доход: +40' }));
  expect(screen.getByRole('tooltip').textContent).toContain('До шага100');
  expect(screen.getByRole('tooltip').textContent).toContain('После шага140');
  fireEvent.keyDown(document.activeElement!, { key: 'End' });
  expect(document.activeElement).toBe(screen.getByRole('img', { name: 'Остаток: 115' }));
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Бюджет: Данные' });
  expect(within(table).getByRole('row', { name: 'Подытог Итог 140 140 140' })).toBeTruthy();
});

it('paginates without recomputing totals or the vertical scale', () => {
  const { container } = render(
    <adapters.WaterfallChartAdapter data={data} label="Бюджет" pageSize={3} />,
  );
  const baseline = container.querySelector('[data-ui="waterfall-baseline"]')?.getAttribute('y1');
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(screen.getAllByRole('img')).toHaveLength(2);
  expect(screen.getByRole('img', { name: 'Расход: −25' })).toBeTruthy();
  expect(screen.getByRole('img', { name: 'Остаток: 115' })).toBeTruthy();
  const totalBar = screen
    .getByRole('img', { name: 'Остаток: 115' })
    .querySelector('[data-ui="waterfall-bar"]');
  expect(Number(totalBar?.getAttribute('y'))).toBeCloseTo(17.8571428571);
  expect(container.querySelector('[data-ui="waterfall-baseline"]')?.getAttribute('y1')).toBe(
    baseline,
  );
  expect(container.querySelectorAll('[data-ui="waterfall-connector"]')).toHaveLength(1);
});

it('keeps zero changes focusable and replaces stale data and tooltips', () => {
  const { rerender, container } = render(
    <adapters.WaterfallChartAdapter
      label="Нули"
      data={[{ id: 'zero', label: 'Без изменений', kind: 'change', value: 0 }]}
    />,
  );
  act(() => screen.getByRole('img').focus());
  expect(container.querySelector('[data-ui="waterfall-bar"]')?.getAttribute('height')).toBe('0');
  expect(screen.getByRole('tooltip')).toBeTruthy();
  rerender(<adapters.WaterfallChartAdapter label="Нули" data={[]} />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(screen.getByText('Нет данных')).toBeTruthy();
});

it('does not let an old hover timer replace the focused step tooltip', () => {
  vi.useFakeTimers();
  try {
    render(<adapters.WaterfallChartAdapter data={data} label="Бюджет" />);
    fireEvent.pointerEnter(screen.getByRole('img', { name: 'Начало: 100' }), {
      pointerType: 'mouse',
    });
    act(() => screen.getByRole('img', { name: 'Доход: +40' }).focus());
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
    expect(screen.getByRole('tooltip').textContent).toContain('Доход');
  } finally {
    vi.useRealTimers();
  }
});
