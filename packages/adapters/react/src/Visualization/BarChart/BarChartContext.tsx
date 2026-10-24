import { createContext, useContext } from 'react';
import type { BarChartContextValue } from './barChart.types.ts';

export const BarChartContext = createContext<BarChartContextValue | null>(null);

export function useBarChart(): BarChartContextValue {
  const context = useContext(BarChartContext);
  if (!context) throw new Error('BarChart parts must be rendered inside BarChart');
  return context;
}
