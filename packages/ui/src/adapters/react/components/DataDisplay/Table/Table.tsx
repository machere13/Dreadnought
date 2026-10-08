import {
  TableAdapter,
  TableBodyAdapter,
  TableCellAdapter,
  TableHeadAdapter,
  TableHeaderCellAdapter,
  TableRowAdapter,
} from '@dreadnought/react/unstyled';
import type {
  TableAdapterProps,
  TableDataAdapterProps,
  TableMarkupAdapterProps,
  TableCellAdapterProps,
  TableHeaderCellAdapterProps,
  TableFilterSlots,
} from '@dreadnought/react/unstyled';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';
import { loaderPresentation } from '#presentation/Feedback/Loader/loaderPresentation.ts';
import { Icon } from '../Icon/index.ts';
import { Input } from '../../Fields/Input/index.ts';
import { Button } from '../../Controls/Button/index.ts';

function classes(library: string, consumer?: string) {
  return [library, consumer].filter(Boolean).join(' ');
}

type TableAppearance = {
  size?: 'default' | 'middle' | 'small';
  bordered?: boolean;
  rowHoverable?: boolean;
};
export type TableProps<RecordType extends object = Record<string, unknown>> =
  TableAdapterProps<RecordType> & TableAppearance;

function TableRoot<RecordType extends object>(
  props: TableDataAdapterProps<RecordType> & TableAppearance,
): React.JSX.Element;
function TableRoot(props: TableMarkupAdapterProps & TableAppearance): React.JSX.Element;
function TableRoot<RecordType extends object>({
  className,
  size = 'default',
  bordered = false,
  rowHoverable = true,
  ...props
}: TableProps<RecordType>) {
  const appearance = {
    className: classes(`dreadnought-text-table ${tablePresentation.root}`, className),
    'data-size': size,
    'data-bordered': bordered,
    'data-row-hoverable': rowHoverable,
  };
  if ('columns' in props && 'dataSource' in props) {
    const filterSlots: TableFilterSlots = {
      renderSearch: (inputProps) => <Input {...inputProps} />,
      renderButton: (buttonProps) => <Button {...buttonProps} size="compact" variant="secondary" />,
      icon: <Icon name="filter" />,
      ...props.slotProps?.filter,
    };
    const tooltipSlots = {
      ...props.slotProps?.tooltip,
      className: classes(tooltipPresentation.root, props.slotProps?.tooltip?.className),
    };
    const loaderSlots = {
      showLabel: false,
      ...props.slotProps?.loader,
      className: classes(loaderPresentation.root, props.slotProps?.loader?.className),
      'data-custom-indicator': props.slotProps?.loader?.indicator != null || undefined,
      slotClassNames: {
        indicator: classes(
          loaderPresentation.indicator,
          props.slotProps?.loader?.slotClassNames?.indicator,
        ),
        graphic: classes(
          loaderPresentation.graphic,
          props.slotProps?.loader?.slotClassNames?.graphic,
        ),
        label: classes(loaderPresentation.label, props.slotProps?.loader?.slotClassNames?.label),
        content: classes(
          loaderPresentation.content,
          props.slotProps?.loader?.slotClassNames?.content,
        ),
      },
    };
    const expandable = props.expandable
      ? {
          ...props.expandable,
          expandIcon: props.expandable.expandIcon ?? (() => <Icon name="down" />),
        }
      : undefined;
    return (
      <TableAdapter
        {...props}
        {...appearance}
        slotProps={{
          ...props.slotProps,
          filter: filterSlots,
          tooltip: tooltipSlots,
          loader: loaderSlots,
        }}
        expandable={expandable}
      />
    );
  }
  return <TableAdapter {...props} {...appearance} />;
}
function HeaderCell({ className, ...props }: TableHeaderCellAdapterProps) {
  return (
    <TableHeaderCellAdapter
      {...props}
      className={classes(tablePresentation.headerCell, className)}
    />
  );
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
