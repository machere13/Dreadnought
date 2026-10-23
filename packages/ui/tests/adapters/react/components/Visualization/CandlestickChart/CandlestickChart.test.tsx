import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import * as ui from '@dreadnought/ui/react';
import * as adapters from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('shares the theme with explicitly composed parts and exports the context hook', () => {
  function Summary() {
    const { candles } = ui.useCandlestickChart();
    return <p>{candles.length} periods</p>;
  }
  const { container } = render(
    <ui.CandlestickChart
      data={[{ id: 'a', label: 'A', open: 1, close: 2, low: 0, high: 3 }]}
      label="Parts"
    >
      <Summary />
      <ui.CandlestickChart.Table />
      <ui.CandlestickChart.Plot height={160} />
      <ui.CandlestickChart.Pagination />
    </ui.CandlestickChart>,
  );
  expect(container.querySelector('p')?.textContent).toBe('1 periods');
  expect(container.querySelector('table')?.className).not.toBe('');
  expect(container.querySelector('[data-ui="candlestick-candle"]')?.className).not.toBe('');
  expect(container.querySelector('svg')?.getAttribute('height')).toBe('160');
});
it('themes candles while preserving custom classes and leaving the adapter unstyled', () => {
  const data = [{ id: 'a', label: 'A', open: 1, close: 2, low: 0, high: 3 }];
  const { container } = render(
    <>
      <ui.CandlestickChart
        data={data}
        label="UI"
        className="custom"
        slotProps={{ candle: () => ({ className: 'custom-candle' }) }}
      />
      <adapters.CandlestickChartAdapter data={data} label="Adapter" />
    </>,
  );
  const figures = container.querySelectorAll('figure');
  expect(figures[0].className).toContain('custom');
  const candle = figures[0].querySelector('[data-ui="candlestick-candle"]');
  expect(candle?.className).toContain('custom-candle');
  expect(candle?.className).not.toBe('custom-candle');
  expect(figures[1].className).toBe('');
  expect(figures[1].querySelector('[data-ui="candlestick-candle"]')?.className).toBe('');
});
