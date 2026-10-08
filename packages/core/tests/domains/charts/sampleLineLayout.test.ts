import { expect, it } from 'vitest';
import * as core from '../../../src/index.ts';

it('bounds dense geometry by resolution without removing a peak or trough', () => {
  const data = Array.from({ length: 10000 }, (_, x) => ({
    x,
    y: x === 4311 ? 100 : x === 4312 ? -100 : 0,
  }));
  const source = core.buildLineLayout({
    series: [{ id: 'a', label: 'A', data }],
    xDomain: [0, 9999],
    yDomain: [-100, 100],
    width: 1,
    height: 1,
  });
  const sampled = core.sampleLineLayout(source, 100, 200, [0, 9999]);
  const points = sampled.series[0].segments.flat();
  expect(points.length).toBeLessThanOrEqual(404);
  expect(points.find((point) => point.value.x === 4311)?.y).toBe(0);
  expect(points.find((point) => point.value.x === 4312)?.y).toBe(200);
  expect(points[0].value.x).toBe(0);
  expect(points.at(-1)?.value.x).toBe(9999);
  expect(source.series[0].segments[0]).toHaveLength(10000);
});

it('does not connect across gaps, including a zoomed gap with no visible vertices', () => {
  const source = core.buildLineLayout({
    series: [
      {
        id: 'a',
        label: 'A',
        data: [
          { x: 0, y: 0 },
          { x: 2, y: 1 },
          { x: 5, y: null },
          { x: 8, y: 1 },
          { x: 10, y: 0 },
        ],
      },
    ],
    xDomain: [0, 10],
    yDomain: [0, 1],
    width: 1,
    height: 1,
  });
  expect(
    core
      .sampleLineLayout(source, 100, 100, [0, 10])
      .series[0].segments.map((segment) => segment.map((point) => point.value.x)),
  ).toEqual([
    [0, 2],
    [8, 10],
  ]);
  expect(core.sampleLineLayout(source, 100, 100, [3, 7]).series[0].segments).toEqual([]);
  const zoom = core.sampleLineLayout(source, 100, 100, [1, 2]);
  expect(zoom.xTicks[0].value).toBe(1);
  expect(zoom.xTicks.at(-1)?.value).toBe(2);
  expect(zoom.series[0].segments[0].at(-1)?.x).toBe(100);
});

it('keeps geometry bounded for thousands of isolated gap segments and validates dimensions', () => {
  const source = core.buildLineLayout({
    series: [
      {
        id: 'a',
        label: 'A',
        data: Array.from({ length: 10000 }, (_, x) => ({ x, y: x % 2 ? null : 1 })),
      },
    ],
    xDomain: [0, 10000],
    yDomain: [0, 2],
    width: 1,
    height: 1,
  });
  const sampled = core.sampleLineLayout(source, 20, 100, [0, 10000]);
  expect(sampled.series[0].segments.flat().length).toBeLessThanOrEqual(84);
  expect(sampled.series[0].segments.every((segment) => segment.length === 1)).toBe(true);
  expect(() => core.sampleLineLayout(source, 0, 100, [0, 10])).toThrow();
  expect(() => core.sampleLineLayout(source, 20, 100, [2, 1])).toThrow();
});

it('looks up exact original x with logarithmic access and stable midpoint ties', () => {
  const layout = core.buildLineLayout({
    series: [
      { id: 'a', label: 'A', data: Array.from({ length: 100000 }, (_, x) => ({ x, y: x })) },
    ],
    xDomain: [0, 100000],
    yDomain: [0, 100000],
    width: 1,
    height: 1,
  });
  const points = layout.series[0].segments[0];
  let reads = 0;
  const indexed = new Proxy(points, {
    get: (target, property, receiver) => {
      if (/^\d+$/.test(String(property))) {
        reads++;
      }
      return Reflect.get(target, property, receiver);
    },
  });
  expect(core.getLinePointAtX(indexed, 98765)?.value).toEqual({ x: 98765, y: 98765 });
  expect(reads).toBeLessThan(25);
  expect(core.getLinePointAtX(points, 3.5)?.value.x).toBe(3);
  expect(
    core.getLinePointAtX(
      [
        { ...points[0], value: { x: 0, y: 0 } },
        { ...points[1], value: { x: Number.MIN_VALUE, y: 1 } },
      ],
      Number.MIN_VALUE,
    )?.value.y,
  ).toBe(1);
  expect(core.getLinePointAtX([], 0)).toBeUndefined();
  expect(() => core.getLinePointAtX(points, NaN)).toThrow(TypeError);
  expect(
    core.sampleLineLayout(layout, 200, 100, [0, 100000]).series[0].segments.flat().length,
  ).toBeLessThanOrEqual(804);
});

it('clips neighbor geometry safely when zooming extreme finite domains without inventing data values', () => {
  const source = core.buildLineLayout({
    series: [
      {
        id: 'a',
        label: 'A',
        data: [
          { x: -1e308, y: 0 },
          { x: 1e308, y: 1 },
          { x: 1.1e308, y: 0 },
        ],
      },
    ],
    xDomain: [-1e308, 1.1e308],
    yDomain: [0, 1],
    width: 1,
    height: 1,
  });
  const points = core
    .sampleLineLayout(source, 100, 100, [1e308, 1.1e308])
    .series[0].segments.flat();
  expect(points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
  expect(points[0].x).toBe(0);
  expect(points[0].value.x).toBe(-1e308);
});
