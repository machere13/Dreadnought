import type { ComponentPropsWithRef, ReactNode } from 'react';

export type TableRowKey = string | number;

export type TableColumn<RecordType extends object> = {
  key: string;
  title: ReactNode;
  dataIndex?: keyof RecordType | readonly (string | number)[];
  render?: (value: unknown, record: RecordType, index: number) => ReactNode;
  width?: number;
};

export type TableDataAdapterProps<RecordType extends object> = Omit<ComponentPropsWithRef<'table'>, 'children'> & {
  columns: readonly TableColumn<RecordType>[];
  dataSource: readonly RecordType[];
  rowKey?: keyof RecordType | ((record: RecordType) => TableRowKey);
};

function cellValue<RecordType extends object>(record: RecordType, dataIndex: TableColumn<RecordType>['dataIndex']) {
  if (dataIndex === undefined) return undefined;
  const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
  return path.reduce<unknown>((value, segment) =>
    value != null && typeof value === 'object' ? (value as Record<string | number, unknown>)[segment] : undefined,
  record);
}

function recordKey<RecordType extends object>(record: RecordType, rowKey: TableDataAdapterProps<RecordType>['rowKey'], index: number): TableRowKey {
  if (typeof rowKey === 'function') return rowKey(record);
  const value = record[rowKey ?? 'key' as keyof RecordType];
  return typeof value === 'string' || typeof value === 'number' ? value : index;
}

export function DataTableAdapter<RecordType extends object>({ columns, dataSource, rowKey, ...tableProps }: TableDataAdapterProps<RecordType>) {
  return <table {...tableProps} data-ui="table">
    <thead><tr>{columns.map((column) => <th key={column.key} scope="col" data-slot="header-cell" style={column.width ? { width: column.width } : undefined}>{column.title}</th>)}</tr></thead>
    <tbody>{dataSource.map((record, rowIndex) => <tr key={recordKey(record, rowKey, rowIndex)}>{columns.map((column) => {
      const value = cellValue(record, column.dataIndex);
      return <td key={column.key} data-slot="cell">{column.render ? column.render(value, record, rowIndex) : String(value ?? '')}</td>;
    })}</tr>)}</tbody>
  </table>;
}
