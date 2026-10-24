import type { HistogramBin, HistogramLayout } from '@dreadnought/core';
import type { BarChartContextValue, BarChartPlotProps } from '../BarChart/barChart.types.ts';

type WithBin<T> = T extends (context: infer Context) => infer Result
  ? (context: Context & { bin: HistogramBin }) => Result
  : never;

export interface HistogramPlotProps {
  children?: WithBin<NonNullable<BarChartPlotProps['children']>>;
  tooltipContent?: WithBin<NonNullable<BarChartPlotProps['tooltipContent']>>;
}

export interface HistogramContextValue extends BarChartContextValue {
  layout: HistogramLayout;
}
