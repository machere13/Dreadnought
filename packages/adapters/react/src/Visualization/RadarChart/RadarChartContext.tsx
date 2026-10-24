import { createContext, useContext } from 'react';
import type { RadarChartContextValue } from './radarChart.types.ts';

export const RadarChartContext = createContext<RadarChartContextValue | null>(null);
export function useRadarChart(): RadarChartContextValue {
  const context = useContext(RadarChartContext);
  if (!context) throw new Error('RadarChart parts must be rendered inside RadarChart');
  return context;
}
