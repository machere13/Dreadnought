import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { TableSortOrder } from '@dreadnought/core';

export type TableRowKey = string | number;
export type TableFilterValue = string | number;

export type TableColumn<RecordType extends object> = {
  key: string;
  title: ReactNode;
  dataIndex?: keyof RecordType | readonly (string | number)[];
  render?: (value: unknown, record: RecordType, index: number) => ReactNode;
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

export type TableDataAdapterProps<RecordType extends object> = Omit<ComponentPropsWithRef<'table'>, 'children' | 'onChange'> & {
  columns: readonly TableColumn<RecordType>[];
  dataSource: readonly RecordType[];
  rowKey?: keyof RecordType | ((record: RecordType) => TableRowKey);
  pagination?: false | TablePagination;
  rowSelection?: TableRowSelection<RecordType>;
  sticky?: boolean | { offsetHeader?: number };
  scroll?: { x?: number | string; y?: number | string };
  locale?: { emptyText?: ReactNode };
  onChange?: (
    pagination: { current: number; pageSize: number },
    filters: TableChangeFilters,
    sorter: TableChangeSorter,
    extra: { currentDataSource: readonly RecordType[] },
  ) => void;
};
