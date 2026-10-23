import type { BoxPlotOptions, BoxPlotGroup } from '@dreadnought/core';
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

export type BoxPlotAdapterProps = Native<
  'figure',
  'role' | 'aria-labelledby' | 'aria-describedby'
> &
  BoxPlotOptions & {
    label: string;
    description?: string;
    valueLabel?: string;
    formatValue?: (value: number) => string;
    pageSize?: number;
    labels?: BoxPlotLabels;
    slotProps?: BoxPlotSlotProps;
  };
