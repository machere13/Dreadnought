import type { ReactNode } from 'react';
import type { CandlestickDatum, CandlestickCandle, CandlestickLayout } from '@dreadnought/core';
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
export interface CandlestickChartRenderContext {
  candle: CandlestickCandle;
  height: number;
  labels: Required<CandlestickChartLabels>;
  formatValue: (value: number) => string;
  defaultContent: ReactNode;
}
export interface CandlestickChartPlotProps {
  height?: number;
  children?: (context: CandlestickChartRenderContext) => ReactNode;
  tooltipContent?: (context: CandlestickChartRenderContext) => ReactNode;
}
export interface CandlestickChartContextValue {
  layout: CandlestickLayout;
  candles: CandlestickCandle[];
  page: { page: number; count: number; change: (page: number) => void };
  label: string;
  labels: Required<CandlestickChartLabels>;
  formatValue: (value: number) => string;
  slotProps: CandlestickChartSlotProps;
}
export type CandlestickChartAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> & {
  children?: ReactNode;
  data: readonly CandlestickDatum[];
  domain?: readonly [number, number];
  label: string;
  description?: string;
  formatValue?: (value: number) => string;
  pageSize?: number;
  labels?: CandlestickChartLabels;
  slotProps?: CandlestickChartSlotProps;
};
