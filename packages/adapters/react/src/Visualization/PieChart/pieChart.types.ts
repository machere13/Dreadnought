import type { ReactNode } from 'react';
import type { PieDatum, PieSlice, PieLayout } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';

export type PieChartLabels = {
  legend: string;
  dataTable: string;
  category: string;
  value: string;
  empty: string;
};
export type PieChartSlotProps = {
  plotContainer?: Native<'div'>;
  plot?: Native<
    'svg',
    'width' | 'height' | 'viewBox' | 'preserveAspectRatio' | 'aria-hidden' | 'tabIndex'
  >;
  slice?: (
    item: PieSlice,
  ) => Native<'path', 'd' | 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'>;
  legend?: Native<'div', 'role' | 'aria-label'>;
  legendButton?: (
    item: PieDatum,
  ) => Native<'button', 'type' | 'aria-pressed' | 'aria-label' | 'aria-labelledby' | 'disabled'>;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
  tooltipMark?: (item: PieDatum) => Native<'span', 'aria-hidden'>;
  table?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
};
type Size = { width: number; height: number } | { width?: undefined; height?: undefined };
export type PieChartAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> &
  Size & {
    children?: ReactNode;
    data: readonly PieDatum[];
    label: string;
    description?: string;
    innerRadius?: number;
    visibleItems?: readonly string[];
    defaultVisibleItems?: readonly string[];
    onVisibleItemsChange?: (next: string[]) => void;
    labels?: Partial<PieChartLabels>;
    slotProps?: PieChartSlotProps;
  };

export interface PieChartPlotProps {
  children?: (context: {
    slice: PieSlice;
    path: string;
    radius: number;
    innerRadius: number;
    active: boolean;
    defaultContent: ReactNode;
  }) => ReactNode;
  tooltipContent?: (context: {
    slice: PieSlice;
    layout: PieLayout;
    defaultContent: ReactNode;
  }) => ReactNode;
}
export interface PieChartLegendProps {
  children?: (context: {
    item: PieDatum;
    visible: boolean;
    defaultContent: ReactNode;
  }) => ReactNode;
}
export interface PieChartContextValue extends Pick<
  PieChartAdapterProps,
  'data' | 'label' | 'width' | 'height'
> {
  source: PieLayout;
  layout: PieLayout;
  visible: readonly string[];
  toggle: (id: string) => void;
  labels: PieChartLabels;
  slotProps: PieChartSlotProps;
}
