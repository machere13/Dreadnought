import { createContext, useContext } from 'react';
import type { SankeyContextValue } from './sankey.types.ts';

export const SankeyContext = createContext<(SankeyContextValue & { plotKey: string }) | null>(null);
export function useSankeyContext() {
  const context = useContext(SankeyContext);
  if (!context) throw new Error('Sankey parts must be rendered inside Sankey');
  return context;
}
export function useSankey(): SankeyContextValue {
  return useSankeyContext();
}
