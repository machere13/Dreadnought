import { expect, it } from 'vitest';
import * as charts from '../../../src/domains/charts/index.ts';

const group = (values: readonly number[]) => [{ id: 'a', label: 'A', values }];

it('interpolates quartiles and keeps observed whiskers, outliers and source order', () => {
  const values = Object.freeze([100, 5, 1, 2, 3, 4, 6, 7, 100]);
  const result = charts.buildBoxPlotLayout({ data: group(values) });
  expect(result.groups[0].summary).toEqual({
    min: 1,
    q1: 3,
    median: 5,
    q3: 7,
    max: 100,
    lowerWhisker: 1,
    upperWhisker: 7,
  });
  expect(result.groups[0].outliers).toEqual([{ value: 100, count: 2, position: 1 }]);
  expect(result.groups[0].count).toBe(9);
  expect(result.domain).toEqual([1, 100]);
  expect(values[0]).toBe(100);
  expect(
    charts.buildBoxPlotLayout({ data: group([0, 10, 20, 30]) }).groups[0].summary,
  ).toMatchObject({ q1: 7.5, median: 15, q3: 22.5 });
});

it('includes observations exactly on the fences and detects low outliers', () => {
  const result = charts.buildBoxPlotLayout({ data: group([-100, -3, 0, 0, 1, 2, 2, 5]) });
  expect(result.groups[0].summary).toMatchObject({
    q1: -0.75,
    q3: 2,
    lowerWhisker: -3,
    upperWhisker: 5,
  });
  expect(result.groups[0].outliers.map((item) => item.value)).toEqual([-100]);
  const fence = charts.buildBoxPlotLayout({ data: group([-3, 0, 0, 0, 1, 2, 2, 2, 5]) });
  expect(fence.groups[0].outliers).toEqual([]);
  expect(fence.groups[0].summary).toMatchObject({ lowerWhisker: -3, upperWhisker: 5 });
});

it('preserves empty groups and represents constant and single samples without zero substitution', () => {
  const empty = charts.buildBoxPlotLayout({ data: group([]) });
  expect(empty.domain).toBeNull();
  expect(empty.groups[0]).toMatchObject({ count: 0, summary: null, positions: null, outliers: [] });
  for (const values of [[5], [5, 5, 5]]) {
    const result = charts.buildBoxPlotLayout({ data: group(values) });
    expect(result.domain).toEqual([4.5, 5.5]);
    expect(result.groups[0].positions).toEqual({
      q1: 0.5,
      median: 0.5,
      q3: 0.5,
      lowerWhisker: 0.5,
      upperWhisker: 0.5,
    });
    expect(result.groups[0].outliers).toEqual([]);
  }
});

it('keeps finite geometry for extreme finite numbers and does not clip explicit domains', () => {
  const result = charts.buildBoxPlotLayout({ data: group([-Number.MAX_VALUE, Number.MAX_VALUE]) });
  expect(result.groups[0].summary?.median).toBe(0);
  expect(Object.values(result.groups[0].positions!).every(Number.isFinite)).toBe(true);
  expect(result.ticks.every((tick) => Number.isFinite(tick.value))).toBe(true);
  expect(() => charts.buildBoxPlotLayout({ data: group([0, 100]), domain: [0, 10] })).toThrow(
    RangeError,
  );
  expect(
    charts.buildBoxPlotLayout({ data: group([5]), domain: [0, 10] }).groups[0].positions?.median,
  ).toBe(0.5);
});

it('rejects invalid observations, duplicate IDs and invalid domains', () => {
  expect(() => charts.buildBoxPlotLayout({ data: Array(1) })).toThrow(TypeError);
  for (const value of [NaN, Infinity, -Infinity, null]) {
    expect(() => charts.buildBoxPlotLayout({ data: group([value as number]) })).toThrow(TypeError);
  }
  expect(() => charts.buildBoxPlotLayout({ data: [...group([1]), ...group([2])] })).toThrow(
    RangeError,
  );
  expect(() => charts.buildBoxPlotLayout({ data: group([1]), domain: [1, 1] })).toThrow();
});

it('does not round subnormal outliers down to the zero-width interquartile range', () => {
  const result = charts.buildBoxPlotLayout({
    data: group([0, 0, 0, 0, 0, 0, 0, Number.MIN_VALUE]),
  });
  expect(result.groups[0].outliers).toEqual([{ value: Number.MIN_VALUE, count: 1, position: 1 }]);
  const constant = charts.buildBoxPlotLayout({ data: group([Number.MIN_VALUE, Number.MIN_VALUE]) });
  expect(constant.groups[0].summary?.median).toBe(Number.MIN_VALUE);
  expect(constant.groups[0].outliers).toEqual([]);
});

it('retains a finite fence when the intermediate 1.5 IQR overflows', () => {
  const m = Number.MAX_VALUE;
  const result = charts.buildBoxPlotLayout({
    data: group([-m, -m, -m, -0.8 * m, -0.7 * m, -0.5 * m, -0.3 * m, 0, m]),
  });
  expect(result.groups[0].summary?.upperWhisker).toBe(0);
  expect(result.groups[0].outliers).toEqual([{ value: m, count: 1, position: 1 }]);
});
