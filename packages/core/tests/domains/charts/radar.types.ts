import { buildRadarLayout } from '@dreadnought/core';
import type { RadarMetric, RadarSeries, RadarLayoutOptions, RadarLayout } from '@dreadnought/core';

const metrics = [
  { id: 'a', label: '', domain: [0, 1] },
  { id: 'b', label: '', domain: [0, 1] },
  { id: 'c', label: '', domain: [0, 1], reverse: true },
] as const satisfies readonly RadarMetric[];
const series = [
  { id: 's', label: '', values: { a: 1, b: 0.5, c: 0 } },
] as const satisfies readonly RadarSeries[];
const options: RadarLayoutOptions = { metrics, series, radius: 100 };
const layout: RadarLayout = buildRadarLayout(options);
layout.seriesPoints[0].points[0].normalizedValue satisfies number;

// @ts-expect-error domain is a pair
const badDomain: RadarMetric = { id: 'a', label: '', domain: [0, 1, 2] };
// @ts-expect-error reverse is boolean
const badReverse: RadarMetric = { id: 'a', label: '', domain: [0, 1], reverse: 'true' };
// @ts-expect-error values are numeric
const badValues: RadarSeries = { id: 's', label: '', values: { a: '1' } };
