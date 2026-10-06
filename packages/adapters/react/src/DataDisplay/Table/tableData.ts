import type { CSSProperties } from 'react';
import { filterTableRows, sortTableRows } from '@dreadnought/core';
import type { TableChangeFilters, TableChangeSorter, TableColumn, TableDataAdapterProps, TableRowKey } from './table.types.ts';

export function matchingRows<RecordType extends object>(data: readonly RecordType[], columns: readonly TableColumn<RecordType>[],
  filters: TableChangeFilters, sorter: TableChangeSorter) {
  const filtered = filterTableRows(data, columns.filter(column => column.onFilter).map(column => ({
    values: filters[column.key] ?? [], predicate: column.onFilter!,
  })));
  const column = columns.find(column => column.key === sorter.columnKey);
  return sortTableRows(filtered, column?.sorter, sorter.order);
}

export function cellValue<RecordType extends object>(record: RecordType, dataIndex: TableColumn<RecordType>['dataIndex']) {
  if (dataIndex === undefined) return undefined;
  const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
  return path.reduce<unknown>((value, segment) =>
    value != null && typeof value === 'object' ? (value as Record<string | number, unknown>)[segment] : undefined,
  record);
}

export function recordKey<RecordType extends object>(record: RecordType, rowKey: TableDataAdapterProps<RecordType>['rowKey'], index?: number): TableRowKey {
  const value = typeof rowKey === 'function' ? rowKey(record) : record[rowKey ?? 'key' as keyof RecordType];
  if (typeof value === 'string' || typeof value === 'number' && Number.isFinite(value)) return value;
  if (index !== undefined) return index;
  throw new Error('Table rowSelection requires a string or finite number from rowKey or record.key.');
}

export function paginationNumber(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!Number.isSafeInteger(value) || value < 1) throw new RangeError('Table pagination requires a positive integer.');
  return value;
}

export function fixedStyle<RecordType extends object>(columns: readonly TableColumn<RecordType>[], index: number, widths: readonly number[], selectionWidth: number): CSSProperties | undefined {
  const column = columns[index];
  if (!column) return undefined;
  const style: CSSProperties = column.width ? { width: column.width, minWidth: column.width } : {};
  if (column.fixed) {
    const offset = columns.reduce((sum, item, sibling) => item.fixed === column.fixed
      && (column.fixed === 'left' ? sibling < index : sibling > index)
      ? sum + (widths[sibling] || item.width || 0) : sum, 0);
    style[column.fixed] = offset + (column.fixed === 'left' ? selectionWidth : 0);
    style.position = 'sticky';
    style.zIndex = 1;
  }
  return style;
}
