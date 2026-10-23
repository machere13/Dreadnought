import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const data = [
  { id: 'visit', label: 'Визиты', value: 100 },
  { id: 'cart', label: 'Корзина', value: 40 },
  { id: 'paid', label: 'Оплата', value: 10 },
];

it('shows exact values and both conversions in accessible table and tooltip', () => {
  render(<adapters.FunnelChartAdapter label="Покупки" data={data} />);
  const stages = screen.getAllByRole('img');
  const points = stages[0].querySelector('polygon')!.getAttribute('points')!
    .split(/[ ,]/).map(Number);
  [2, 0, 98, 0, 69.2, 100, 30.8, 100].forEach((value, index) => {
    expect(points[index]).toBeCloseTo(value);
  });
  act(() => stages[0].focus());
  fireEvent.keyDown(stages[0], { key: 'End' });
  expect(document.activeElement).toBe(stages[2]);
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.textContent).toContain('От первого10%');
  expect(tooltip.textContent).toContain('От предыдущего25%');
  expect(tooltip.textContent).toContain('Потеря30');
  expect(tooltip.querySelector('[data-ui="mark"]')).toBeTruthy();
  fireEvent.keyDown(stages[2], { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Покупки: Данные' });
  expect(within(table).getByRole('row', { name: /Оплата 10 10% 25% 30/ })).toBeTruthy();
});

it('does not let a hovered old stage steal the tooltip after keyboard navigation', () => {
  vi.useFakeTimers();
  render(<adapters.FunnelChartAdapter label="Покупки" data={data} />);
  const stages = screen.getAllByRole('img');
  fireEvent.pointerEnter(stages[0]);
  act(() => stages[0].focus());
  fireEvent.keyDown(stages[0], { key: 'ArrowDown' });
  act(() => vi.advanceTimersByTime(200));
  expect(screen.getByRole('tooltip').textContent).toContain('Корзина');
  expect(screen.getByRole('tooltip').textContent).not.toContain('Визиты');
});

it('pages without resetting conversions and clears stale popups when rows disappear', () => {
  const { rerender } = render(
    <adapters.FunnelChartAdapter label="Покупки" data={data} pageSize={1} />,
  );
  act(() => screen.getByRole('img').focus());
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(screen.queryByRole('tooltip')).toBeNull();
  const table = screen.getByRole('table', { name: 'Покупки: Данные' });
  expect(within(table).getByRole('row', { name: /Корзина 40 40% 40% 60/ })).toBeTruthy();
  rerender(<adapters.FunnelChartAdapter label="Покупки" data={[]} />);
  expect(screen.queryAllByRole('img')).toHaveLength(0);
  expect(screen.getByText('Нет данных')).toBeTruthy();
});

it('keeps zero stages focusable without drawing nonzero shapes or undefined percentages', () => {
  const zero = [{ id: 'a', label: 'Первый', value: 0 }, { id: 'b', label: 'Второй', value: 0 }];
  render(<adapters.FunnelChartAdapter label="Пустой запуск" data={zero} />);
  const stages = screen.getAllByRole('img');
  expect(stages).toHaveLength(2);
  expect(stages.every((stage) => !stage.querySelector('polygon'))).toBe(true);
  act(() => stages[1].focus());
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.textContent).toContain('Количество0');
  expect(tooltip.textContent).toContain('От первого—');
  expect(tooltip.textContent).toContain('От предыдущего—');
  expect(tooltip.textContent).toContain('Потеря0');
});
