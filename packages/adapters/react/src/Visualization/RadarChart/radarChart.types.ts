import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
export { chartNativeProps as radarNativeProps } from '../../shared/chartNativeProps.ts';
import type { RadarMetric, RadarSeries } from '@dreadnought/core';

export type RadarChartLabels = {
  legend: string;
  dataTable: string;
  metric: string;
  domain: string;
  direction: string;
  increasing: string;
  decreasing: string;
};
export type RadarChartSlotProps = {
  plotContainer?: Native<'div'>;
  plot?: Native<
    'svg',
    | 'width'
    | 'height'
    | 'viewBox'
    | 'preserveAspectRatio'
    | 'aria-hidden'
    | 'tabIndex'
    | 'focusable'
  >;
  grid?: Native<'g'>;
  axis?: (metric: RadarMetric) => Native<'line', 'x1' | 'y1' | 'x2' | 'y2'>;
  axisLabel?: (metric: RadarMetric) => Native<'text', 'x' | 'y' | 'textAnchor'>;
  series?: (series: RadarSeries) => Native<'polygon', 'points'>;
  point?: (
    series: RadarSeries,
    metric: RadarMetric,
  ) => Native<
    'circle',
    'cx' | 'cy' | 'r' | 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'
  >;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
  tooltipMark?: (series: RadarSeries) => Native<'span', 'aria-hidden'>;
  legend?: Native<'div', 'role' | 'aria-label'>;
  legendButton?: (
    series: RadarSeries,
  ) => Native<'button', 'type' | 'aria-pressed' | 'aria-label' | 'aria-labelledby' | 'disabled'>;
  table?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
};
type Size = { width: number; height: number } | { width?: undefined; height?: undefined };
export type RadarChartAdapterProps = Native<
  'figure',
  'aria-labelledby' | 'aria-describedby' | 'role'
> &
  Size & {
    metrics: readonly RadarMetric[];
    series: readonly RadarSeries[];
    label: string;
    description?: string;
    visibleSeries?: readonly string[];
    defaultVisibleSeries?: readonly string[];
    onVisibleSeriesChange?: (next: string[]) => void;
    labels?: Partial<RadarChartLabels>;
    slotProps?: RadarChartSlotProps;
  };
