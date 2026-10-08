import type { LineSeries, LinePoint } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
import type { ChartPaginationSlots } from '../../shared/useChartPage.tsx';

export interface LineChartSlotProps extends ChartPaginationSlots {
  rangeControls?: Native<'div'>;
  rangeInput?: Native<'input', 'type' | 'min' | 'max' | 'value' | 'aria-label'>;
  plotContainer?: Native<'div'>;
  plot?: Native<
    'svg',
    'width' | 'height' | 'viewBox' | 'preserveAspectRatio' | 'aria-hidden' | 'tabIndex'
  >;
  grid?: Native<'g'>;
  axisLabel?: (axis: 'x' | 'y', value: number) => Native<'text', 'x' | 'y' | 'textAnchor'>;
  series?: (series: LineSeries) => Native<'polyline', 'points'>;
  point?: (
    series: LineSeries,
    point: LinePoint,
  ) => Native<
    'circle',
    'cx' | 'cy' | 'r' | 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'
  >;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
  tooltipMark?: (series: LineSeries) => Native<'span', 'aria-hidden'>;
  legend?: Native<'div', 'role' | 'aria-label'>;
  legendButton?: (
    series: LineSeries,
  ) => Native<'button', 'type' | 'aria-pressed' | 'aria-label' | 'aria-labelledby' | 'disabled'>;
  table?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
}
type Size = { width: number; height: number } | { width?: undefined; height?: undefined };
export type LineChartAdapterProps = Native<
  'figure',
  'role' | 'aria-labelledby' | 'aria-describedby'
> &
  Size & {
    label: string;
    description?: string;
    series: readonly LineSeries[];
    xDomain: readonly [number, number];
    yDomain: readonly [number, number];
    xLabel?: string;
    yLabel?: string;
    formatX?: (value: number) => string;
    formatY?: (value: number) => string;
    visibleSeries?: readonly string[];
    defaultVisibleSeries?: readonly string[];
    onVisibleSeriesChange?: (series: string[]) => void;
    pageSize?: number;
    zoom?: boolean;
    labels?: { legend?: string; dataTable?: string; empty?: string };
    slotProps?: LineChartSlotProps;
  };
