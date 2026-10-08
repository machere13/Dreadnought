import { TableAdapter, TableBodyAdapter, TableCellAdapter, TableHeadAdapter, TableHeaderCellAdapter, TableRowAdapter } from '@dreadnought/react/unstyled';
import type { TableAdapterProps, TableDataAdapterProps, TableMarkupAdapterProps, TableCellAdapterProps, TableHeaderCellAdapterProps } from '@dreadnought/react/unstyled';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';
import { Icon } from '../Icon/index.ts';

function classes(library: string, consumer?: string) { return [library, consumer].filter(Boolean).join(' '); }

type TableAppearance = {
  size?: 'default' | 'middle' | 'small';
  bordered?: boolean;
  rowHoverable?: boolean;
};
export type TableProps<RecordType extends object = Record<string, unknown>> = TableAdapterProps<RecordType> & TableAppearance;

function TableRoot<RecordType extends object>(props: TableDataAdapterProps<RecordType> & TableAppearance): React.JSX.Element;
function TableRoot(props: TableMarkupAdapterProps & TableAppearance): React.JSX.Element;
function TableRoot<RecordType extends object>({ className, size = 'default', bordered = false, rowHoverable = true, ...props }: TableProps<RecordType>) {
  const appearance = {
    className: classes(`dreadnought-text-table ${tablePresentation.root}`, className),
    'data-size': size,
    'data-bordered': bordered,
    'data-row-hoverable': rowHoverable,
  };
  if ('columns' in props && 'dataSource' in props) return <TableAdapter {...props} {...appearance}
    expandable={props.expandable ? { ...props.expandable, expandIcon: props.expandable.expandIcon ?? (() => <Icon name="down" />) } : undefined} />;
  return <TableAdapter {...props} {...appearance} />;
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
