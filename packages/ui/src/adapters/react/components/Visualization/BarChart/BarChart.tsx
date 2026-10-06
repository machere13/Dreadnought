import { BarChartAdapter, type BarChartAdapterProps } from '@dreadnought/react/unstyled';
import { getBarSeriesClass, barChartPresentation as appearance } from '#presentation/Visualization/BarChart/barChartPresentation.ts';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';
import { markPresentation } from '#presentation/DataDisplay/Mark/markPresentation.ts';

export type BarChartProps = BarChartAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');
export function BarChart({ className, slotProps = {}, ...props }: BarChartProps) {
  return <BarChartAdapter {...props} className={classes(appearance.root, className)} slotProps={{
    ...slotProps,
    plotContainer: { ...slotProps.plotContainer, className: classes(appearance.plotContainer, slotProps.plotContainer?.className) },
    plot: { ...slotProps.plot, className: classes(appearance.plot, slotProps.plot?.className) },
    grid: { ...slotProps.grid, className: classes(appearance.grid, slotProps.grid?.className) },
    categoryLabel: category => { const slot = slotProps.categoryLabel?.(category); return { ...slot, className: classes(appearance.axisLabel, slot?.className) }; },
    valueLabel: value => { const slot = slotProps.valueLabel?.(value); return { ...slot, className: classes(appearance.axisLabel, slot?.className) }; },
    bar: (series, bar) => { const slot = slotProps.bar?.(series, bar); return { ...slot, className: classes(appearance.bar, getBarSeriesClass(series.id), slot?.className) }; },
    tooltip: { ...slotProps.tooltip, className: classes(tooltipPresentation.root, slotProps.tooltip?.className) },
    tooltipTable: { ...slotProps.tooltipTable, className: classes(appearance.tooltipTable, slotProps.tooltipTable?.className) },
    tooltipMark: series => { const slot = slotProps.tooltipMark?.(series); return { ...slot, className: classes(markPresentation.root, appearance.tooltipMark, getBarSeriesClass(series.id), slot?.className) }; },
    legend: { ...slotProps.legend, className: classes(appearance.legend, slotProps.legend?.className) },
    legendButton: series => { const slot = slotProps.legendButton?.(series); return { ...slot, className: classes(appearance.legendButton, getBarSeriesClass(series.id), slot?.className) }; },
    table: { ...slotProps.table, className: classes('dreadnought-text-table', tablePresentation.root, appearance.table, slotProps.table?.className) },
  }} />;
}
