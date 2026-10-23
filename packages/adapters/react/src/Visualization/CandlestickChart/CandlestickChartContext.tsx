import { createContext, useContext } from 'react';
import type { CandlestickChartContextValue } from './candlestickChart.types.ts';

export const CandlestickChartContext = createContext<
  (CandlestickChartContextValue & { plotKey: string }) | null
>(null);

export function useCandlestickChart(): CandlestickChartContextValue {
  return useCandlestickContext();
}

export function useCandlestickContext() {
  const context = useContext(CandlestickChartContext);
  if (!context) throw new Error('CandlestickChart parts must be rendered inside CandlestickChart');
  return context;
}
