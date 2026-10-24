import { ChartPagination } from '../../shared/useChartPage.tsx';
import { useWaterfallChartContext } from './WaterfallChartContext.tsx';
import { WaterfallPlot } from './WaterfallPlot.tsx';
import { WaterfallDataTable } from './WaterfallStatistics.tsx';
import type { WaterfallChartPlotProps } from './waterfallChart.types.ts';

export function WaterfallChartPlotAdapter(props: WaterfallChartPlotProps) {
  const context = useWaterfallChartContext();
  return context.layout.steps.length ? (
    <WaterfallPlot key={context.plotKey} {...context} steps={context.page.rows} {...props} />
  ) : null;
}
export function WaterfallChartTableAdapter() {
  const { page, ...context } = useWaterfallChartContext();
  return <WaterfallDataTable {...context} steps={page.rows} />;
}
export function WaterfallChartPaginationAdapter() {
  const { page, slotProps } = useWaterfallChartContext();
  return <ChartPagination {...page} slotProps={slotProps} />;
}
export function WaterfallChartEmptyAdapter() {
  const { layout, labels } = useWaterfallChartContext();
  return layout.steps.length ? null : <p>{labels.empty}</p>;
}
