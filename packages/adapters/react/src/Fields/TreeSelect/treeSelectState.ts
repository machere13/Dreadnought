import type { TreeKey, VisibleTreeRow } from '@dreadnought/core';
import type { TreeSelectTag, TreeSelectValue } from './treeSelect.types.ts';

export function treeSelectValues<Key extends TreeKey>(
  value: TreeSelectValue<Key>,
  multiple: boolean,
): Key[] {
  if (multiple !== Array.isArray(value))
    throw new TypeError('TreeSelect value must match multiple mode.');
  const values = Array.isArray(value) ? value : value === null ? [] : [value as Key];
  for (const key of values) {
    if (typeof key !== 'string' && (typeof key !== 'number' || !Number.isFinite(key)))
      throw new TypeError('TreeSelect keys must be strings or finite numbers.');
  }
  return [...new Set(values)];
}

export function treeSelectTags<RecordType, Key extends TreeKey>(
  rows: readonly VisibleTreeRow<RecordType, Key>[],
  keys: readonly Key[],
  getLabel: (record: RecordType) => string,
  linked: boolean,
  blocked: (record: RecordType) => boolean,
): TreeSelectTag<RecordType, Key>[] {
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const selected = new Set(keys);
  return keys.flatMap((key) => {
    const row = byKey.get(key);
    const parent =
      row?.parentKey !== null && row?.parentKey !== undefined
        ? byKey.get(row.parentKey)
        : undefined;
    if (
      linked &&
      row &&
      parent &&
      selected.has(parent.key) &&
      !blocked(row.record) &&
      !blocked(parent.record)
    )
      return [];
    return [{ key, record: row?.record, label: row ? getLabel(row.record) : String(key) }];
  });
}
