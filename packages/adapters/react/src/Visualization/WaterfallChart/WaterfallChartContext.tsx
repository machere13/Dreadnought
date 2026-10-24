import { createContext, useContext } from 'react';
import type { WaterfallChartContextValue } from './waterfallChart.types.ts';

export const WaterfallChartContext = createContext<
  (WaterfallChartContextValue & { plotKey: string }) | null
>(null);
export function useWaterfallChartContext() {
  const context = useContext(WaterfallChartContext);
  if (!context) throw new Error('WaterfallChart parts must be rendered inside WaterfallChart');
  return context;
}
export function useWaterfallChart(): WaterfallChartContextValue {
  return useWaterfallChartContext();
}
