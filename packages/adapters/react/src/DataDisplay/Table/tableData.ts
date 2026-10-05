import type { CSSProperties } from 'react';
import type { TableColumn, TableDataAdapterProps, TableRowKey } from './table.types.ts';

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

export function fixedStyle<RecordType extends object>(columns: readonly TableColumn<RecordType>[], index: number, hasSelection: boolean): CSSProperties | undefined {
  const column = columns[index];
  if (!column) return undefined;
  const style: CSSProperties = column.width ? { width: column.width, minWidth: column.width } : {};
  if (column.fixed) {
    const siblings = column.fixed === 'left' ? columns.slice(0, index) : columns.slice(index + 1);
    const offset = siblings.filter((item) => item.fixed === column.fixed).reduce((sum, item) => sum + (item.width ?? 0), 0);
    style[column.fixed] = column.fixed === 'left' && hasSelection
      ? `calc(var(--dreadnought-table-selection-width) + ${offset}px)` : offset;
  }
  return style;
}
