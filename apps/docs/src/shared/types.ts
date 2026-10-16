import type { ReactNode } from 'react';
import type { ApiGroup, ApiRow } from '../data/catalog/getCatalogDoc.ts';

export type ComponentDoc = {
  title: string;
  description: string;
  usage?: ReactNode;
  notes?: ReactNode;
  primaryProps?: readonly string[];
  readyCode?: string;
  adapterCode: string;
  logicCode?: string;
  adapterDescription: string;
  logicDescription?: ReactNode;
  apiRows: readonly ApiRow[];
  apiGroups?: readonly ApiGroup[];
  footnote: ReactNode;
  demo?: ReactNode;
  examples?: readonly {
    id: string;
    title: string;
    description: string;
    demo: ReactNode;
    code: string;
    collapseCode?: boolean;
  }[];
};
