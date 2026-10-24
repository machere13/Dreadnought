import { ChartPagination } from '../../shared/useChartPage.tsx';
import { useCandlestickContext } from './CandlestickChartContext.tsx';
import { CandlestickPlot } from './CandlestickPlot.tsx';
import { CandlestickDataTable } from './CandlestickStatistics.tsx';
import type { CandlestickChartPlotProps } from './candlestickChart.types.ts';

export function CandlestickChartPlotAdapter(props: CandlestickChartPlotProps) {
  const { plotKey, ...context } = useCandlestickContext();
  const height = props.height ?? 240;
  if (!Number.isFinite(height) || height <= 0) {
    throw new RangeError('CandlestickChart plot height must be positive and finite');
  }
  if (!context.candles.length) return null;
  return <CandlestickPlot key={plotKey} {...context} {...props} height={height} />;
}

export function CandlestickChartEmptyAdapter() {
  const { candles, labels } = useCandlestickContext();
  return candles.length ? null : <p>{labels.empty}</p>;
}

export function CandlestickChartTableAdapter() {
  const context = useCandlestickContext();
  return <CandlestickDataTable {...context} />;
}

export function CandlestickChartPaginationAdapter() {
  const { page, slotProps } = useCandlestickContext();
  return <ChartPagination {...page} slotProps={slotProps} />;
}
