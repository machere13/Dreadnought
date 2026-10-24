import type { ReactNode } from 'react';
import type { FunnelLayoutOptions, FunnelLayout, FunnelStage } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
import type { ChartPaginationSlots } from '../../shared/useChartPage.tsx';

export interface FunnelChartLabels {
  stage?: string;
  value?: string;
  fromFirst?: string;
  fromPrevious?: string;
  drop?: string;
  empty?: string;
  dataTable?: string;
}

export interface FunnelChartSlotProps extends ChartPaginationSlots {
  plot?: Native<'div'>;
  stage?: (
    stage: FunnelStage,
  ) => Native<'span', 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'>;
  shape?: Native<'polygon', 'points'>;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
  tooltipMark?: Native<'span', 'aria-hidden'>;
  tableContainer?: Native<'div'>;
  table?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
}

export type FunnelChartAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> &
  FunnelLayoutOptions & {
    children?: ReactNode;
    label: string;
    description?: string;
    formatValue?: (value: number) => string;
    formatPercent?: (ratio: number) => string;
    pageSize?: number;
    labels?: FunnelChartLabels;
    slotProps?: FunnelChartSlotProps;
  };

export interface FunnelChartRenderContext {
  stage: FunnelStage;
  active: boolean;
  labels: Required<FunnelChartLabels>;
  formatValue: (value: number) => string;
  formatPercent: (ratio: number) => string;
  defaultContent: ReactNode;
}
export interface FunnelChartPlotProps {
  children?: (context: FunnelChartRenderContext) => ReactNode;
  tooltipContent?: (context: FunnelChartRenderContext) => ReactNode;
}
export interface FunnelChartContextValue {
  layout: FunnelLayout;
  page: { rows: FunnelStage[]; page: number; count: number; change: (page: number) => void };
  label: string;
  labels: Required<FunnelChartLabels>;
  formatValue: (value: number) => string;
  formatPercent: (ratio: number) => string;
  slotProps: FunnelChartSlotProps;
}
