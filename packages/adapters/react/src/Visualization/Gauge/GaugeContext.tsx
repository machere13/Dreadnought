import { createContext, useContext } from 'react';
import type { GaugeContextValue } from './gauge.types.ts';

export const GaugeContext = createContext<GaugeContextValue | null>(null);
export function useGauge(): GaugeContextValue {
  const context = useContext(GaugeContext);
  if (!context) throw new Error('Gauge parts must be rendered inside Gauge');
  return context;
}
