import { SankeyAdapter, type SankeyAdapterProps } from '@dreadnought/react/unstyled';
import { sankeyPresentation as appearance } from '#presentation/Visualization/Sankey/index.ts';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';
import { markPresentation } from '#presentation/DataDisplay/Mark/markPresentation.ts';
import { buttonPresentation } from '#presentation/Controls/Button/buttonPresentation.ts';

export type SankeyProps = SankeyAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');

function SankeyRoot({ className, slotProps = {}, ...props }: SankeyProps) {
  return (
    <SankeyAdapter
      {...props}
      className={classes(appearance.root, className)}
      slotProps={{
        ...slotProps,
        plot: { ...slotProps.plot, className: classes(appearance.plot, slotProps.plot?.className) },
        item: (item) => {
          const slot = slotProps.item?.(item);
          return { ...slot, className: classes(appearance.item, slot?.className) };
        },
        tooltip: {
          ...slotProps.tooltip,
          className: classes(
            tooltipPresentation.root,
            appearance.tooltip,
            slotProps.tooltip?.className,
          ),
        },
        tooltipTable: {
          ...slotProps.tooltipTable,
          className: classes(appearance.tooltipTable, slotProps.tooltipTable?.className),
        },
        tooltipMark: {
          ...slotProps.tooltipMark,
          className: classes(
            markPresentation.root,
            appearance.mark,
            slotProps.tooltipMark?.className,
          ),
        },
        tableContainer: {
          ...slotProps.tableContainer,
          className: classes(appearance.tableContainer, slotProps.tableContainer?.className),
        },
        table: {
          ...slotProps.table,
          className: classes(
            'dreadnought-text-table',
            tablePresentation.root,
            appearance.table,
            slotProps.table?.className,
          ),
        },
        pagination: {
          ...slotProps.pagination,
          className: classes(appearance.pagination, slotProps.pagination?.className),
        },
        paginationButton: {
          ...slotProps.paginationButton,
          className: classes(
            buttonPresentation.root,
            buttonPresentation.variants.secondary,
            buttonPresentation.sizes.compact,
            slotProps.paginationButton?.className,
          ),
        },
        pageInput: {
          ...slotProps.pageInput,
          className: classes(appearance.pageInput, slotProps.pageInput?.className),
        },
      }}
    />
  );
}

export const Sankey: typeof SankeyRoot &
  Pick<typeof SankeyAdapter, 'Plot' | 'Table' | 'Pagination' | 'Empty'> = Object.assign(
  SankeyRoot,
  {
    Plot: SankeyAdapter.Plot,
    Table: SankeyAdapter.Table,
    Pagination: SankeyAdapter.Pagination,
    Empty: SankeyAdapter.Empty,
  },
);
