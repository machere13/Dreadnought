import { ChartPagination } from '../../shared/useChartPage.tsx';
import { useSankeyContext } from './SankeyContext.tsx';
import { SankeyPlot } from './SankeyPlot.tsx';
import { SankeyDataTable } from './SankeyStatistics.tsx';
import type { SankeyPlotProps } from './sankey.types.ts';

export function SankeyPlotAdapter(props: SankeyPlotProps) {
  const context = useSankeyContext();
  return context.layout.nodes.length ? (
    <SankeyPlot key={context.plotKey} {...context} {...props} />
  ) : null;
}
export function SankeyTableAdapter() {
  const { page, ...context } = useSankeyContext();
  return <SankeyDataTable {...context} links={page.rows} />;
}
export function SankeyPaginationAdapter() {
  const { page, slotProps } = useSankeyContext();
  return <ChartPagination {...page} slotProps={slotProps} />;
}
export function SankeyEmptyAdapter() {
  const { layout, labels } = useSankeyContext();
  return layout.nodes.length ? null : <p>{labels.empty}</p>;
}
