import { getTreeRows } from './getVisibleTreeRows.ts';
import type { TreeKey, VisibleTreeRow, VisibleTreeRowsOptions } from './getVisibleTreeRows.ts';

export interface TreeSearchOptions<
  RecordType,
  Key extends TreeKey = TreeKey,
> extends VisibleTreeRowsOptions<RecordType, Key> {
  getLabel(record: RecordType): string;
  searchValue?: string;
  filterNode?: (text: string, record: RecordType) => boolean;
  searchExpandedKeys?: readonly Key[];
}

export interface TreeSearchResult<RecordType, Key extends TreeKey = TreeKey> {
  allRows: VisibleTreeRow<RecordType, Key>[];
  rows: VisibleTreeRow<RecordType, Key>[];
  includedKeys: Key[];
  matchedKeys: Key[];
  expandedKeys: Key[];
}

export function getTreeSearchRows<RecordType, Key extends TreeKey>(
  records: readonly RecordType[],
  options: TreeSearchOptions<RecordType, Key>,
): TreeSearchResult<RecordType, Key> {
  const allRows = getTreeRows(records, options, true);
  const text = options.searchValue === undefined ? '' : options.searchValue;
  if (typeof text !== 'string') throw new TypeError('Tree search must be a string.');
  const query = text.trim();
  const folded = query.toLowerCase();
  const matchedKeys: Key[] = [];
  for (const row of allRows) {
    const label = options.getLabel(row.record);
    if (typeof label !== 'string') throw new TypeError('Tree labels must be strings.');
    if (!query) continue;
    const match = options.filterNode
      ? options.filterNode(query, row.record)
      : label.toLowerCase().includes(folded);
    if (typeof match !== 'boolean') throw new TypeError('Tree filter must return a boolean.');
    if (match) matchedKeys.push(row.key);
  }
  const byKey = new Map(allRows.map((row) => [row.key, row]));
  const included = new Set<Key>();
  if (query) {
    for (const key of matchedKeys) {
      let row = byKey.get(key);
      while (row && !included.has(row.key)) {
        included.add(row.key);
        row = row.parentKey === null ? undefined : byKey.get(row.parentKey);
      }
    }
  } else {
    for (const row of allRows) included.add(row.key);
  }
  const retained = allRows.filter((row) => included.has(row.key));
  const branches = new Set<Key>();
  for (const row of retained) {
    if (row.parentKey !== null) branches.add(row.parentKey);
  }
  const expandedKeys = [
    ...new Set(
      query ? (options.searchExpandedKeys ?? [...branches]) : (options.expandedKeys ?? []),
    ),
  ];
  const expanded = new Set(expandedKeys);
  const visible = new Set<Key>();
  const rows: VisibleTreeRow<RecordType, Key>[] = [];
  for (const row of retained) {
    if (row.parentKey !== null && (!visible.has(row.parentKey) || !expanded.has(row.parentKey)))
      continue;
    visible.add(row.key);
    const expandable = branches.has(row.key);
    rows.push({ ...row, expandable, expanded: expandable && expanded.has(row.key) });
  }
  return { allRows, rows, includedKeys: retained.map((row) => row.key), matchedKeys, expandedKeys };
}
