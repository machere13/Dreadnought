import type { CSSProperties } from 'react';
import type { TableColumn, TableDataAdapterProps, TableRowKey } from './table.types.ts';

export function cellValue<RecordType extends object>(record: RecordType, dataIndex: TableColumn<RecordType>['dataIndex']) {
  if (dataIndex === undefined) return undefined;
  const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
  return path.reduce<unknown>((value, segment) =>
    value != null && typeof value === 'object' ? (value as Record<string | number, unknown>)[segment] : undefined,
  record);
}

export function recordKey<RecordType extends object>(record: RecordType, rowKey: TableDataAdapterProps<RecordType>['rowKey'], index: number): TableRowKey {
  if (typeof rowKey === 'function') return rowKey(record);
  const value = record[rowKey ?? 'key' as keyof RecordType];
  return typeof value === 'string' || typeof value === 'number' ? value : index;
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
