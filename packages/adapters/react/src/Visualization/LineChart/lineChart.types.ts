import type { ReactNode } from 'react';
import type { LineSeries, LinePoint, LineLayout } from '@dreadnought/core';
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
export type LineChartAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> &
  Size & {
    children?: ReactNode;
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

export interface LineChartPlotProps {
  children?: (context: {
    series: LineSeries;
    points: readonly LinePoint[];
    defaultContent: ReactNode;
  }) => ReactNode;
  tooltipContent?: (context: {
    point: LinePoint;
    rows: readonly { item: LineSeries; value: number }[];
    formatX: (value: number) => string;
    formatY: (value: number) => string;
    defaultContent: ReactNode;
  }) => ReactNode;
}
export interface LineChartLegendProps {
  children?: (context: {
    series: LineSeries;
    visible: boolean;
    defaultContent: ReactNode;
  }) => ReactNode;
}
export interface LineChartContextValue
  extends
    Required<
      Pick<
        LineChartAdapterProps,
        | 'label'
        | 'series'
        | 'xDomain'
        | 'xLabel'
        | 'yLabel'
        | 'formatX'
        | 'formatY'
        | 'labels'
        | 'slotProps'
        | 'zoom'
      >
    >,
    Pick<LineChartAdapterProps, 'width' | 'height'> {
  source: LineLayout;
  values: ReadonlyMap<string, ReadonlyMap<number, number | null>>;
  xs: readonly number[];
  visible: readonly string[];
  toggle: (id: string) => void;
  range: { start: number; end: number; change: (start: number, end: number) => void };
  page: { rows: number[]; page: number; count: number; change: (page: number) => void };
}
