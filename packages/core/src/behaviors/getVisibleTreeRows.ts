export type TreeKey = string | number;
export interface VisibleTreeRow<RecordType, Key extends TreeKey = TreeKey> {
  key: Key;
  record: RecordType;
  depth: number;
  parentKey: Key | null;
  expandable: boolean;
  expanded: boolean;
}
export interface VisibleTreeRowsOptions<RecordType, Key extends TreeKey = TreeKey> {
  getKey: (record: RecordType) => Key;
  getChildren: (record: RecordType) => readonly RecordType[] | null | undefined;
  expandedKeys?: readonly Key[];
}

export function getVisibleTreeRows<RecordType, Key extends TreeKey = TreeKey>(
  records: readonly RecordType[],
  { getKey, getChildren, expandedKeys = [] }: VisibleTreeRowsOptions<RecordType, Key>,
): VisibleTreeRow<RecordType, Key>[] {
  const expanded = new Set(expandedKeys);
  const seen = new Set<Key>();
  const rows: VisibleTreeRow<RecordType, Key>[] = [];
  const stack: { record: RecordType; depth: number; parentKey: Key | null; visible: boolean }[] = [];
  for (let i = records.length - 1; i >= 0; i--) stack.push({ record: records[i], depth: 0, parentKey: null, visible: true });
  while (stack.length) {
    const { record, depth, parentKey, visible } = stack.pop()!;
    const key = getKey(record);
    if (typeof key !== 'string' && (typeof key !== 'number' || !Number.isFinite(key))) throw new TypeError('Tree keys must be strings or finite numbers.');
    if (seen.has(key)) throw new TypeError('Tree keys must be unique; duplicate or cyclic node.');
    seen.add(key);
    const children = getChildren(record);
    if (children != null && !Array.isArray(children)) throw new TypeError('Tree children must be an array, null or undefined.');
    const expandable = (children?.length ?? 0) > 0;
    const open = expandable && expanded.has(key);
    if (visible) rows.push({ key, record, depth, parentKey, expandable, expanded: open });
    if (children) for (let i = children.length - 1; i >= 0; i--) {
      stack.push({ record: children[i], depth: depth + 1, parentKey: key, visible: visible && open });
    }
  }
  return rows;
}
