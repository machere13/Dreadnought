import type { ReactNode } from 'react';
import type { ApiGroup, ApiRow } from '../../data/catalog/getCatalogDoc.ts';

export type ComponentDoc = {
  title: string;
  description: string;
  readyCode?: string;
  adapterCode: string;
  logicCode?: string;
  adapterDescription: string;
  logicDescription?: ReactNode;
  apiRows: readonly ApiRow[];
  apiGroups?: readonly ApiGroup[];
  footnote: ReactNode;
  demo: ReactNode;
};
