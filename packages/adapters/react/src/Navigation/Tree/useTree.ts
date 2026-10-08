import { useLayoutEffect, useRef, useState } from 'react';
import { getSelectionValue, getTreeCheckState, getVisibleTreeRows } from '@dreadnought/core';
import type { TreeKey, VisibleTreeRow, VisibleTreeRowsOptions } from '@dreadnought/core';

export interface UseTreeOptions<RecordType, Key extends TreeKey = TreeKey> extends Omit<
  VisibleTreeRowsOptions<RecordType, Key>,
  'expandedKeys'
> {
  records: readonly RecordType[];
  expandedKeys?: readonly Key[];
  defaultExpandedKeys?: readonly Key[];
  onExpandedKeysChange?: (keys: Key[]) => void;
  disabled?: boolean;
  selectable?: boolean;
  multiple?: boolean;
  selectedKeys?: readonly Key[];
  defaultSelectedKeys?: readonly Key[];
  onSelectedKeysChange?: (keys: Key[]) => void;
  checkable?: boolean;
  checkStrictly?: boolean;
  checkedKeys?: readonly Key[];
  defaultCheckedKeys?: readonly Key[];
  onCheckedKeysChange?: (keys: Key[], halfCheckedKeys: Key[]) => void;
  getDisabled?: (record: RecordType) => boolean;
  getSelectable?: (record: RecordType) => boolean;
  getCheckDisabled?: (record: RecordType) => boolean;
}

export interface UseTreeResult<RecordType, Key extends TreeKey = TreeKey> {
  rows: VisibleTreeRow<RecordType, Key>[];
  expandedKeys: readonly Key[];
  selectedKeys: readonly Key[];
  checkedKeys: readonly Key[];
  halfCheckedKeys: readonly Key[];
  select(key: Key): void;
  setChecked(key: Key, checked: boolean): void;
  setExpanded(key: Key, expanded: boolean): void;
  toggle(key: Key): void;
}

export function useTree<RecordType, Key extends TreeKey = TreeKey>(
  options: UseTreeOptions<RecordType, Key>,
): UseTreeResult<RecordType, Key> {
  const {
    records,
    getKey,
    getChildren,
    expandedKeys,
    defaultExpandedKeys = [],
    disabled = false,
    onExpandedKeysChange,
  } = options;
  const [internal, setInternal] = useState<Key[]>(() => [...defaultExpandedKeys]);
  const pending = useRef(internal);
  useLayoutEffect(() => {
    pending.current = internal;
  }, [internal]);
  const expanded = expandedKeys ?? internal;
  const rows = getVisibleTreeRows(records, { getKey, getChildren, expandedKeys: expanded });
  const [selection, setSelection] = useState<Key[]>(() => [...(options.defaultSelectedKeys ?? [])]);
  const [checks, setChecks] = useState<Key[]>(() => [...(options.defaultCheckedKeys ?? [])]);
  const pendingSelection = useRef(selection);
  const pendingChecks = useRef(checks);
  useLayoutEffect(() => {
    pendingSelection.current = selection;
    pendingChecks.current = checks;
  }, [selection, checks]);
  const selected = [...new Set(options.selectedKeys ?? selection)];
  if (!options.multiple) {
    selected.splice(1);
  }
  const checkOptions = {
    getKey,
    getChildren,
    checkStrictly: options.checkStrictly,
    getDisabled: (record: RecordType) =>
      Boolean(options.getDisabled?.(record) || options.getCheckDisabled?.(record)),
  };
  const checkState = getTreeCheckState(records, {
    ...checkOptions,
    checkedKeys: options.checkedKeys ?? checks,
  });

  function select(key: Key) {
    const row = rows.find((row) => row.key === key);
    if (
      disabled ||
      !options.selectable ||
      !row ||
      options.getDisabled?.(row.record) ||
      options.getSelectable?.(row.record) === false
    ) {
      return;
    }
    const value = options.selectedKeys ?? pendingSelection.current;
    const next = options.multiple
      ? getSelectionValue(value, { type: 'toggle', value: key })
      : getSelectionValue<Key>(value[0] ?? null, { type: 'toggle', value: key });
    const keys = Array.isArray(next) ? next : next === null ? [] : [next as Key];
    if (options.selectedKeys === undefined) {
      pendingSelection.current = keys;
      setSelection(keys);
    }
    options.onSelectedKeysChange?.(keys);
  }

  function setChecked(key: Key, checked: boolean) {
    const row = rows.find((row) => row.key === key);
    if (disabled || !options.checkable || !row || checkOptions.getDisabled(row.record)) {
      return;
    }
    const checkedKeys = options.checkedKeys ?? pendingChecks.current;
    const before = getTreeCheckState(records, { ...checkOptions, checkedKeys });
    if (before.checkedKeys.includes(key) === checked && !before.halfCheckedKeys.includes(key)) {
      return;
    }
    const next = getTreeCheckState(records, {
      ...checkOptions,
      checkedKeys,
      action: { key, checked },
    });
    if (options.checkedKeys === undefined) {
      pendingChecks.current = next.checkedKeys;
      setChecks(next.checkedKeys);
    }
    options.onCheckedKeysChange?.(next.checkedKeys, next.halfCheckedKeys);
  }

  function change(key: Key, action: 'select' | 'deselect' | 'toggle') {
    if (disabled) {
      return;
    }
    const current = expandedKeys ?? pending.current;
    const visible = getVisibleTreeRows(records, { getKey, getChildren, expandedKeys: current });
    if (!visible.some((row) => row.key === key && row.expandable)) {
      return;
    }
    const selected = current.includes(key);
    if ((action === 'select' && selected) || (action === 'deselect' && !selected)) {
      return;
    }
    const next = getSelectionValue(current, { type: action, value: key });
    if (expandedKeys === undefined) {
      pending.current = next;
      setInternal(next);
    }
    onExpandedKeysChange?.(next);
  }

  return {
    rows,
    expandedKeys: expanded,
    selectedKeys: selected,
    ...checkState,
    select,
    setChecked,
    setExpanded: (key, open) => change(key, open ? 'select' : 'deselect'),
    toggle: (key) => change(key, 'toggle'),
  };
}
