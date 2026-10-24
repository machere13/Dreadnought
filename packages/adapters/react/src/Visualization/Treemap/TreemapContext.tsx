import { createContext, useContext, type RefObject } from 'react';
import type { TreemapContextValue } from './treemap.types.ts';

interface Context extends TreemapContextValue {
  elements: RefObject<Map<string, HTMLElement>>;
  location: RefObject<HTMLParagraphElement | null>;
  plotKey: string;
}
export const TreemapContext = createContext<Context | null>(null);
export function useTreemapContext() {
  const context = useContext(TreemapContext);
  if (!context) throw new Error('Treemap parts must be rendered inside Treemap');
  return context;
}
export function useTreemap(): TreemapContextValue {
  return useTreemapContext();
}
