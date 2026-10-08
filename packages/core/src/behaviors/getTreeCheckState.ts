import { getTreeRows } from './getVisibleTreeRows.ts';
import type { TreeKey, VisibleTreeRowsOptions } from './getVisibleTreeRows.ts';

export interface TreeCheckState<Key extends TreeKey = TreeKey> {
  checkedKeys: Key[];
  halfCheckedKeys: Key[];
}

export interface TreeCheckOptions<RecordType, Key extends TreeKey = TreeKey>
  extends Omit<VisibleTreeRowsOptions<RecordType, Key>, 'expandedKeys'> {
  checkedKeys?: readonly Key[];
  checkStrictly?: boolean;
  getDisabled?: (record: RecordType) => boolean;
  action?: { key: Key; checked: boolean };
}

export function getTreeCheckState<RecordType, Key extends TreeKey = TreeKey>(
  records: readonly RecordType[], options: TreeCheckOptions<RecordType, Key>,
): TreeCheckState<Key> {
  const rows = getTreeRows(records, options, true);
  const byKey = new Map(rows.map(row => [row.key, row]));
  const blocked = new Set(rows.filter(row => options.getDisabled?.(row.record)).map(row => row.key));
  const children = new Map<Key, Key[]>();
  for (const row of rows) if (row.parentKey !== null) {
    const siblings = children.get(row.parentKey);
    if (siblings) siblings.push(row.key); else children.set(row.parentKey, [row.key]);
  }
  const checked = new Set(options.checkedKeys ?? []);
  const half = new Set<Key>();
  if (!options.checkStrictly) for (const row of rows) {
    if (row.parentKey !== null && !blocked.has(row.key) && !blocked.has(row.parentKey)
      && checked.has(row.parentKey)) checked.add(row.key);
  }
  const action = options.action;
  if (action && byKey.has(action.key) && !blocked.has(action.key)) {
    const stack = [action.key];
    while (stack.length) {
      const key = stack.pop()!;
      if (blocked.has(key)) continue;
      if (action.checked) checked.add(key); else checked.delete(key);
      if (!options.checkStrictly) for (const child of children.get(key) ?? []) stack.push(child);
    }
    if (!action.checked && !options.checkStrictly) {
      let parent = byKey.get(action.key)!.parentKey;
      while (parent !== null && !blocked.has(parent)) {
        checked.delete(parent);
        parent = byKey.get(parent)!.parentKey;
      }
    }
  }
  if (!options.checkStrictly) for (let index = rows.length - 1; index >= 0; index--) {
    const key = rows[index].key;
    if (blocked.has(key)) continue;
    const enabled = (children.get(key) ?? []).filter(child => !blocked.has(child));
    if (!enabled.length) continue;
    if (enabled.every(child => checked.has(child))) checked.add(key);
    else {
      checked.delete(key);
      if (enabled.some(child => checked.has(child) || half.has(child))) half.add(key);
    }
  }
  return { checkedKeys: [...rows.filter(row => checked.has(row.key)).map(row => row.key),
    ...[...checked].filter(key => !byKey.has(key))],
    halfCheckedKeys: rows.filter(row => half.has(row.key)).map(row => row.key) };
}
