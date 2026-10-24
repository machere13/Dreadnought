import { createContext, useContext } from 'react';
import type { FunnelChartContextValue } from './funnelChart.types.ts';

export const FunnelChartContext = createContext<FunnelChartContextValue | null>(null);
export function useFunnelChart(): FunnelChartContextValue {
  const context = useContext(FunnelChartContext);
  if (!context) throw new Error('FunnelChart parts must be rendered inside FunnelChart');
  return context;
}
