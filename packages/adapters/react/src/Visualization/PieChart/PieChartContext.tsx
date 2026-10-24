import { createContext, useContext } from 'react';
import type { PieChartContextValue } from './pieChart.types.ts';

export const PieChartContext = createContext<PieChartContextValue | null>(null);
export function usePieChart(): PieChartContextValue {
  const context = useContext(PieChartContext);
  if (!context) throw new Error('PieChart parts must be rendered inside PieChart');
  return context;
}
