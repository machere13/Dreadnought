import type { SankeyItem, SankeyLink, SankeyNode } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
import type { ChartPaginationSlots } from '../../shared/useChartPage.tsx';

export interface SankeyLabels {
  source?: string;
  target?: string;
  value?: string;
  incoming?: string;
  outgoing?: string;
  empty?: string;
  dataTable?: string;
}
export interface SankeySlotProps extends ChartPaginationSlots {
  plot?: Native<'div'>;
  item?: (
    item: SankeyItem,
  ) => Native<'span', 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'>;
  tooltip?: Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
  tooltipMark?: Native<'span', 'aria-hidden'>;
  tableContainer?: Native<'div'>;
  table?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
}
export type SankeyAdapterProps = Native<
  'figure',
  'role' | 'aria-labelledby' | 'aria-describedby'
> & {
  nodes: readonly SankeyNode[];
  links: readonly SankeyLink[];
  label: string;
  description?: string;
  nodeGap?: number;
  formatValue?: (value: number) => string;
  pageSize?: number;
  labels?: SankeyLabels;
  slotProps?: SankeySlotProps;
};
