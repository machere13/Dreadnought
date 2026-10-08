import { getVisibleMenuRows, type VisibleMenuRow } from '@dreadnought/core';
type Item = { value: string; children?: readonly Item[] };
const records: readonly Item[] = [{ value: 'export', children: [{ value: 'pdf' }] }];
const rows: VisibleMenuRow<Item>[] = getVisibleMenuRows(records, { getKey: item => item.value,
  getChildren: item => item.children, getKind: item => item.children ? 'submenu' : 'item' });
void rows;
