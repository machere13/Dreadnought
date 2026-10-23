import { expect, it } from 'vitest';
import * as charts from '../../../src/domains/charts/index.ts';

const data = [
  { id: 'start', label: 'Начало', kind: 'start', value: 100 },
  { id: 'income', label: 'Доход', kind: 'change', value: 40 },
  { id: 'subtotal', label: 'Подытог', kind: 'total' },
  { id: 'cost', label: 'Расход', kind: 'change', value: -25 },
  { id: 'total', label: 'Остаток', kind: 'total' },
] as const;

it('accumulates changes without adding or resetting subtotal steps', () => {
  const before = structuredClone(data);
  const layout = charts.buildWaterfallLayout({ data, width: 500, height: 280 });
  expect(layout.domain).toEqual([0, 140]);
  expect(layout.total).toBe(115);
  expect(layout.steps.map(({ from, to, before, after }) => [from, to, before, after])).toEqual([
    [0, 100, 0, 100],
    [100, 140, 100, 140],
    [0, 140, 140, 140],
    [140, 115, 140, 115],
    [0, 115, 115, 115],
  ]);
  expect(layout.steps[1]).toMatchObject({ x: 120, y: 0, width: 60, height: 80, tone: 'positive' });
  expect(layout.steps[3]).toMatchObject({ y: 0, tone: 'negative' });
  expect(layout.steps[3].height).toBeCloseTo(50);
  expect(layout.steps[2].tone).toBe('total');
  expect(data).toEqual(before);
});

it('draws changes across zero and totals from zero even when negative', () => {
  const layout = charts.buildWaterfallLayout({
    data: [
      { id: 'a', label: 'A', kind: 'change', value: -20 },
      { id: 'b', label: 'B', kind: 'change', value: 30 },
      { id: 'c', label: 'C', kind: 'total' },
    ],
    height: 300,
  });
  expect(layout.domain).toEqual([-20, 10]);
  expect(layout.baseline).toBeCloseTo(100);
  expect(layout.steps[1]).toMatchObject({ from: -20, to: 10, y: 0, height: 300 });
  expect(layout.steps[2].height).toBeCloseTo(100);
});

it('keeps zero steps at zero height and empty layouts finite', () => {
  const empty = charts.buildWaterfallLayout({ data: [] });
  expect(empty.domain).toEqual([0, 1]);
  expect(empty.steps).toEqual([]);
  const zero = charts.buildWaterfallLayout({
    data: [{ id: 'a', label: 'A', kind: 'change', value: 0 }],
  });
  expect(zero.steps[0]).toMatchObject({ height: 0, tone: 'neutral', value: 0 });
});

it('rejects invalid steps, repeated starts and overflowing accumulations', () => {
  for (const invalid of [
    [{ id: 'a', label: 'A', kind: 'change', value: NaN }],
    [{ id: 'a', label: 'A', kind: 'total', value: 20 }],
    [{ id: 'a', label: 'A', kind: 'unknown', value: 20 }],
    [{ id: '', label: 'A', kind: 'change', value: 0 }],
    [data[0], data[0]],
    [data[1], data[0]],
    Array(1),
    [
      { ...data[0], value: Number.MAX_VALUE },
      { ...data[1], value: Number.MAX_VALUE },
    ],
  ])
    expect(() => charts.buildWaterfallLayout({ data: invalid as any })).toThrow();
  expect(() => charts.buildWaterfallLayout({ data, domain: [0, 110] })).toThrow();
  expect(() => charts.buildWaterfallLayout({ data, width: 0 })).toThrow();
  expect(() => charts.buildWaterfallLayout({ data, domain: [10, 200] })).toThrow();
});

it('uses explicit domains and finite coordinates at extreme magnitudes', () => {
  const layout = charts.buildWaterfallLayout({
    data: [
      { id: 'a', label: 'A', kind: 'start', value: -Number.MAX_VALUE },
      { id: 'b', label: 'B', kind: 'change', value: Number.MAX_VALUE },
    ],
    domain: [-Number.MAX_VALUE, Number.MAX_VALUE],
  });
  expect(layout.baseline).toBe(50);
  expect(layout.steps[0].height).toBe(50);
  expect(layout.steps[1].height).toBe(50);
  expect(layout.ticks.every((tick) => Number.isFinite(tick.position))).toBe(true);
});
