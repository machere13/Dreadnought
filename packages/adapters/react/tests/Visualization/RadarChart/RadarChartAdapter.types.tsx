import { createRef } from 'react';
import type { RadarMetric, RadarSeries } from '@dreadnought/core';
import { RadarChartAdapter, type RadarChartAdapterProps } from '../../../src/unstyled.ts';

const metrics: readonly RadarMetric[] = [];
const series: readonly RadarSeries[] = [];
const props: RadarChartAdapterProps = { label: 'Radar', metrics, series, ref: createRef<HTMLElement>(),
  slotProps: { axis: metric => ({ className: metric.id }), series: item => ({ className: item.id }),
    plotContainer: { ref: createRef<HTMLDivElement>() }, legendButton: item => ({ title: item.label }) } };
<RadarChartAdapter {...props} />;
<RadarChartAdapter label="Radar" metrics={metrics} series={series} width={400} height={320} />;
// @ts-expect-error label is required
<RadarChartAdapter metrics={metrics} series={series} />;
// @ts-expect-error dimensions must be a pair
<RadarChartAdapter label="Radar" metrics={metrics} series={series} width={400} />;
// @ts-expect-error owned polygon geometry
<RadarChartAdapter {...props} slotProps={{ series: () => ({ points: '0,0' }) }} />;
// @ts-expect-error owned button state
<RadarChartAdapter {...props} slotProps={{ legendButton: () => ({ 'aria-pressed': true }) }} />;
// @ts-expect-error button content is owned
<RadarChartAdapter {...props} slotProps={{ legendButton: () => ({ children: 'bad' }) }} />;
// @ts-expect-error figure content is owned
<RadarChartAdapter {...props}>bad</RadarChartAdapter>;
