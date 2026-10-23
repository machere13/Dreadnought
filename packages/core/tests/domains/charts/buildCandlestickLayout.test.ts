import { expect, it } from 'vitest';
import * as charts from '../../../src/domains/charts/index.ts';

const data = [
  { id: 'a', label: 'Понедельник', open: 100, close: 110, low: 90, high: 120 },
  { id: 'b', label: 'Вторник', open: 110, close: 100, low: 80, high: 115 },
  { id: 'c', label: 'Среда', open: 105, close: 105, low: 100, high: 110 },
];

it('maps OHLC to the shared scale and preserves order and input', () => {
  const input = structuredClone(data);
  const layout = charts.buildCandlestickLayout({ data: input });
  expect(layout.domain).toEqual([80, 120]);
  expect(layout.candles.map((c) => c.trend)).toEqual(['up', 'down', 'flat']);
  expect(layout.candles[0]).toMatchObject({
    openY: 50,
    closeY: 25,
    highY: 0,
    lowY: 75,
    y: 25,
    height: 25,
  });
  expect(layout.candles[1]).toMatchObject({ openY: 25, closeY: 50, highY: 12.5, lowY: 100 });
  expect(layout.candles[2]).toMatchObject({ height: 0, y: 37.5 });
  expect(input).toEqual(data);
});

it('supports empty, flat and negative series without forcing a zero baseline', () => {
  expect(charts.buildCandlestickLayout({ data: [] }).domain).toEqual([0, 1]);
  for (const value of [0, 100, -50, Number.MAX_VALUE, -Number.MAX_VALUE]) {
    const layout = charts.buildCandlestickLayout({
      data: [{ id: 'a', label: 'A', open: value, close: value, low: value, high: value }],
    });
    expect(layout.domain[0]).toBeLessThan(layout.domain[1]);
    expect(layout.candles[0].height).toBe(0);
    expect(Number.isFinite(layout.candles[0].y)).toBe(true);
  }
});

it('rejects inconsistent OHLC, IDs, nonfinite values and domains that clip data', () => {
  const invalid = [
    { data: [data[0], data[0]] },
    { data: [{ ...data[0], id: '' }] },
    { data: [{ ...data[0], label: '' }] },
    { data: [{ ...data[0], low: 101 }] },
    { data: [{ ...data[0], high: 105 }] },
    { data: [{ ...data[0], open: NaN }] },
    { data: [{ ...data[0], close: Infinity }] },
    { data, domain: [90, 120] },
    { data, domain: [120, 80] },
    { data, height: 0 },
    { data: new Array(1) },
  ];
  for (const input of invalid)
    expect(() => charts.buildCandlestickLayout(input as never)).toThrow();
});

it('keeps extreme finite ranges and a long series finite', () => {
  const extreme = charts.buildCandlestickLayout({
    data: [
      {
        id: 'a',
        label: 'A',
        open: -Number.MAX_VALUE,
        close: Number.MAX_VALUE,
        low: -Number.MAX_VALUE,
        high: Number.MAX_VALUE,
      },
    ],
  });
  expect(extreme.candles[0]).toMatchObject({ openY: 100, closeY: 0, height: 100 });
  const many = charts.buildCandlestickLayout({
    data: Array.from({ length: 10000 }, (_, index) => ({ ...data[0], id: `${index}` })),
  });
  expect(many.candles).toHaveLength(10000);
  expect(many.candles[9999].x).toBeLessThan(many.width);
});
