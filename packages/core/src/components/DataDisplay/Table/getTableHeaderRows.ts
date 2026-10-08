import { getTreeRows } from '../../../behaviors/getVisibleTreeRows.ts';

export interface TableHeaderCell<Column> {
  column: Column;
  columnIndex: number;
  parentKey: string | null;
  colSpan: number;
  rowSpan: number;
}

export function getTableHeaderRows<Column extends { key: string; children?: readonly Column[] }>(columns: readonly Column[]) {
  const tree = getTreeRows(columns, { getKey: column => column.key, getChildren: column => column.children }, true);
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
