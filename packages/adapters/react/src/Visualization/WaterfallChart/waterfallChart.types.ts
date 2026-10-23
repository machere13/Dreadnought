import type { WaterfallDatum, WaterfallStep } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
import type { ChartPaginationSlots } from '../../shared/useChartPage.tsx';

export interface WaterfallChartLabels {
  step?: string;
  kind?: string;
  start?: string;
  change?: string;
  total?: string;
  value?: string;
  before?: string;
  after?: string;
  empty?: string;
  dataTable?: string;
}
export interface WaterfallChartSlotProps extends ChartPaginationSlots {
  plot?: Native<'div'>;
  step?: (
    step: WaterfallStep,
  ) => Native<'span', 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'>;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
  tooltipMark?: Native<'span', 'aria-hidden'>;
  tableContainer?: Native<'div'>;
  table?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
}
export type WaterfallChartAdapterProps = Native<
  'figure',
  'role' | 'aria-labelledby' | 'aria-describedby'
> & {
  data: readonly WaterfallDatum[];
  domain?: readonly [number, number];
  label: string;
  description?: string;
  formatValue?: (value: number) => string;
  pageSize?: number;
  labels?: WaterfallChartLabels;
  slotProps?: WaterfallChartSlotProps;
};
