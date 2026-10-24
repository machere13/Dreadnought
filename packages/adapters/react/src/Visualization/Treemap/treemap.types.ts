import type { ReactNode } from 'react';
import type { TreemapGroup, TreemapItem, TreemapLayout } from '@dreadnought/core';
import type { ChartNative as Native } from '../../shared/chartNativeProps.ts';
import type { ChartPaginationSlots } from '../../shared/useChartPage.tsx';
import type { BreadcrumbSlotClassNames } from '../../Navigation/Breadcrumb/BreadcrumbAdapter.tsx';

export interface TreemapLabels {
  breadcrumb?: string;
  value?: string;
  share?: string;
  totalShare?: string;
  name?: string;
  empty?: string;
}
export interface TreemapSlotProps extends ChartPaginationSlots {
  plot?: Native<'div'>;
  tile?: (
    item: TreemapItem,
  ) => Native<'span', 'role' | 'tabIndex' | 'aria-label' | 'aria-describedby'>;
  breadcrumb?: Native<'nav', 'aria-label'>;
  breadcrumbClassNames?: BreadcrumbSlotClassNames;
  navigationButton?: Native<'button', 'type'>;
  tooltip?: (item: TreemapItem) => Native<'div', 'ref' | 'id' | 'role' | 'hidden' | 'popover'>;
  tooltipTable?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
  tooltipMark?: Native<'span', 'aria-hidden'>;
  tableContainer?: Native<'div'>;
  table?: Native<'table', 'role' | 'hidden' | 'aria-hidden'>;
}
export type TreemapAdapterProps = Omit<
  Native<'figure', 'role' | 'aria-labelledby' | 'aria-describedby'>,
  'children'
> & {
  children?: ReactNode;
  data: TreemapGroup;
  label: string;
  description?: string;
  onRootChange?: (id: string) => void;
  formatValue?: (value: number) => string;
  formatPercent?: (ratio: number) => string;
  pageSize?: number;
  labels?: TreemapLabels;
  slotProps?: TreemapSlotProps;
};

export interface TreemapRenderContext {
  item: TreemapItem;
  layout: TreemapLayout;
  active: boolean;
  labels: Required<TreemapLabels>;
  formatValue: (value: number) => string;
  formatPercent: (ratio: number) => string;
  defaultContent: ReactNode;
}
export interface TreemapPlotProps {
  children?: (context: TreemapRenderContext) => ReactNode;
  tooltipContent?: (context: TreemapRenderContext) => ReactNode;
}
export interface TreemapContextValue {
  layout: TreemapLayout;
  page: { rows: TreemapItem[]; page: number; count: number; change: (page: number) => void };
  navigate: (id: string) => void;
  label: string;
  labels: Required<TreemapLabels>;
  formatValue: (value: number) => string;
  formatPercent: (ratio: number) => string;
  slotProps: TreemapSlotProps;
}
