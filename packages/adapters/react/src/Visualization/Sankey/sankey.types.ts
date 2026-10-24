import type { ReactNode } from 'react';
import type {
  SankeyItem,
  SankeyLink,
  SankeyNode,
  SankeyLayout,
  SankeyFlow,
} from '@dreadnought/core';
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
export type SankeyAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> & {
  children?: ReactNode;
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

export interface SankeyRenderContext {
  item: SankeyItem;
  active: boolean;
  labels: Required<SankeyLabels>;
  formatValue: (value: number) => string;
  defaultContent: ReactNode;
}
export interface SankeyGlyphContext extends SankeyRenderContext {
  width: number;
  height: number;
  path: string;
}
export interface SankeyPlotProps {
  children?: (context: SankeyGlyphContext) => ReactNode;
  tooltipContent?: (context: SankeyRenderContext) => ReactNode;
}
export interface SankeyContextValue {
  layout: SankeyLayout;
  page: { rows: SankeyFlow[]; page: number; count: number; change: (page: number) => void };
  label: string;
  labels: Required<SankeyLabels>;
  formatValue: (value: number) => string;
  slotProps: SankeySlotProps;
}
