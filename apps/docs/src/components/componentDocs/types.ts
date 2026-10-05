import type { ReactNode } from 'react';

type ApiRow = readonly [name: string, values: string, fallback: string, meaning: string];

export type ComponentDoc = {
  title: string;
  description: string;
  readyCode?: string;
  adapterCode: string;
  logicCode?: string;
  adapterDescription: string;
  logicDescription?: ReactNode;
  apiRows: readonly ApiRow[];
  footnote: ReactNode;
  demo: ReactNode;
};
