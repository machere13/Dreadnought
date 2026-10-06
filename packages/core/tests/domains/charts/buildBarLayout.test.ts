import { expect, it } from 'vitest';
import * as core from '../../../src/index.ts';

it('validates non-enumerable own values instead of generating nonfinite geometry', () => {
  const values = Object.defineProperty({}, 'one', { value: NaN });
  expect(() => core.buildBarLayout({ ...options, series: [{ id: 'a', label: 'A', values }] })).toThrow(TypeError);
});

const options = { categories: [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }],
  series: [{ id: 'a', label: 'A', values: { one: 10, two: -10 } }, { id: 'b', label: 'B', values: { one: 0, two: null } }],
  domain: [-20, 20] as const, width: 200, height: 100, gapRatio: 0 };
it('builds grouped rectangles on either side of zero without changing data', () => {
  expect(core).toHaveProperty('buildBarLayout');
  const layout = core.buildBarLayout(options);
  expect(layout.baseline).toBe(50);
  expect(layout.bars.map(({ x, y, width, height, value }) => [x, y, width, height, value])).toEqual([
    [0, 25, 50, 25, 10], [50, 50, 50, 0, 0], [100, 50, 50, 25, -10],
  ]);
  expect(options.series[0].values).toEqual({ one: 10, two: -10 });
});
it('transposes the geometry for horizontal bars', () => {
  const layout = core.buildBarLayout({ ...options, orientation: 'horizontal' });
  expect(layout.baseline).toBe(100);
  expect(layout.bars.map(({ x, y, width, height }) => [x, y, width, height])).toEqual([
    [100, 0, 50, 25], [100, 25, 0, 25], [50, 50, 50, 25],
  ]);
});
it('preserves empty categories and skips missing and null values', () => {
  expect(core.buildBarLayout({ ...options, series: [] }).bars).toEqual([]);
  expect(core.buildBarLayout({ ...options, categories: [], series: [] }).categories).toEqual([]);
  expect(core.buildBarLayout({ ...options, series: [{ id: 'a', label: 'A', values: { one: null } }] }).bars).toEqual([]);
});
it('rejects ambiguous identities, unknown categories, invalid values and nonzero baselines', () => {
  expect(() => core.buildBarLayout({ ...options, domain: [1, 20] })).toThrow(RangeError);
  expect(() => core.buildBarLayout({ ...options, domain: [0, ,] as unknown as [number, number] })).toThrow(TypeError);
  expect(() => core.buildBarLayout({ ...options, categories: [options.categories[0], options.categories[0]] })).toThrow(RangeError);
  expect(() => core.buildBarLayout({ ...options, series: [options.series[0], options.series[0]] })).toThrow(RangeError);
  for (const values of [{ unknown: 1 }, { one: 21 }]) expect(() => core.buildBarLayout({ ...options, series: [{ id: 'a', label: 'A', values }] })).toThrow(RangeError);
  expect(() => core.buildBarLayout({ ...options, series: [{ id: 'a', label: 'A', values: { one: NaN } }] })).toThrow(TypeError);
  expect(() => core.buildBarLayout({ ...options, gapRatio: 1 })).toThrow(RangeError);
  expect(() => core.buildBarLayout({ ...options, width: 0 })).toThrow(RangeError);
});
it('keeps geometry finite across extreme numeric domains', () => {
  const layout = core.buildBarLayout({ ...options, domain: [-Number.MAX_VALUE, Number.MAX_VALUE] });
  expect(layout.baseline).toBe(50);
  expect(layout.bars.every(bar => [bar.x, bar.y, bar.width, bar.height].every(Number.isFinite))).toBe(true);
});
