import { createContext, useContext } from 'react';
import type { HeatmapContextValue } from './heatmap.types.ts';

export const HeatmapContext = createContext<HeatmapContextValue | null>(null);
export function useHeatmap(): HeatmapContextValue {
  const context = useContext(HeatmapContext);
  if (!context) throw new Error('Heatmap parts must be rendered inside Heatmap');
  return context;
}
