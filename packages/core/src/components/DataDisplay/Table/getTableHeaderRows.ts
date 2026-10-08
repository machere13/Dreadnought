import { getTreeRows } from '../../../behaviors/getVisibleTreeRows.ts';

export interface TableHeaderCell<Column> {
  column: Column;
  columnIndex: number;
  parentKey: string | null;
  colSpan: number;
  rowSpan: number;
}

export function getTableHeaderRows<Column extends { key: string; hidden?: boolean; children?: readonly Column[] }>(columns: readonly Column[]) {
  const source = getTreeRows(columns, { getKey: column => column.key, getChildren: column => column.children }, true);
  const hidden = new Set<string>();
  const counts = new Map<string, number>();
  for (const node of source) {
    if (node.record.hidden || node.parentKey !== null && hidden.has(node.parentKey)) hidden.add(node.key);
  }
  for (let index = source.length - 1; index >= 0; index--) {
    const node = source[index]!;
    if (hidden.has(node.key)) continue;
    const count = node.expandable ? counts.get(node.key) ?? 0 : 1;
    counts.set(node.key, count);
    if (node.parentKey !== null) counts.set(node.parentKey, (counts.get(node.parentKey) ?? 0) + count);
  }
  const tree = source.filter(node => counts.get(node.key));
  const depth = tree.reduce((max, node) => Math.max(max, node.depth + 1), 0);
  const rows: TableHeaderCell<Column>[][] = Array.from({ length: depth }, () => []);
  const leaves: Column[] = [];
  const cells = new Map<string, TableHeaderCell<Column>>();
  for (const node of tree) {
    const cell = { column: node.record, columnIndex: leaves.length, parentKey: node.parentKey,
      colSpan: node.expandable ? 0 : 1, rowSpan: node.expandable ? 1 : depth - node.depth };
    cells.set(node.key, cell);
    rows[node.depth]!.push(cell);
    if (!node.expandable) leaves.push(node.record);
  }
  for (let index = tree.length - 1; index >= 0; index--) {
    const node = tree[index]!;
    if (node.parentKey !== null) cells.get(node.parentKey)!.colSpan += cells.get(node.key)!.colSpan;
  }
  return { columns: leaves, rows };
}
