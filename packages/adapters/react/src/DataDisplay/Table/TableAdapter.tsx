import type { ComponentPropsWithRef } from 'react';

export type TableAdapterProps = ComponentPropsWithRef<'table'>;
export type TableHeadAdapterProps = ComponentPropsWithRef<'thead'>;
export type TableBodyAdapterProps = ComponentPropsWithRef<'tbody'>;
export type TableRowAdapterProps = ComponentPropsWithRef<'tr'>;
export type TableHeaderCellAdapterProps = ComponentPropsWithRef<'th'>;
export type TableCellAdapterProps = ComponentPropsWithRef<'td'>;

export function TableHeadAdapter(props: TableHeadAdapterProps) { return <thead {...props} />; }
export function TableBodyAdapter(props: TableBodyAdapterProps) { return <tbody {...props} />; }
export function TableRowAdapter(props: TableRowAdapterProps) { return <tr {...props} />; }
export function TableHeaderCellAdapter(props: TableHeaderCellAdapterProps) { return <th {...props} />; }
export function TableCellAdapter(props: TableCellAdapterProps) { return <td {...props} />; }

function TableRootAdapter(props: TableAdapterProps) { return <table {...props} data-ui="table" />; }

export const TableAdapter = Object.assign(TableRootAdapter, {
  Head: TableHeadAdapter,
  Body: TableBodyAdapter,
  Row: TableRowAdapter,
  HeaderCell: TableHeaderCellAdapter,
  Cell: TableCellAdapter,
});
