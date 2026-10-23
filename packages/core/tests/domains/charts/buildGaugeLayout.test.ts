import { expect, it } from 'vitest';
import * as charts from '../../../src/domains/charts/index.ts';

const thresholds = [
  { id: 'normal', label: 'Норма', to: 60 },
  { id: 'warning', label: 'Внимание', to: 80 },
  { id: 'critical', label: 'Критично', to: 100 },
] as const;

it('maps the midpoint and limits onto a semicircle without mutating thresholds', () => {
  const input = structuredClone(thresholds);
  const layout = charts.buildGaugeLayout({ value: 50, thresholds: input });
  expect(layout.ratio).toBe(0.5);
  expect(layout.needle?.x).toBeCloseTo(0);
  expect(layout.needle?.y).toBeCloseTo(-1);
  expect(layout.segments.map((s) => [s.from, s.to])).toEqual([
    [0, 60],
    [60, 80],
    [80, 100],
  ]);
  expect(layout.activeSegmentId).toBe('normal');
  expect(charts.buildGaugeLayout({ value: 0 }).needle?.x).toBeCloseTo(-1);
  expect(charts.buildGaugeLayout({ value: 100 }).needle?.x).toBeCloseTo(1);
  expect(input).toEqual(thresholds);
});

it('assigns a boundary to the following band and includes the maximum in the last band', () => {
  expect(charts.buildGaugeLayout({ value: 60, thresholds }).activeSegmentId).toBe('warning');
  expect(charts.buildGaugeLayout({ value: 80, thresholds }).activeSegmentId).toBe('critical');
  expect(charts.buildGaugeLayout({ value: 100, thresholds }).activeSegmentId).toBe('critical');
});

it('keeps circle endpoints distinct, supports negative ranges, and represents missing data', () => {
  const first = charts.buildGaugeLayout({ value: -50, min: -50, max: 50, variant: 'circle' });
  const last = charts.buildGaugeLayout({ value: 50, min: -50, max: 50, variant: 'circle' });
  expect(first.needle?.x).toBeCloseTo(-Math.SQRT1_2);
  expect(last.needle?.x).toBeCloseTo(Math.SQRT1_2);
  expect(first.needle?.y).toBeCloseTo(Math.SQRT1_2);
  const missing = charts.buildGaugeLayout({ value: null, thresholds });
  expect(missing.needle).toBeNull();
  expect(missing.ratio).toBeNull();
  expect(missing.activeSegmentId).toBeNull();
  expect(missing.segments).toHaveLength(3);
  expect(
    charts.buildGaugeLayout({ value: 0, min: -Number.MAX_VALUE, max: Number.MAX_VALUE }).ratio,
  ).toBe(0.5);
});

it('rejects invalid values, ranges and ambiguous threshold definitions', () => {
  const invalid = [
    { value: NaN },
    { value: Infinity },
    { value: -1 },
    { value: 101 },
    { value: 0, min: 0, max: 0 },
    { value: 0, min: Infinity },
    { value: 50, variant: 'unknown' },
    { value: 50, thresholds: [{ id: 'a', label: 'A', to: 80 }] },
    { value: 50, thresholds: [{ id: 'a', label: '', to: 100 }] },
    {
      value: 50,
      thresholds: [
        { id: 'a', label: 'A', to: 60 },
        { id: 'a', label: 'B', to: 100 },
      ],
    },
    { value: 50, thresholds: [...thresholds].reverse() },
    { value: 50, thresholds: [{ id: 'a', label: 'A', to: NaN }] },
  ];
  for (const input of invalid) expect(() => charts.buildGaugeLayout(input as never)).toThrow();
});
