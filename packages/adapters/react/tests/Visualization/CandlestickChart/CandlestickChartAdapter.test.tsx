import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import * as adapters from '../../../src/unstyled.ts';

afterEach(cleanup);
const data = [
  { id: 'a', label: 'Понедельник', open: 100, close: 110, low: 90, high: 120 },
  { id: 'b', label: 'Вторник', open: 110, close: 100, low: 80, high: 115 },
  { id: 'c', label: 'Среда', open: 105, close: 105, low: 100, high: 200 },
];

it('exposes all four prices, trend and keyboard tooltips, including a doji', () => {
  const { container } = render(<adapters.CandlestickChartAdapter data={data} label="Котировки" />);
  const candles = screen.getAllByRole('img');
  const wicks = candles[0].querySelectorAll('svg > line');
  expect(wicks).toHaveLength(2);
  expect(Number(wicks[0].getAttribute('y2'))).toBeCloseTo(75);
  expect(Number(wicks[1].getAttribute('y1'))).toBeCloseTo(83.3333333333);
  act(() => candles[0].focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Открытие100');
  expect(screen.getByRole('tooltip').textContent).toContain('Максимум120');
  fireEvent.keyDown(candles[0], { key: 'ArrowRight' });
  expect(document.activeElement).toBe(candles[1]);
  fireEvent.keyDown(candles[1], { key: 'End' });
  expect(document.activeElement).toBe(candles[2]);
  expect(screen.getByRole('tooltip').textContent).toContain('Без изменений');
  expect(container.querySelector('[data-ui="candlestick-doji"]')).toBeTruthy();
  fireEvent.keyDown(candles[2], { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(
    within(screen.getByRole('table', { name: 'Котировки: Данные' })).getByRole('row', {
      name: 'Вторник 110 115 80 100 Падение',
    }),
  ).toBeTruthy();
});

it('pages chart and table together without changing the full-series scale', () => {
  const { container } = render(
    <adapters.CandlestickChartAdapter data={data} label="Котировки" pageSize={2} />,
  );
  const ticks = [...container.querySelectorAll('[data-ui="candlestick-axis"] span')].map(
    (e) => e.textContent,
  );
  expect(ticks).toContain('200');
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(screen.getAllByRole('img')).toHaveLength(1);
  expect(screen.getByRole('img').getAttribute('aria-label')).toContain('Среда');
  expect(
    [...container.querySelectorAll('[data-ui="candlestick-axis"] span')].map((e) => e.textContent),
  ).toEqual(ticks);
  expect(
    Number(container.querySelector('[data-ui="candlestick-body"]')?.getAttribute('y')),
  ).toBeCloseTo(79.1666666667);
  expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2);
});

it('bounds the visible long series and clears obsolete page and tooltip on replacement', () => {
  const many = Array.from({ length: 10000 }, (_, index) => ({
    ...data[0],
    id: `${index}`,
    label: `Период ${index + 1}`,
  }));
  const { rerender } = render(
    <adapters.CandlestickChartAdapter data={many} label="Ряд" pageSize={20} />,
  );
  expect(screen.getAllByRole('img')).toHaveLength(20);
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Страница данных' }), {
    target: { value: '500' },
  });
  act(() => screen.getAllByRole('img')[0].focus());
  expect(screen.getByRole('tooltip').textContent).toContain('Период 9981');
  rerender(<adapters.CandlestickChartAdapter data={[]} label="Ряд" />);
  expect(screen.queryByRole('tooltip')).toBeNull();
  expect(screen.queryByRole('navigation', { name: 'Страницы данных' })).toBeNull();
  expect(screen.getByText('Нет данных')).toBeTruthy();
});

it('honors consumer cancellation and rejects delayed hover from an older candle', () => {
  vi.useFakeTimers();
  try {
    const { rerender } = render(<adapters.CandlestickChartAdapter data={data} label="Ряд" />);
    const candles = screen.getAllByRole('img');
    fireEvent.pointerEnter(candles[0], { pointerType: 'mouse' });
    act(() => candles[1].focus());
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
    expect(screen.getByRole('tooltip').textContent).toContain('Вторник');
    rerender(
      <adapters.CandlestickChartAdapter
        data={data}
        label="Ряд"
        slotProps={{ candle: () => ({ onKeyDown: (e) => e.preventDefault() }) }}
      />,
    );
    fireEvent.keyDown(candles[1], { key: 'End' });
    expect(document.activeElement).toBe(candles[1]);
  } finally {
    vi.useRealTimers();
  }
});
