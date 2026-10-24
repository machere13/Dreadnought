import { BarChartAdapter } from '../BarChart/BarChartAdapter.tsx';
import { useHistogram } from './HistogramContext.tsx';
import type { HistogramPlotProps } from './histogram.types.ts';

export function HistogramPlotAdapter({ children, tooltipContent }: HistogramPlotProps) {
  const { layout } = useHistogram();
  return (
    <BarChartAdapter.Plot
      tooltipContent={
        tooltipContent &&
        ((context) =>
          tooltipContent({
            ...context,
            bin: layout.bins[Number(context.category.id)],
          }))
      }
    >
      {children &&
        ((context) =>
          children({
            ...context,
            bin: layout.bins[Number(context.category.id)],
          }))}
    </BarChartAdapter.Plot>
  );
}
