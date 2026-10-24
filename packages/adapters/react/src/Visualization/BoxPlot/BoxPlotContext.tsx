import { createContext, useContext } from 'react';
import type { BoxPlotContextValue } from './boxPlot.types.ts';

export const BoxPlotContext = createContext<BoxPlotContextValue | null>(null);

export function useBoxPlot(): BoxPlotContextValue {
  const context = useContext(BoxPlotContext);
  if (!context) throw new Error('BoxPlot parts must be rendered inside BoxPlot');
  return context;
}
