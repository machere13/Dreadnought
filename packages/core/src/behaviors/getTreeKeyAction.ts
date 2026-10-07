import type { TreeKey, VisibleTreeRow } from './getVisibleTreeRows.ts';
import { getNavigationDirection } from './getNavigationDirection.ts';

export type TreeKeyAction<Key extends TreeKey = TreeKey> =
  | { type: 'focus'; key: Key }
  | { type: 'expand'; key: Key; expanded: boolean };

export function getTreeKeyAction<RecordType, Key extends TreeKey>(
  rows: readonly VisibleTreeRow<RecordType, Key>[], currentKey: Key, key: string,
): TreeKeyAction<Key> | undefined {
  const index = rows.findIndex(row => row.key === currentKey);
  if (index < 0) return;
  const row = rows[index];
  const direction = getNavigationDirection(key);
  if (direction) {
    const nextIndex = direction === 'first' ? 0 : direction === 'last' ? rows.length - 1
      : index + (direction === 'next' ? 1 : -1);
    if (nextIndex === index || nextIndex < 0 || nextIndex >= rows.length) return;
    return { type: 'focus', key: rows[nextIndex].key };
  }
  if (key === 'ArrowRight') {
    if (!row.expandable) return;
    if (!row.expanded) return { type: 'expand', key: currentKey, expanded: true };
    const child = rows[index + 1];
    if (child?.parentKey === currentKey) return { type: 'focus', key: child.key };
  }
  if (key === 'ArrowLeft') {
    if (row.expanded) return { type: 'expand', key: currentKey, expanded: false };
    if (row.parentKey !== null && rows.some(item => item.key === row.parentKey))
      return { type: 'focus', key: row.parentKey };
  }
  if ((key === 'Enter' || key === ' ') && row.expandable)
    return { type: 'expand', key: currentKey, expanded: !row.expanded };
}
