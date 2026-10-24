import { ChartPagination } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { useHeatmap } from './HeatmapContext.tsx';
import { HeatmapGrid } from './HeatmapGrid.tsx';
import { HeatmapDataTable } from './HeatmapDataTable.tsx';
import type { HeatmapPlotProps, HeatmapLegendProps } from './heatmap.types.ts';

export function HeatmapPlotAdapter(props: HeatmapPlotProps) {
  return <HeatmapGrid {...useHeatmap()} {...props} />;
}
export function HeatmapTableAdapter() {
  const { page, ...context } = useHeatmap();
  return <HeatmapDataTable {...context} cells={page.rows} />;
}
export function HeatmapPaginationAdapter() {
  const { page, slotProps } = useHeatmap();
  return <ChartPagination {...page} slotProps={slotProps} />;
}
export function HeatmapEmptyAdapter() {
  const { hasValues, labels } = useHeatmap();
  return hasValues ? null : <p>{labels.empty}</p>;
}
export function HeatmapLegendAdapter({ children }: HeatmapLegendProps) {
  const { layout, hasValues, labels, formatValue, slotProps } = useHeatmap();
  const domain = layout.domain;
  if (!domain || !hasValues) return null;
  const content = (
    <>
      <span>{labels.value}</span>
      <span>{formatValue(domain[0])}</span>
      <span
        {...native(slotProps.scale)}
        aria-hidden="true"
        data-ui="heatmap-scale"
        data-constant={domain[0] === domain[1] || undefined}
      />
      {domain[0] !== domain[1] && <span>{formatValue(domain[1])}</span>}
    </>
  );
  return (
    <div
      {...native(slotProps.legend)}
      role="group"
      aria-label={labels.legend}
      data-ui="heatmap-legend"
    >
      {children ? children({ domain, labels, formatValue, defaultContent: content }) : content}
    </div>
  );
}
