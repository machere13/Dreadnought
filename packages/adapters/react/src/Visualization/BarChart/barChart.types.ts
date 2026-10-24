import type { ReactNode } from 'react';
import type { BarCategory, BarSeries, BarRect, BarLayout } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
import type { ChartPaginationSlots } from '../../shared/useChartPage.tsx';

export interface BarChartSlotProps extends ChartPaginationSlots {
  scrollContainer?: Native<'div'>;
  plotContainer?: Native<'div'>;
  plot?: Native<
    'svg',
    'width' | 'height' | 'viewBox' | 'preserveAspectRatio' | 'aria-hidden' | 'tabIndex'
  >;
  grid?: Native<'g'>;
  categoryLabel?: (category: BarCategory) => Native<'text', 'x' | 'y' | 'textAnchor'>;
  valueLabel?: (value: number) => Native<'text', 'x' | 'y' | 'textAnchor'>;
  bar?: (
    series: BarSeries,
    bar: BarRect,
  ) => Native<'g', 'role' | 'tabIndex' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'>;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
  tooltipMark?: (series: BarSeries) => Native<'span', 'aria-hidden'>;
  legend?: Native<'div', 'role' | 'aria-label'>;
  legendButton?: (
    series: BarSeries,
  ) => Native<'button', 'type' | 'aria-pressed' | 'aria-label' | 'aria-labelledby' | 'disabled'>;
  table?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
}
type Size = { width: number; height: number } | { width?: undefined; height?: undefined };
export type BarChartAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> &
  Size & {
    children?: ReactNode;
    label: string;
    description?: string;
    categories: readonly BarCategory[];
    series: readonly BarSeries[];
    domain: readonly [number, number];
    orientation?: 'vertical' | 'horizontal';
    gapRatio?: number;
    categoryLabel?: string;
    valueLabel?: string;
    formatValue?: (value: number) => string;
    formatTick?: (value: number) => string;
    visibleSeries?: readonly string[];
    defaultVisibleSeries?: readonly string[];
    onVisibleSeriesChange?: (series: string[]) => void;
    pageSize?: number;
    minCategorySize?: number;
    labels?: { legend?: string; dataTable?: string; empty?: string };
    slotProps?: BarChartSlotProps;
  };

export interface BarChartPlotProps {
  children?: (context: {
    bar: BarRect;
    series: BarSeries;
    category: BarCategory;
    active: boolean;
    defaultContent: ReactNode;
  }) => ReactNode;
  tooltipContent?: (context: {
    bar: BarRect;
    category: BarCategory;
    rows: readonly { item: BarSeries; value: number }[];
    formatValue: (value: number) => string;
    defaultContent: ReactNode;
  }) => ReactNode;
}
export interface BarChartLegendProps {
  children?: (context: {
    series: BarSeries;
    visible: boolean;
    defaultContent: ReactNode;
  }) => ReactNode;
}
export interface BarChartContextValue
  extends
    Required<
      Pick<
        BarChartAdapterProps,
        | 'label'
        | 'categories'
        | 'series'
        | 'domain'
        | 'categoryLabel'
        | 'valueLabel'
        | 'formatValue'
        | 'formatTick'
        | 'minCategorySize'
        | 'labels'
        | 'slotProps'
      >
    >,
    Pick<BarChartAdapterProps, 'width' | 'height' | 'orientation' | 'gapRatio'> {
  source: BarLayout;
  visible: readonly string[];
  toggle: (id: string) => void;
  page: { rows: BarCategory[]; page: number; count: number; change: (page: number) => void };
}
