import { expect, it } from 'vitest';
import * as core from '../../../src/index.ts';

const options = { xDomain: [0, 10] as const, yDomain: [-10, 10] as const, width: 200, height: 100,
  series: [{ id: 'a', label: 'A', data: [{ x: 10, y: 10 }, { x: 0, y: -10 }, { x: 5, y: 0 }] }] };

it('scales and sorts line points without changing source data', () => {
  expect(core).toHaveProperty('buildLineLayout');
  const layout = core.buildLineLayout(options);
  expect(layout.series[0].segments[0].map(p => [p.x, p.y])).toEqual([[0, 100], [100, 50], [200, 0]]);
  expect(options.series[0].data.map(p => p.x)).toEqual([10, 0, 5]);
  layout.series[0].segments[0][0].value.y = 8;
  expect(options.series[0].data[1].y).toBe(-10);
});
it('keeps missing values as gaps and accepts empty series', () => {
  const layout = core.buildLineLayout({ ...options, series: [{ id: 'a', label: 'A', data: [{ x: 0, y: 0 }, { x: 5, y: null }, { x: 10, y: 10 }] }] });
  expect(layout.series[0].segments.map(s => s.length)).toEqual([1, 1]);
  expect(core.buildLineLayout({ ...options, series: [] }).series).toEqual([]);
});
it('finds the nearest real point and respects visible series', () => {
  const layout = core.buildLineLayout(options);
  expect(core.getClosestLinePoint(layout, 95, 55)?.value).toEqual({ x: 5, y: 0 });
  expect(core.getClosestLinePoint(layout, 95, 55, [])).toBeUndefined();
  expect(() => core.getClosestLinePoint(layout, NaN, 0)).toThrow(TypeError);
});
it('rejects nonfinite data, ambiguous identities, duplicate x and out of domain points', () => {
  for (const y of [NaN, Infinity, -Infinity]) expect(() => core.buildLineLayout({ ...options, series: [{ id: 'a', label: 'A', data: [{ x: 0, y }] }] })).toThrow(TypeError);
  expect(() => core.buildLineLayout({ ...options, xDomain: [0, 0] })).toThrow(RangeError);
  expect(() => core.buildLineLayout({ ...options, width: 0 })).toThrow(RangeError);
  expect(() => core.buildLineLayout({ ...options, series: [options.series[0], options.series[0]] })).toThrow(RangeError);
  expect(() => core.buildLineLayout({ ...options, series: [{ id: 'a', label: 'A', data: [{ x: 0, y: 0 }, { x: 0, y: 1 }] }] })).toThrow(RangeError);
  expect(() => core.buildLineLayout({ ...options, series: [{ id: 'a', label: 'A', data: [{ x: 11, y: 0 }] }] })).toThrow(RangeError);
});
it('avoids overflow for finite domains spanning extreme numbers', () => {
  const layout = core.buildLineLayout({ ...options, xDomain: [-Number.MAX_VALUE, Number.MAX_VALUE], yDomain: [-Number.MAX_VALUE, Number.MAX_VALUE] });
  expect(layout.series[0].segments[0].every(p => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
  expect(layout.xTicks.every(t => Number.isFinite(t.value))).toBe(true);
});
it('rejects missing bounds in sparse domains', () => {
  const domain = [0, ,] as unknown as readonly [number, number];
  expect(() => core.buildLineLayout({ ...options, xDomain: domain })).toThrow(TypeError);
  expect(() => core.buildLineLayout({ ...options, yDomain: domain })).toThrow(TypeError);
});
it('finds the closest point even when finite distances overflow', () => {
  const layout = core.buildLineLayout({ ...options, width: Number.MAX_VALUE, height: Number.MAX_VALUE });
  expect(core.getClosestLinePoint(layout, -Number.MAX_VALUE, -Number.MAX_VALUE)?.value).toEqual({ x: 5, y: 0 });
});
