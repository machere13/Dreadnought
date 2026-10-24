import type { ReactNode } from 'react';
import type {
  ScatterLayoutOptions,
  ScatterPoint,
  ScatterSeries,
  ScatterLayout,
} from '@dreadnought/core';
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
export type ScatterChartAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> &
  Omit<ScatterLayoutOptions, 'width' | 'height'> &
  Size &
  Partial<ScatterFormat> & {
    children?: ReactNode;
    label: string;
    description?: string;
    visibleSeries?: readonly string[];
    defaultVisibleSeries?: readonly string[];
    onVisibleSeriesChange?: (series: string[]) => void;
    pageSize?: number;
    labels?: ScatterChartLabels;
    slotProps?: ScatterChartSlotProps;
  };

export interface ScatterChartPlotProps {
  children?: (context: {
    point: ScatterPoint;
    series: ScatterSeries;
    cx: number;
    cy: number;
    radius: number;
    active: boolean;
    defaultContent: ReactNode;
  }) => ReactNode;
  tooltipContent?: (context: {
    point: ScatterPoint;
    series: ScatterSeries;
    format: ScatterFormat;
    defaultContent: ReactNode;
  }) => ReactNode;
}
export interface ScatterChartLegendProps {
  children?: (context: {
    series: ScatterSeries;
    visible: boolean;
    defaultContent: ReactNode;
  }) => ReactNode;
}
export interface ScatterChartContextValue extends Pick<
  ScatterChartAdapterProps,
  'series' | 'label' | 'width' | 'height'
> {
  source: ScatterLayout;
  rows: ScatterPoint[];
  seriesNames: ReadonlyMap<string, string>;
  visible: readonly string[];
  toggle: (id: string) => void;
  page: { rows: ScatterPoint[]; page: number; count: number; change: (page: number) => void };
  hasSize: boolean;
  hasVisiblePoints: boolean;
  format: ScatterFormat;
  labels: ScatterChartLabels;
  slotProps: ScatterChartSlotProps;
}
