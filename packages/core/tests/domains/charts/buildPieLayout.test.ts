import { expect, it } from 'vitest';
import * as core from '../../../src/index.ts';

const data = Object.freeze([
  Object.freeze({ id: 'a', label: 'A', value: 30 }),
  Object.freeze({ id: 'b', label: 'B', value: 70 }),
  Object.freeze({ id: 'zero', label: 'Zero', value: 0 }),
]);

it('calculates clockwise proportions without mutating or drawing zero values', () => {
  expect(core).toHaveProperty('buildPieLayout');
  const result = core.buildPieLayout({ data, radius: 100, innerRadius: 0.6 });
  expect(result.total).toBe(100);
  expect(result.innerRadius).toBe(60);
  expect(result.slices.map((slice) => slice.id)).toEqual(['a', 'b']);
  expect(result.slices[0].share).toBeCloseTo(0.3);
  expect(result.slices[0].startAngle).toBeCloseTo(-Math.PI / 2);
  expect(result.slices[0].endAngle).toBeCloseTo(Math.PI * 0.1);
  expect(result.slices[1].endAngle).toBeCloseTo(Math.PI * 1.5);
  expect(data[0].value).toBe(30);
});

it('returns an empty layout for empty or all-zero data and a full circle for one item', () => {
  expect(core.buildPieLayout({ data: [], radius: 100 }).slices).toEqual([]);
  expect(core.buildPieLayout({ data: [data[2]], radius: 100 }).total).toBe(0);
  const result = core.buildPieLayout({ data: [data[0]], radius: 100 });
  expect(result.slices[0].share).toBe(1);
  expect(result.slices[0].endAngle - result.slices[0].startAngle).toBeCloseTo(2 * Math.PI);
});

it.each([-1, NaN, Infinity])('rejects invalid values: %s', (value) => {
  expect(() => core.buildPieLayout({ data: [{ ...data[0], value }], radius: 100 })).toThrow(
    RangeError,
  );
});

it('rejects duplicate IDs, invalid geometry and overflowing totals', () => {
  expect(() => core.buildPieLayout({ data: [data[0], data[0]], radius: 100 })).toThrow();
  for (const innerRadius of [-1, 1, NaN]) {
    expect(() => core.buildPieLayout({ data, radius: 100, innerRadius })).toThrow();
  }
  expect(() => core.buildPieLayout({ data, radius: 0 })).toThrow();
  expect(() =>
    core.buildPieLayout({
      data: data.slice(0, 2).map((item) => ({ ...item, value: Number.MAX_VALUE })),
      radius: 100,
    }),
  ).toThrow();
});
