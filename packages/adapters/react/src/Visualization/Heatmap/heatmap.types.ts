import type { HeatmapCell, HeatmapLayoutOptions } from '@dreadnought/core';
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

export type HeatmapAdapterProps = Native<
  'figure',
  'role' | 'aria-labelledby' | 'aria-describedby'
> &
  HeatmapLayoutOptions & {
    label: string;
    description?: string;
    formatValue?: (value: number) => string;
    showValues?: boolean;
    pageSize?: number;
    labels?: HeatmapLabels;
    slotProps?: HeatmapSlotProps;
  };
