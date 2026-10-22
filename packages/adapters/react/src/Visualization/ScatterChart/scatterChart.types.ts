import type { ScatterLayoutOptions, ScatterPoint, ScatterSeries } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
import type { ChartPaginationSlots } from '../../shared/useChartPage.tsx';

export interface ScatterChartSlotProps extends ChartPaginationSlots {
  plotContainer?: Native<'div'>;
  plot?: Native<
    'svg',
    'width' | 'height' | 'viewBox' | 'preserveAspectRatio' | 'aria-hidden' | 'tabIndex' | 'role'
  >;
  grid?: Native<'g'>;
  axisLabel?: (axis: 'x' | 'y', value: number) => Native<'text', 'x' | 'y' | 'textAnchor'>;
  point?: (
    series: ScatterSeries,
    point: ScatterPoint,
  ) => Native<
    'circle',
    'cx' | 'cy' | 'r' | 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'
  >;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
  tooltipMark?: (series: ScatterSeries) => Native<'span', 'aria-hidden'>;
  legend?: Native<'div', 'role' | 'aria-label'>;
  legendButton?: (
    series: ScatterSeries,
  ) => Native<'button', 'type' | 'aria-pressed' | 'aria-label' | 'aria-labelledby' | 'disabled'>;
  table?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
}

export interface ScatterChartLabels {
  legend?: string;
  dataTable?: string;
  series?: string;
  observation?: string;
  empty?: string;
}

export interface ScatterFormat {
  xLabel: string;
  yLabel: string;
  sizeLabel: string;
  formatX: (value: number) => string;
  formatY: (value: number) => string;
  formatSize: (value: number) => string;
}

type Size = { width: number; height: number } | { width?: undefined; height?: undefined };
export type ScatterChartAdapterProps = Native<
  'figure',
  'role' | 'aria-labelledby' | 'aria-describedby'
> &
  Omit<ScatterLayoutOptions, 'width' | 'height'> &
  Size &
  Partial<ScatterFormat> & {
    label: string;
    description?: string;
    visibleSeries?: readonly string[];
    defaultVisibleSeries?: readonly string[];
    onVisibleSeriesChange?: (series: string[]) => void;
    pageSize?: number;
    labels?: ScatterChartLabels;
    slotProps?: ScatterChartSlotProps;
  };
