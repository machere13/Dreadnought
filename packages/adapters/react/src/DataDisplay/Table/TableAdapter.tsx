import type { ComponentPropsWithRef } from 'react';
import { DataTableAdapter } from './DataTableAdapter.tsx';
import type { TableDataAdapterProps } from './table.types.ts';

export type TableMarkupAdapterProps = ComponentPropsWithRef<'table'>;
export type TableAdapterProps<RecordType extends object = Record<string, unknown>> =
  TableMarkupAdapterProps | TableDataAdapterProps<RecordType>;
export type TableHeadAdapterProps = ComponentPropsWithRef<'thead'>;
export type TableBodyAdapterProps = ComponentPropsWithRef<'tbody'>;
export type TableRowAdapterProps = ComponentPropsWithRef<'tr'>;
export type TableHeaderCellAdapterProps = ComponentPropsWithRef<'th'>;
export type TableCellAdapterProps = ComponentPropsWithRef<'td'>;

export function TableHeadAdapter(props: TableHeadAdapterProps) {
  return <thead {...props} />;
}
export function TableBodyAdapter(props: TableBodyAdapterProps) {
  return <tbody {...props} />;
}
export function TableRowAdapter(props: TableRowAdapterProps) {
  return <tr {...props} />;
}
export function TableHeaderCellAdapter(props: TableHeaderCellAdapterProps) {
  return <th {...props} />;
}
export function TableCellAdapter(props: TableCellAdapterProps) {
  return <td {...props} />;
}

function TableRootAdapter<RecordType extends object>(
  props: TableDataAdapterProps<RecordType>,
): React.JSX.Element;
function TableRootAdapter(props: TableMarkupAdapterProps): React.JSX.Element;
function TableRootAdapter<RecordType extends object>(props: TableAdapterProps<RecordType>) {
  if ('columns' in props && 'dataSource' in props) {
    return <DataTableAdapter {...props} />;
  }
  return <table {...props} data-ui="table" />;
}

export const TableAdapter = Object.assign(TableRootAdapter, {
  Head: TableHeadAdapter,
  Body: TableBodyAdapter,
  Row: TableRowAdapter,
  HeaderCell: TableHeaderCellAdapter,
  Cell: TableCellAdapter,
});
