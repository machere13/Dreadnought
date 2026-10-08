import type { BarCategory, BarSeries, BarRect } from '@dreadnought/core';
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
export type BarChartAdapterProps = Native<
  'figure',
  'role' | 'aria-labelledby' | 'aria-describedby'
> &
  Size & {
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
    visibleSeries?: readonly string[];
    defaultVisibleSeries?: readonly string[];
    onVisibleSeriesChange?: (series: string[]) => void;
    pageSize?: number;
    minCategorySize?: number;
    labels?: { legend?: string; dataTable?: string; empty?: string };
    slotProps?: BarChartSlotProps;
  };
