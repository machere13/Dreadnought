import { getTreeSearchRows } from '@dreadnought/core';
type Node = { id: number; label: string; children?: readonly Node[] };
const records: readonly Node[] = [{ id: 0, label: 'Zero' }];
const result = getTreeSearchRows(records, {
  getKey: (node) => node.id,
  getLabel: (node) => node.label,
  getChildren: (node) => node.children,
});
const key: number | undefined = result.rows[0]?.key;
void key;
getTreeSearchRows(records, {
  getKey: (node) => node.id,
  getChildren: (node) => node.children,
  // @ts-expect-error Labels must be strings.
  getLabel: (node) => node.id,
});
