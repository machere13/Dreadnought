import { ChartPagination } from '../../shared/useChartPage.tsx';
import { FunnelDataTable } from './FunnelStatistics.tsx';
import { useFunnelChart } from './FunnelChartContext.tsx';

export function FunnelChartTableAdapter() {
  const { page, ...context } = useFunnelChart();
  return <FunnelDataTable {...context} stages={page.rows} />;
}
export function FunnelChartPaginationAdapter() {
  const { page, slotProps } = useFunnelChart();
  return <ChartPagination {...page} slotProps={slotProps} />;
}
export function FunnelChartEmptyAdapter() {
  const { layout, labels } = useFunnelChart();
  return layout.stages.length ? null : <p>{labels.empty}</p>;
}
