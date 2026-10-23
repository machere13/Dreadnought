import { expect, it } from 'vitest';
import * as charts from '../../../src/domains/charts/index.ts';

it('assigns internal boundaries to the next bin and includes the maximum once', () => {
  const data = Object.freeze([0, 1, 2, 3, 4]);
  const result = charts.buildHistogram({ data, bins: 2, domain: [0, 4] });
  expect(result.bins).toEqual([
    { lower: 0, upper: 2, count: 2, proportion: 0.4, inclusiveUpper: false },
    { lower: 2, upper: 4, count: 3, proportion: 0.6, inclusiveUpper: true },
  ]);
  expect(result.total).toBe(5);
});

it('preserves empty intervals and negative observations', () => {
  const result = charts.buildHistogram({ data: [-4, 4], bins: 4 });
  expect(result.domain).toEqual([-4, 4]);
  expect(result.bins.map((bin) => bin.count)).toEqual([1, 0, 0, 1]);
});

it('handles empty and constant observations without a degenerate domain', () => {
  expect(charts.buildHistogram({ data: [] })).toEqual({ bins: [], total: 0, domain: null });
  const empty = charts.buildHistogram({ data: [], bins: 2, domain: [0, 10] });
  expect(empty.bins.map((bin) => [bin.count, bin.proportion])).toEqual([
    [0, 0],
    [0, 0],
  ]);
  for (const value of [0, 5, Number.MAX_VALUE, -Number.MAX_VALUE]) {
    const result = charts.buildHistogram({ data: [value, value] });
    expect(result.domain![0]).toBeLessThan(result.domain![1]);
    expect(result.bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(2);
  }
});

it('keeps finite boundaries across huge ranges and classifies decimal boundaries consistently', () => {
  const huge = charts.buildHistogram({ data: [-1e308, 0, 1e308], bins: 2 });
  expect(huge.bins.map((bin) => bin.count)).toEqual([1, 2]);
  expect(huge.bins.every((bin) => Number.isFinite(bin.lower + 0))).toBe(true);
  const decimal = charts.buildHistogram({ data: [0.1, 0.2, 0.3], bins: 3, domain: [0, 0.3] });
  expect(decimal.bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(3);
});

it('rejects invalid observations, configuration and out-of-range data', () => {
  for (const data of [[NaN], [Infinity], [null], Array(2)]) {
    expect(() => charts.buildHistogram({ data: data as number[] })).toThrow(TypeError);
  }
  for (const bins of [0, -1, 1.5, 1001, Infinity]) {
    expect(() => charts.buildHistogram({ data: [], bins })).toThrow(RangeError);
  }
  expect(() => charts.buildHistogram({ data: [11], domain: [0, 10] })).toThrow();
  expect(() => charts.buildHistogram({ data: [], domain: [1, 1] })).toThrow();
  expect(() =>
    charts.buildHistogram({ data: [1], bins: 10, domain: [1, 1 + Number.EPSILON] }),
  ).toThrow();
});

it('aggregates a large sample without expanding it into rendered observations', () => {
  const result = charts.buildHistogram({
    data: Array.from({ length: 100000 }, (_, i) => i % 100),
    bins: 10,
  });
  expect(result.bins).toHaveLength(10);
  expect(result.bins.map((bin) => bin.count)).toEqual(Array(10).fill(10000));
});
