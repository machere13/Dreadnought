import { LineChartAdapter, type LineChartAdapterProps } from '@dreadnought/react/unstyled';
import {
  getLineSeriesClass,
  lineChartPresentation as appearance,
} from '#presentation/Visualization/LineChart/lineChartPresentation.ts';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';
import { markPresentation } from '#presentation/DataDisplay/Mark/markPresentation.ts';
import { buttonPresentation } from '#presentation/Controls/Button/buttonPresentation.ts';

export type LineChartProps = LineChartAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');
export function LineChart({ className, slotProps = {}, ...props }: LineChartProps) {
  return (
    <LineChartAdapter
      {...props}
      className={classes(appearance.root, className)}
      slotProps={{
        ...slotProps,
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
        rangeControls: {
          ...slotProps.rangeControls,
          className: classes(appearance.rangeControls, slotProps.rangeControls?.className),
        },
        rangeInput: {
          ...slotProps.rangeInput,
          className: classes(appearance.rangeInput, slotProps.rangeInput?.className),
        },
        plotContainer: {
          ...slotProps.plotContainer,
          className: classes(appearance.plotContainer, slotProps.plotContainer?.className),
        },
        plot: { ...slotProps.plot, className: classes(appearance.plot, slotProps.plot?.className) },
        grid: { ...slotProps.grid, className: classes(appearance.grid, slotProps.grid?.className) },
        axisLabel: (axis, value) => {
          const slot = slotProps.axisLabel?.(axis, value);
          return { ...slot, className: classes(appearance.axisLabel, slot?.className) };
        },
        series: (series) => {
          const slot = slotProps.series?.(series);
          return {
            ...slot,
            className: classes(appearance.series, getLineSeriesClass(series.id), slot?.className),
          };
        },
        point: (series, point) => {
          const slot = slotProps.point?.(series, point);
          return {
            ...slot,
            className: classes(appearance.point, getLineSeriesClass(series.id), slot?.className),
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
        tooltipMark: (series) => {
          const slot = slotProps.tooltipMark?.(series);
          return {
            ...slot,
            className: classes(
              markPresentation.root,
              appearance.tooltipMark,
              getLineSeriesClass(series.id),
              slot?.className,
            ),
          };
        },
        legend: {
          ...slotProps.legend,
          className: classes(appearance.legend, slotProps.legend?.className),
        },
        legendButton: (series) => {
          const slot = slotProps.legendButton?.(series);
          return {
            ...slot,
            className: classes(
              appearance.legendButton,
              getLineSeriesClass(series.id),
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
