import { TableAdapter, TableBodyAdapter, TableCellAdapter, TableHeadAdapter, TableHeaderCellAdapter, TableRowAdapter } from '@dreadnought/react/unstyled';
import type { TableAdapterProps, TableCellAdapterProps, TableHeaderCellAdapterProps } from '@dreadnought/react/unstyled';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';

function classes(library: string, consumer?: string) { return [library, consumer].filter(Boolean).join(' '); }

function TableRoot({ className, ...props }: TableAdapterProps) {
  return <TableAdapter {...props} className={classes(`dreadnought-text-table ${tablePresentation.root}`, className)} />;
}
function HeaderCell({ className, ...props }: TableHeaderCellAdapterProps) {
  return <TableHeaderCellAdapter {...props} className={classes(tablePresentation.headerCell, className)} />;
}
function Cell({ className, ...props }: TableCellAdapterProps) {
  return <TableCellAdapter {...props} className={classes(tablePresentation.cell, className)} />;
}

export const Table = Object.assign(TableRoot, {
  Head: TableHeadAdapter,
  Body: TableBodyAdapter,
  Row: TableRowAdapter,
  HeaderCell,
  Cell,
});
export type TableProps = TableAdapterProps;
