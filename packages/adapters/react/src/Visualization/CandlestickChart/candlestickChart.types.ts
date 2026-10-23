import type { CandlestickDatum, CandlestickCandle } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
import type { ChartPaginationSlots } from '../../shared/useChartPage.tsx';

export interface CandlestickChartLabels {
  period?: string;
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  trend?: string;
  up?: string;
  down?: string;
  flat?: string;
  empty?: string;
  dataTable?: string;
}
export interface CandlestickChartSlotProps extends ChartPaginationSlots {
  plot?: Native<'div'>;
  candle?: (
    candle: CandlestickCandle,
  ) => Native<'span', 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'>;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
  tooltipMark?: Native<'span', 'aria-hidden'>;
  tableContainer?: Native<'div'>;
  table?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
}
export type CandlestickChartAdapterProps = Native<
  'figure',
  'role' | 'aria-labelledby' | 'aria-describedby'
> & {
  data: readonly CandlestickDatum[];
  domain?: readonly [number, number];
  label: string;
  description?: string;
  formatValue?: (value: number) => string;
  pageSize?: number;
  labels?: CandlestickChartLabels;
  slotProps?: CandlestickChartSlotProps;
};
