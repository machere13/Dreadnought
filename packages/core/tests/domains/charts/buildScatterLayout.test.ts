import { expect, it } from 'vitest';
import * as core from '../../../src/index.ts';

const series = [
  {
    id: 'a',
    label: 'A',
    data: [
      { id: 'one', label: 'One', x: 0, y: 10, size: 25 },
      { id: 'two', label: 'Two', x: 0, y: 10, size: 100 },
      { id: 'three', label: 'Three', x: 10, y: 0 },
    ],
  },
];
const options = {
  series,
  xDomain: [0, 10] as const,
  yDomain: [0, 10] as const,
  width: 200,
  height: 100,
};

it('maps coordinates without collapsing observations at identical positions', () => {
  expect(core).toHaveProperty('buildScatterLayout');
  const result = core.buildScatterLayout(options);
  expect(result.series[0].points.map(({ x, y }) => [x, y])).toEqual([
    [0, 0],
    [0, 0],
    [200, 100],
  ]);
  expect(result.series[0].points.map((point) => point.id)).toEqual(['one', 'two', 'three']);
  expect(series[0].data[0].x).toBe(0);
});

it('encodes size as area and keeps ordinary points at a fixed radius', () => {
  const points = core.buildScatterLayout({ ...options, maxBubbleRadius: 20, pointRadius: 5 })
    .series[0].points;
  expect(points.map((point) => point.radius)).toEqual([10, 20, 5]);
});

it('shares the bubble scale across series and retains zero values without a visible bubble', () => {
  const result = core.buildScatterLayout({
    ...options,
    maxBubbleRadius: 20,
    series: [
      series[0],
      { id: 'b', label: 'B', data: [{ id: 'zero', label: 'Zero', x: 5, y: 5, size: 0 }] },
    ],
  });
  expect(result.series[1].points[0].radius).toBe(0);
  expect(core.buildScatterLayout({ ...options, series: [] }).series).toEqual([]);
});

it.each([-1, NaN, Infinity])('rejects invalid bubble sizes: %s', (size) => {
  expect(() =>
    core.buildScatterLayout({
      ...options,
      series: [{ ...series[0], data: [{ ...series[0].data[0], size }] }],
    }),
  ).toThrow();
});

it('rejects invalid IDs, domains, coordinates and dimensions', () => {
  expect(() => core.buildScatterLayout({ ...options, series: [series[0], series[0]] })).toThrow();
  expect(() =>
    core.buildScatterLayout({
      ...options,
      series: [{ ...series[0], data: [series[0].data[0], series[0].data[0]] }],
    }),
  ).toThrow();
  expect(() => core.buildScatterLayout({ ...options, xDomain: [1, 1] })).toThrow();
  expect(() => core.buildScatterLayout({ ...options, width: 0 })).toThrow();
  expect(() => core.buildScatterLayout({ ...options, pointRadius: Infinity })).toThrow();
  expect(() => core.buildScatterLayout({ ...options, yDomain: [0, 5] })).toThrow();
});

it('handles extreme finite domains without overflowing coordinates', () => {
  const result = core.buildScatterLayout({
    ...options,
    xDomain: [-Number.MAX_VALUE, Number.MAX_VALUE],
  });
  expect(result.series[0].points[0].x).toBe(100);
  expect(
    result.xTicks.every((tick) => Number.isFinite(tick.position) && Number.isFinite(tick.value)),
  ).toBe(true);
});
