import type { ReactNode } from 'react';
import type { BoxPlotOptions, BoxPlotGroup, BoxPlotLayout } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
import type { ChartPaginationSlots } from '../../shared/useChartPage.tsx';

export interface BoxPlotLabels {
  group?: string;
  count?: string;
  min?: string;
  q1?: string;
  median?: string;
  q3?: string;
  max?: string;
  lowerWhisker?: string;
  upperWhisker?: string;
  outliers?: string;
  empty?: string;
  dataTable?: string;
}

export interface BoxPlotSlotProps extends ChartPaginationSlots {
  plot?: Native<'div'>;
  group?: (
    group: BoxPlotGroup,
  ) => Native<'span', 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'>;
  box?: Native<'rect', 'x' | 'y' | 'width' | 'height'>;
  median?: Native<'line', 'x1' | 'x2' | 'y1' | 'y2'>;
  whisker?: Native<'g'>;
  outlier?: Native<'circle', 'cx' | 'cy' | 'r'>;
  axis?: Native<'div'>;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
  tooltipMark?: Native<'span', 'aria-hidden'>;
  tableContainer?: Native<'div'>;
  table?: Native<'table', 'aria-hidden' | 'hidden' | 'role'>;
}

export type BoxPlotAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> &
  BoxPlotOptions & {
    children?: ReactNode;
    label: string;
    description?: string;
    valueLabel?: string;
    formatValue?: (value: number) => string;
    pageSize?: number;
    labels?: BoxPlotLabels;
    slotProps?: BoxPlotSlotProps;
  };

export interface BoxPlotRenderContext {
  group: BoxPlotGroup;
  active: boolean;
  labels: Required<BoxPlotLabels>;
  formatValue: (value: number) => string;
  defaultContent: ReactNode;
}

export interface BoxPlotPlotProps {
  children?: (context: BoxPlotRenderContext) => ReactNode;
  tooltipContent?: (context: BoxPlotRenderContext) => ReactNode;
}

export interface BoxPlotContextValue {
  layout: BoxPlotLayout;
  page: { rows: BoxPlotGroup[]; page: number; count: number; change: (page: number) => void };
  label: string;
  labels: Required<BoxPlotLabels>;
  valueLabel: string;
  formatValue: (value: number) => string;
  slotProps: BoxPlotSlotProps;
}
