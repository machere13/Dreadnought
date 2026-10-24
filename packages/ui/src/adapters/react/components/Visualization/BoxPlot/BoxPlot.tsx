import { BoxPlotAdapter, type BoxPlotAdapterProps } from '@dreadnought/react/unstyled';
import { boxPlotPresentation as appearance } from '#presentation/Visualization/BoxPlot/index.ts';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';
import { markPresentation } from '#presentation/DataDisplay/Mark/markPresentation.ts';
import { buttonPresentation } from '#presentation/Controls/Button/buttonPresentation.ts';

export type BoxPlotProps = BoxPlotAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');

function BoxPlotRoot({ className, slotProps = {}, ...props }: BoxPlotProps) {
  return (
    <BoxPlotAdapter
      {...props}
      className={classes(appearance.root, className)}
      slotProps={{
        ...slotProps,
        plot: { ...slotProps.plot, className: classes(appearance.plot, slotProps.plot?.className) },
        group: (group) => {
          const slot = slotProps.group?.(group);
          return { ...slot, className: classes(appearance.group, slot?.className) };
        },
        axis: { ...slotProps.axis, className: classes(appearance.axis, slotProps.axis?.className) },
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

export const BoxPlot: typeof BoxPlotRoot &
  Pick<typeof BoxPlotAdapter, 'Plot' | 'Axis' | 'Table' | 'Pagination' | 'Empty'> = Object.assign(
  BoxPlotRoot,
  {
    Plot: BoxPlotAdapter.Plot,
    Axis: BoxPlotAdapter.Axis,
    Table: BoxPlotAdapter.Table,
    Pagination: BoxPlotAdapter.Pagination,
    Empty: BoxPlotAdapter.Empty,
  },
);
