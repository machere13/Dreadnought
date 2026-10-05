import { expect, it } from 'vitest';
import { buildRadarLayout } from '../../../src/index.ts';
import type { RadarLayoutOptions } from '../../../src/index.ts';

const metrics = ['a', 'b', 'c', 'd'].map(id => ({ id, label: id, domain: [0, 100] as const }));
const options = { metrics, radius: 100, series: [{ id: 's', label: 'S', values: { a: 100, b: 50, c: 0, d: 25 } }] };

it('places four axes clockwise from the top and scales each point', () => {
  const result = buildRadarLayout(options);
  const expected = [[0, -100], [100, 0], [0, 100], [-100, 0]];
  expect(result.axes).toHaveLength(4);
  result.axes.forEach((axis, index) => {
    expect(axis.x).toBeCloseTo(expected[index][0]);
    expect(axis.y).toBeCloseTo(expected[index][1]);
  });
  const points = result.seriesPoints[0].points;
  expect(points.map(point => point.value)).toEqual([100, 50, 0, 25]);
  expect(points.map(point => point.normalizedValue)).toEqual([1, 0.5, 0, 0.25]);
  expect(points[1].x).toBeCloseTo(50);
  expect(points[3].x).toBeCloseTo(-25);
});

it('places three axes at analytically known coordinates', () => {
  const result = buildRadarLayout({ metrics: metrics.slice(0, 3), radius: 100, series: [] });
  expect(result.seriesPoints).toEqual([]);
  expect(result.axes[1].x).toBeCloseTo(Math.sqrt(3) * 50);
  expect(result.axes[1].y).toBeCloseTo(50);
  expect(result.axes[2].x).toBeCloseTo(-Math.sqrt(3) * 50);
  expect(result.axes[2].y).toBeCloseTo(50);
});

it('normalizes reverse and negative ranges in metric order, ignoring extra keys', () => {
  const result = buildRadarLayout({ radius: 10,
    metrics: ['c', 'a', 'b'].map(id => ({ id, label: '', domain: [-10, 10], reverse: true })),
    series: [{ id: 'b', label: '', values: { a: 10, b: -10, c: 5, extra: NaN } }, { id: 'a', label: '', values: { a: 0, b: 0, c: 0 } }] });
  expect(result.axes.map(axis => axis.id)).toEqual(['c', 'a', 'b']);
  expect(result.seriesPoints.map(item => item.id)).toEqual(['b', 'a']);
  expect(result.seriesPoints[0].points.map(point => point.metricId)).toEqual(['c', 'a', 'b']);
  expect(result.seriesPoints[0].points.map(point => point.normalizedValue)).toEqual([0.25, 0, 1]);
});

it('normalizes an overflowing finite domain without losing its midpoint', () => {
  const result = buildRadarLayout({ radius: Number.MAX_VALUE,
    metrics: ['a', 'b', 'c'].map(id => ({ id, label: '', domain: [-Number.MAX_VALUE, Number.MAX_VALUE] })),
    series: [{ id: 's', label: '', values: { a: -Number.MAX_VALUE, b: 0, c: Number.MAX_VALUE } }] });
  expect(result.seriesPoints[0].points.map(point => point.normalizedValue)).toEqual([0, 0.5, 1]);
  expect(result.seriesPoints[0].points.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
});

it('accepts own special keys but rejects inherited values', () => {
  const special = ['__proto__', 'constructor', 'c'].map(id => ({ id, label: '', domain: [0, 100] as const }));
  const values = JSON.parse('{"__proto__":50,"constructor":50,"c":50}');
  const result = buildRadarLayout({ metrics: special, radius: 10, series: [{ id: 's', label: '', values }] });
  expect(result.seriesPoints[0].points.map(point => point.normalizedValue)).toEqual([0.5, 0.5, 0.5]);
  expect(() => buildRadarLayout({ metrics: special, radius: 10,
    series: [{ id: 's', label: '', values: Object.create(values) }] })).toThrow(TypeError);
});

it('does not mutate frozen input or alias mutable domains', () => {
  const frozen = Object.freeze({ radius: 10, metrics: Object.freeze(metrics.map(metric => Object.freeze({ ...metric, domain: Object.freeze(metric.domain) }))),
    series: Object.freeze(options.series.map(item => Object.freeze({ ...item, values: Object.freeze(item.values) }))) });
  const result = buildRadarLayout(frozen);
  expect(buildRadarLayout(frozen)).toEqual(result);
  result.axes[0].domain[0] = -100;
  result.axes.reverse();
  result.seriesPoints[0].points[0].value = -1;
  expect(frozen.metrics[0].domain).toEqual([0, 100]);
  expect(frozen.metrics.map(metric => metric.id)).toEqual(['a', 'b', 'c', 'd']);
  expect(frozen.series[0].values.a).toBe(100);
});

const invalid: Array<[string, unknown, typeof TypeError | typeof RangeError]> = [
  ['null options', null, TypeError],
  ['metrics object', { ...options, metrics: {} }, TypeError],
  ['series object', { ...options, series: {} }, TypeError],
  ['NaN radius', { ...options, radius: NaN }, TypeError],
  ['infinite radius', { ...options, radius: Infinity }, TypeError],
  ['string radius', { ...options, radius: '10' }, TypeError],
  ['zero radius', { ...options, radius: 0 }, RangeError],
  ['negative radius', { ...options, radius: -1 }, RangeError],
  ['two metrics', { ...options, metrics: metrics.slice(0, 2) }, RangeError],
  ['duplicate metric', { ...options, metrics: [...metrics, metrics[0]] }, RangeError],
  ['duplicate series', { ...options, series: [...options.series, options.series[0]] }, RangeError],
  ['null metric', { ...options, metrics: [null, ...metrics] }, TypeError],
  ['sparse metrics', { ...options, metrics: Array(4) }, TypeError],
  ['sparse series', { ...options, series: Array(1) }, TypeError],
  ['null series', { ...options, series: [null] }, TypeError],
  ...[
    ['empty metric id', { id: ' ' }, TypeError], ['number metric id', { id: 1 }, TypeError],
    ['number label', { label: 1 }, TypeError], ['wrong reverse', { reverse: 'true' }, TypeError],
    ['short domain', { domain: [0] }, TypeError], ['long domain', { domain: [0, 100, 200] }, TypeError],
    ['null domain', { domain: null }, TypeError], ['nonfinite domain', { domain: [0, Infinity] }, TypeError],
    ['NaN domain', { domain: [NaN, 100] }, TypeError], ['string domain', { domain: ['0', 100] }, TypeError],
    ['equal domain', { domain: [1, 1] }, RangeError], ['reversed domain', { domain: [100, 0] }, RangeError],
  ].map(([name, change, error]) => [name, { ...options, metrics: [{ ...metrics[0], ...change as object }, ...metrics.slice(1)] }, error] as [string, unknown, typeof TypeError | typeof RangeError]),
  ...[
    ['missing value', { b: 50, c: 50, d: 50 }, TypeError], ['NaN value', { a: NaN, b: 50, c: 50, d: 50 }, TypeError],
    ['infinite value', { a: Infinity, b: 50, c: 50, d: 50 }, TypeError], ['string value', { a: '50', b: 50, c: 50, d: 50 }, TypeError],
    ['below domain', { a: -1, b: 50, c: 50, d: 50 }, RangeError], ['above domain', { a: 101, b: 50, c: 50, d: 50 }, RangeError],
    ['null values', null, TypeError], ['array values', [], TypeError],
  ].map(([name, values, error]) => [name, { ...options, series: [{ id: 's', label: '', values }] }, error] as [string, unknown, typeof TypeError | typeof RangeError]),
  ['empty series id', { ...options, series: [{ ...options.series[0], id: '' }] }, TypeError],
  ['nonstring series label', { ...options, series: [{ ...options.series[0], label: 1 }] }, TypeError],
];

it.each(invalid)('rejects %s explicitly', (_name, input, error) => {
  expect(() => buildRadarLayout(input as RadarLayoutOptions)).toThrow(error);
});
