import type { ReactNode } from 'react';
import type { HeatmapCell, HeatmapLayout, HeatmapLayoutOptions } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
import type { ChartPaginationSlots } from '../../shared/useChartPage.tsx';

export interface HeatmapSlotProps extends ChartPaginationSlots {
  viewport?: Native<'div'>;
  grid?: Native<'div', 'role' | 'aria-label'>;
  axisLabel?: Native<'span'>;
  cell?: (
    cell: HeatmapCell,
  ) => Native<'span', 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'>;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
  tooltipMark?: (cell: HeatmapCell) => Native<'span', 'aria-hidden'>;
  legend?: Native<'div', 'role' | 'aria-label'>;
  scale?: Native<'span', 'aria-hidden'>;
  table?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
  tableContainer?: Native<'div'>;
}

export interface HeatmapLabels {
  column?: string;
  row?: string;
  value?: string;
  missing?: string;
  empty?: string;
  legend?: string;
  dataTable?: string;
}

export type HeatmapAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> &
  HeatmapLayoutOptions & {
    children?: ReactNode;
    label: string;
    description?: string;
    formatValue?: (value: number) => string;
    showValues?: boolean;
    pageSize?: number;
    labels?: HeatmapLabels;
    slotProps?: HeatmapSlotProps;
  };

export interface HeatmapContextValue {
  layout: HeatmapLayout;
  hasValues: boolean;
  label: string;
  labels: Required<HeatmapLabels>;
  formatValue: (value: number) => string;
  showValues: boolean;
  slotProps: HeatmapSlotProps;
  page: { rows: HeatmapCell[]; page: number; count: number; change: (page: number) => void };
}
export interface HeatmapCellContext {
  cell: HeatmapCell;
  active: boolean;
  showValues: boolean;
  labels: Required<HeatmapLabels>;
  formatValue: (value: number) => string;
  defaultContent: ReactNode;
}
export interface HeatmapPlotProps {
  children?: (context: HeatmapCellContext) => ReactNode;
  tooltipContent?: (context: HeatmapCellContext) => ReactNode;
}
export interface HeatmapLegendProps {
  children?: (context: {
    domain: readonly [number, number];
    labels: Required<HeatmapLabels>;
    formatValue: (value: number) => string;
    defaultContent: ReactNode;
  }) => ReactNode;
}
