import { RadarChartAdapter } from '@dreadnought/react/unstyled';
import type { RadarChartAdapterProps } from '@dreadnought/react/unstyled';
import { getRadarSeriesClass, radarChartPresentation as appearance } from '#presentation/Visualization/RadarChart/radarChartPresentation.ts';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';
import { markPresentation } from '#presentation/DataDisplay/Mark/markPresentation.ts';

export type RadarChartProps = RadarChartAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');

export function RadarChart({ className, slotProps = {}, ...props }: RadarChartProps) {
  return <RadarChartAdapter {...props} className={classes(appearance.root, className)} slotProps={{
    ...slotProps,
    plotContainer: { ...slotProps.plotContainer, className: classes(appearance.plotContainer, slotProps.plotContainer?.className) },
    plot: { ...slotProps.plot, className: classes(appearance.plot, slotProps.plot?.className) },
    grid: { ...slotProps.grid, className: classes(appearance.grid, slotProps.grid?.className) },
    axis: metric => { const slot = slotProps.axis?.(metric); return { ...slot, className: classes(appearance.axis, slot?.className) }; },
    axisLabel: metric => { const slot = slotProps.axisLabel?.(metric); return { ...slot, className: classes(appearance.axisLabel, slot?.className) }; },
    series: series => { const slot = slotProps.series?.(series); return { ...slot, className: classes(appearance.series, getRadarSeriesClass(series.id), slot?.className) }; },
    point: (series, metric) => { const slot = slotProps.point?.(series, metric); return { ...slot, className: classes(appearance.point, getRadarSeriesClass(series.id), slot?.className) }; },
    tooltip: { ...slotProps.tooltip, className: classes(tooltipPresentation.root, slotProps.tooltip?.className) },
    tooltipTable: { ...slotProps.tooltipTable, className: classes(appearance.tooltipTable, slotProps.tooltipTable?.className) },
    tooltipMark: series => { const slot = slotProps.tooltipMark?.(series); return { ...slot, className: classes(markPresentation.root, appearance.tooltipMark, getRadarSeriesClass(series.id), slot?.className) }; },
    legend: { ...slotProps.legend, className: classes(appearance.legend, slotProps.legend?.className) },
    legendButton: series => { const slot = slotProps.legendButton?.(series); return { ...slot, className: classes(appearance.legendButton, getRadarSeriesClass(series.id), slot?.className) }; },
    table: { ...slotProps.table, className: classes('dreadnought-text-table', tablePresentation.root, appearance.table, slotProps.table?.className) },
  }} />;
}
