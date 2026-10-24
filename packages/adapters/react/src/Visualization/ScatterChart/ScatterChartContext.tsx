import { createContext, useContext } from 'react';
import type { ScatterChartContextValue } from './scatterChart.types.ts';

export const ScatterChartContext = createContext<ScatterChartContextValue | null>(null);
export function useScatterChart(): ScatterChartContextValue {
  const context = useContext(ScatterChartContext);
  if (!context) throw new Error('ScatterChart parts must be rendered inside ScatterChart');
  return context;
}
