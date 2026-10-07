import { useLayoutEffect, useRef, useState } from 'react';
import { getSelectionValue, getVisibleTreeRows } from '@dreadnought/core';
import type { TreeKey, VisibleTreeRow, VisibleTreeRowsOptions } from '@dreadnought/core';

export interface UseTreeOptions<RecordType, Key extends TreeKey = TreeKey>
  extends Omit<VisibleTreeRowsOptions<RecordType, Key>, 'expandedKeys'> {
  records: readonly RecordType[];
  expandedKeys?: readonly Key[];
  defaultExpandedKeys?: readonly Key[];
  onExpandedKeysChange?: (keys: Key[]) => void;
  disabled?: boolean;
}

export interface UseTreeResult<RecordType, Key extends TreeKey = TreeKey> {
  rows: VisibleTreeRow<RecordType, Key>[];
  expandedKeys: readonly Key[];
  setExpanded(key: Key, expanded: boolean): void;
  toggle(key: Key): void;
}

export function useTree<RecordType, Key extends TreeKey = TreeKey>(
  options: UseTreeOptions<RecordType, Key>,
): UseTreeResult<RecordType, Key> {
  const { records, getKey, getChildren, expandedKeys, defaultExpandedKeys = [], disabled = false,
    onExpandedKeysChange } = options;
  const [internal, setInternal] = useState<Key[]>(() => [...defaultExpandedKeys]);
  const pending = useRef(internal);
  useLayoutEffect(() => { pending.current = internal; }, [internal]);
  const expanded = expandedKeys ?? internal;
  const rows = getVisibleTreeRows(records, { getKey, getChildren, expandedKeys: expanded });

  function change(key: Key, action: 'select' | 'deselect' | 'toggle') {
    if (disabled) return;
    const current = expandedKeys ?? pending.current;
    const visible = getVisibleTreeRows(records, { getKey, getChildren, expandedKeys: current });
    if (!visible.some(row => row.key === key && row.expandable)) return;
    const selected = current.includes(key);
    if ((action === 'select' && selected) || (action === 'deselect' && !selected)) return;
    const next = getSelectionValue(current, { type: action, value: key });
    if (expandedKeys === undefined) { pending.current = next; setInternal(next); }
    onExpandedKeysChange?.(next);
  }

  return { rows, expandedKeys: expanded,
    setExpanded: (key, open) => change(key, open ? 'select' : 'deselect'),
    toggle: key => change(key, 'toggle') };
}
