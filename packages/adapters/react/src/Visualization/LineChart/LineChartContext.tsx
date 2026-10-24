import { createContext, useContext } from 'react';
import type { LineChartContextValue } from './lineChart.types.ts';

export const LineChartContext = createContext<LineChartContextValue | null>(null);

export function useLineChart(): LineChartContextValue {
  const context = useContext(LineChartContext);
  if (!context) throw new Error('LineChart parts must be rendered inside LineChart');
  return context;
}
