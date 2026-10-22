import { PieChartAdapter, type PieChartAdapterProps } from '@dreadnought/react/unstyled';
import {
  pieChartPresentation as appearance,
  getPieItemClasses,
} from '#presentation/Visualization/PieChart/pieChartPresentation.ts';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';
import { markPresentation } from '#presentation/DataDisplay/Mark/markPresentation.ts';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';

export type PieChartProps = PieChartAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');

export function PieChart({ className, slotProps = {}, ...props }: PieChartProps) {
  const itemClasses = getPieItemClasses(props.data.map((item) => item.id));
  return (
    <PieChartAdapter
      {...props}
      className={classes(appearance.root, className)}
      slotProps={{
        ...slotProps,
        plotContainer: {
          ...slotProps.plotContainer,
          className: classes(appearance.plotContainer, slotProps.plotContainer?.className),
        },
        plot: { ...slotProps.plot, className: classes(appearance.plot, slotProps.plot?.className) },
        slice: (item) => {
          const slot = slotProps.slice?.(item);
          return {
            ...slot,
            className: classes(appearance.slice, itemClasses.get(item.id), slot?.className),
          };
        },
        legend: {
          ...slotProps.legend,
          className: classes(appearance.legend, slotProps.legend?.className),
        },
        legendButton: (item) => {
          const slot = slotProps.legendButton?.(item);
          return {
            ...slot,
            className: classes(appearance.legendButton, itemClasses.get(item.id), slot?.className),
          };
        },
        tooltip: {
          ...slotProps.tooltip,
          className: classes(tooltipPresentation.root, slotProps.tooltip?.className),
        },
        tooltipTable: {
          ...slotProps.tooltipTable,
          className: classes(appearance.tooltipTable, slotProps.tooltipTable?.className),
        },
        tooltipMark: (item) => {
          const slot = slotProps.tooltipMark?.(item);
          return {
            ...slot,
            className: classes(
              markPresentation.root,
              appearance.tooltipMark,
              itemClasses.get(item.id),
              slot?.className,
            ),
          };
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
      }}
    />
  );
}
