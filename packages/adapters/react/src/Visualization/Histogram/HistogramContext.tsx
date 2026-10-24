import { createContext, useContext } from 'react';
import type { HistogramLayout } from '@dreadnought/core';
import { useBarChart } from '../BarChart/BarChartContext.tsx';
import type { HistogramContextValue } from './histogram.types.ts';

export const HistogramContext = createContext<HistogramLayout | null>(null);

export function useHistogram(): HistogramContextValue {
  const layout = useContext(HistogramContext);
  if (!layout) throw new Error('Histogram parts must be rendered inside Histogram');
  const chart = useBarChart();
  return { ...chart, layout };
}
