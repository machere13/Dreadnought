import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { TableSortOrder } from '@dreadnought/core';
import type { TooltipAdapterProps } from '../../Overlays/Tooltip/index.ts';

export type TableRowKey = string | number;
export type TableFilterValue = string | number;

export type TableColumn<RecordType extends object> = {
  key: string;
  title: ReactNode;
  children?: readonly TableColumn<RecordType>[];
  hidden?: boolean;
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  dataIndex?: keyof RecordType | readonly (string | number)[];
  render?: (value: unknown, record: RecordType, index: number) => ReactNode;
  onCell?: (record: RecordType, index: number) => Omit<ComponentPropsWithRef<'td'>, 'children' | 'dangerouslySetInnerHTML'>;
  onHeaderCell?: (column: TableColumn<RecordType>, index: number) => Omit<ComponentPropsWithRef<'th'>, 'children' | 'dangerouslySetInnerHTML'>;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: (a: RecordType, b: RecordType) => number;
  sortOrder?: TableSortOrder;
  defaultSortOrder?: Exclude<TableSortOrder, null>;
  sortLabel?: string;
  filters?: readonly { text: string; value: TableFilterValue }[];
  onFilter?: (value: TableFilterValue, record: RecordType) => boolean;
  filteredValue?: readonly TableFilterValue[] | null;
  defaultFilteredValue?: readonly TableFilterValue[];
  filterMultiple?: boolean;
};

export type TablePagination = {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
};

export type TableRowSelection<RecordType extends object> = {
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: readonly TableRowKey[];
  defaultSelectedRowKeys?: readonly TableRowKey[];
  onChange?: (keys: TableRowKey[], rows: RecordType[]) => void;
  getCheckboxProps?: (record: RecordType) => { disabled?: boolean };
};

export type TableChangeFilters = Record<string, readonly TableFilterValue[]>;
export type TableChangeSorter = { columnKey?: string; order: TableSortOrder };

export type TableExpandable<RecordType extends object> = {
  expandedRowRender: (record: RecordType, index: number) => ReactNode;
  expandedRowKeys?: readonly TableRowKey[];
  defaultExpandedRowKeys?: readonly TableRowKey[];
  rowExpandable?: (record: RecordType) => boolean;
  onExpand?: (expanded: boolean, record: RecordType) => void;
  onExpandedRowsChange?: (keys: TableRowKey[]) => void;
  expandIcon?: (expanded: boolean, record: RecordType) => ReactNode;
  columnTitle?: ReactNode;
};

export type TableDataAdapterProps<RecordType extends object> = Omit<ComponentPropsWithRef<'table'>, 'children' | 'onChange' | 'summary'> & {
  columns: readonly TableColumn<RecordType>[];
  dataSource: readonly RecordType[];
  rowKey?: keyof RecordType | ((record: RecordType) => TableRowKey);
  pagination?: false | TablePagination;
  rowSelection?: TableRowSelection<RecordType>;
  expandable?: TableExpandable<RecordType>;
  summary?: (rows: readonly RecordType[]) => ReactNode;
  onRow?: (record: RecordType, index: number) => Omit<ComponentPropsWithRef<'tr'>, 'children' | 'dangerouslySetInnerHTML'>;
  onHeaderRow?: (columns: readonly TableColumn<RecordType>[], index: number) => Omit<ComponentPropsWithRef<'tr'>, 'children' | 'dangerouslySetInnerHTML'>;
  sticky?: boolean | { offsetHeader?: number };
  scroll?: { x?: number | string; y?: number | string };
  locale?: { emptyText?: ReactNode };
  slotProps?: { tooltip?: Omit<TooltipAdapterProps, 'children' | 'content'> };
  onChange?: (
    pagination: { current: number; pageSize: number },
    filters: TableChangeFilters,
    sorter: TableChangeSorter,
    extra: { action: 'sort' | 'filter' | 'paginate'; currentDataSource: readonly RecordType[] },
  ) => void;
};
