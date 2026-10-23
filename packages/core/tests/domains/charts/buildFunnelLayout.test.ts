import { expect, it } from 'vitest';
import * as charts from '../../../src/domains/charts/index.ts';

it('preserves stage order and computes widths and distinct conversion denominators', () => {
  const data = Object.freeze([
    Object.freeze({ id: 'visit', label: 'Визиты', value: 100 }),
    Object.freeze({ id: 'cart', label: 'Корзина', value: 40 }),
    Object.freeze({ id: 'paid', label: 'Оплата', value: 10 }),
  ]);
  const { stages } = charts.buildFunnelLayout({ data });
  expect(stages.map((stage) => stage.id)).toEqual(['visit', 'cart', 'paid']);
  expect(stages.map((stage) => stage.width)).toEqual([1, 0.4, 0.1]);
  expect(stages.map((stage) => stage.nextWidth)).toEqual([0.4, 0.1, 0.1]);
  expect(stages.map((stage) => stage.fromFirst)).toEqual([1, 0.4, 0.1]);
  expect(stages.map((stage) => stage.fromPrevious)).toEqual([null, 0.4, 0.25]);
  expect(stages.map((stage) => stage.drop)).toEqual([null, 60, 30]);
});

it('keeps zero stages without inventing conversion when the denominator is zero', () => {
  expect(charts.buildFunnelLayout({ data: [] }).stages).toEqual([]);
  const { stages } = charts.buildFunnelLayout({
    data: [100, 0, 0].map((value, index) => ({ id: String(index), label: 'Этап', value })),
  });
  expect(stages.map((stage) => stage.fromPrevious)).toEqual([null, 0, null]);
  expect(stages.map((stage) => stage.width)).toEqual([1, 0, 0]);
  const zero = charts.buildFunnelLayout({ data: [{ id: 'zero', label: 'Ноль', value: 0 }] });
  expect(zero.stages[0]).toMatchObject({ fromFirst: null, width: 0, nextWidth: 0 });
});

it('handles finite extremes without summing stage values', () => {
  for (const value of [Number.MAX_VALUE, Number.MIN_VALUE]) {
    const { stages } = charts.buildFunnelLayout({
      data: [
        { id: 'a', label: 'A', value },
        { id: 'b', label: 'B', value },
      ],
    });
    expect(stages[1]).toMatchObject({ width: 1, fromFirst: 1, fromPrevious: 1, drop: 0 });
  }
});

it('rejects increasing, negative, nonfinite and malformed stages instead of sorting or hiding them', () => {
  const stage = { id: 'a', label: 'A', value: 10 };
  const invalid = [
    [stage, { id: 'b', label: 'B', value: 11 }],
    [stage, stage],
    [{ ...stage, value: -1 }],
    [{ ...stage, value: NaN }],
    [{ ...stage, value: Infinity }],
    [{ ...stage, id: '' }],
    [{ ...stage, label: ' ' }],
    Array(2),
  ];
  for (const data of invalid) expect(() => charts.buildFunnelLayout({ data })).toThrow();
});
