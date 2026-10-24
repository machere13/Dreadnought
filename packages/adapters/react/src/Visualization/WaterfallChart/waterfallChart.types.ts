import type { ReactNode } from 'react';
import type { WaterfallDatum, WaterfallStep, WaterfallLayout } from '@dreadnought/core';
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
export type WaterfallChartAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> & {
  children?: ReactNode;
  data: readonly WaterfallDatum[];
  domain?: readonly [number, number];
  label: string;
  description?: string;
  formatValue?: (value: number) => string;
  pageSize?: number;
  labels?: WaterfallChartLabels;
  slotProps?: WaterfallChartSlotProps;
};

export interface WaterfallChartRenderContext {
  step: WaterfallStep;
  baseline: number;
  connector: boolean;
  active: boolean;
  labels: Required<WaterfallChartLabels>;
  formatValue: (value: number) => string;
  defaultContent: ReactNode;
}
export interface WaterfallChartPlotProps {
  children?: (context: WaterfallChartRenderContext) => ReactNode;
  tooltipContent?: (context: WaterfallChartRenderContext) => ReactNode;
}
export interface WaterfallChartContextValue {
  layout: WaterfallLayout;
  page: { rows: WaterfallStep[]; page: number; count: number; change: (page: number) => void };
  label: string;
  labels: Required<WaterfallChartLabels>;
  formatValue: (value: number) => string;
  slotProps: WaterfallChartSlotProps;
}
