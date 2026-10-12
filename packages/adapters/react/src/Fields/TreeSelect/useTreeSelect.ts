import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getSelectionValue, getTreeCheckState, getTreeSearchRows } from '@dreadnought/core';
import type { TreeKey } from '@dreadnought/core';
import type {
  TreeSelectValue,
  UseTreeSelectOptions,
  UseTreeSelectResult,
} from './treeSelect.types.ts';
import { treeSelectTags, treeSelectValues } from './treeSelectState.ts';

export function useTreeSelect<RecordType, Key extends TreeKey>(
  options: UseTreeSelectOptions<RecordType, Key>,
): UseTreeSelectResult<RecordType, Key> {
  const multiple = Boolean(options.multiple);
  const searchOptions = typeof options.showSearch === 'object' ? options.showSearch : undefined;
  const initial =
    options.value !== undefined
      ? options.value
      : options.defaultValue === undefined
        ? multiple
          ? []
          : null
        : options.defaultValue;
  const [view, setView] = useState(() => ({
    value: initial as TreeSelectValue<Key>,
    expanded: options.defaultExpandedKeys ?? [],
    search: searchOptions?.defaultSearchValue ?? '',
    searchExpansion: null as { query: string; keys: readonly Key[] } | null,
    open: Boolean(options.defaultOpen && !options.disabled),
  }));
  const current = useRef(view);
  const latest = useRef(options);
  latest.current = options;
  const mounted = useRef(true);
  const value = options.value !== undefined ? options.value : view.value;
  const values = useMemo(() => treeSelectValues(value, multiple), [value, multiple]);
  const searchValue = options.showSearch ? (searchOptions?.searchValue ?? view.search) : '';
  const expanded = options.expandedKeys ?? view.expanded;
  const projection = useMemo(
    () =>
      getTreeSearchRows(options.records, {
        getKey: options.getKey,
        getChildren: options.getChildren,
        getLabel: options.getLabel,
        expandedKeys: expanded,
        searchValue,
        filterNode: searchOptions?.filterNode,
        searchExpandedKeys:
          view.searchExpansion?.query === searchValue ? view.searchExpansion.keys : undefined,
      }),
    [
      options.records,
      options.getKey,
      options.getChildren,
      options.getLabel,
      expanded,
      searchValue,
      searchOptions?.filterNode,
      view.searchExpansion,
    ],
  );
  const byKey = useMemo(
    () => new Map(projection.allRows.map((row) => [row.key, row])),
    [projection.allRows],
  );
  const index = useRef(byKey);
  index.current = byKey;
  const checks = useMemo(
    () =>
      getTreeCheckState(options.records, {
        getKey: options.getKey,
        getChildren: options.getChildren,
        checkedKeys: multiple ? values : [],
        checkStrictly: options.checkStrictly,
        getDisabled: (record) =>
          Boolean(options.getDisabled?.(record) || options.getCheckDisabled?.(record)),
      }),
    [
      options.records,
      options.getKey,
      options.getChildren,
      values,
      multiple,
      options.checkStrictly,
      options.getDisabled,
      options.getCheckDisabled,
    ],
  );
  const tags = treeSelectTags(
    projection.allRows,
    multiple ? checks.checkedKeys : values,
    options.getLabel,
    multiple && !options.checkStrictly,
    (record) => Boolean(options.getDisabled?.(record) || options.getCheckDisabled?.(record)),
  );

  function update(patch: Partial<typeof view>) {
    if (!mounted.current) return;
    current.current = { ...current.current, ...patch };
    setView(current.current);
  }
  function accepted() {
    return latest.current.value !== undefined ? latest.current.value : current.current.value;
  }
  function blocked() {
    return !mounted.current || latest.current.disabled || latest.current.readOnly;
  }
  function checkBlocked(record: RecordType) {
    return Boolean(
      latest.current.getDisabled?.(record) || latest.current.getCheckDisabled?.(record),
    );
  }
  function publish(next: TreeSelectValue<Key>) {
    if (blocked()) return;
    const opts = latest.current;
    const nextKeys = treeSelectValues(next, Boolean(opts.multiple));
    const before = treeSelectValues(accepted(), Boolean(opts.multiple));
    if (before.length === nextKeys.length && before.every((key, i) => key === nextKeys[i])) return;
    if (opts.value === undefined)
      update({ value: opts.multiple ? [...nextKeys] : (nextKeys[0] ?? null) });
    if (opts.multiple) opts.onValueChange?.([...nextKeys]);
    else opts.onValueChange?.(nextKeys[0] ?? null);
  }
  function setOpen(open: boolean) {
    const opts = latest.current;
    if (!mounted.current || (open && opts.disabled) || open === (opts.open ?? current.current.open))
      return;
    if (opts.open === undefined) update({ open });
    opts.onOpenChange?.(open);
  }
  function select(key: Key) {
    const opts = latest.current;
    const row = index.current.get(key);
    if (
      blocked() ||
      opts.multiple ||
      !row ||
      opts.getDisabled?.(row.record) ||
      opts.getSelectable?.(row.record) === false
    )
      return;
    publish(key);
    setOpen(false);
  }
  function check(key: Key, checked: boolean) {
    const opts = latest.current;
    const row = index.current.get(key);
    if (blocked() || !opts.multiple || !row || checkBlocked(row.record)) return;
    publish(
      getTreeCheckState(opts.records, {
        getKey: opts.getKey,
        getChildren: opts.getChildren,
        checkedKeys: treeSelectValues(accepted(), true),
        checkStrictly: opts.checkStrictly,
        getDisabled: checkBlocked,
        action: { key, checked },
      }).checkedKeys,
    );
  }
  function remove(key: Key) {
    if (blocked()) return;
    const opts = latest.current;
    const row = index.current.get(key);
    if (row && (opts.getDisabled?.(row.record) || (opts.multiple && checkBlocked(row.record))))
      return;
    if (opts.multiple && row) check(key, false);
    else {
      const keys = treeSelectValues(accepted(), Boolean(opts.multiple));
      if (!keys.includes(key)) return;
      publish(opts.multiple ? getSelectionValue(keys, { type: 'deselect', value: key }) : null);
    }
  }
  function clear() {
    if (latest.current.allowClear !== false) publish(latest.current.multiple ? [] : null);
  }
  function acceptedSearch() {
    const opts = latest.current;
    const config = typeof opts.showSearch === 'object' ? opts.showSearch : undefined;
    return opts.showSearch ? (config?.searchValue ?? current.current.search) : '';
  }
  function setSearch(text: string) {
    const opts = latest.current;
    if (blocked() || !opts.showSearch) return;
    if (typeof text !== 'string') throw new TypeError('Tree search must be a string.');
    const config = typeof opts.showSearch === 'object' ? opts.showSearch : undefined;
    if (text !== acceptedSearch()) {
      if (config?.searchValue === undefined) update({ search: text, searchExpansion: null });
      config?.onSearch?.(text);
    }
    setOpen(true);
  }
  function setExpanded(key: Key, open: boolean) {
    const opts = latest.current;
    const row = index.current.get(key);
    if (!mounted.current || opts.disabled || !row?.expandable || opts.getDisabled?.(row.record))
      return;
    const query = acceptedSearch();
    const config = typeof opts.showSearch === 'object' ? opts.showSearch : undefined;
    const found = getTreeSearchRows(opts.records, {
      getKey: opts.getKey,
      getChildren: opts.getChildren,
      getLabel: opts.getLabel,
      expandedKeys: opts.expandedKeys ?? current.current.expanded,
      searchValue: query,
      filterNode: config?.filterNode,
      searchExpandedKeys:
        current.current.searchExpansion?.query === query
          ? current.current.searchExpansion.keys
          : undefined,
    });
    if (found.expandedKeys.includes(key) === open) return;
    const keys = getSelectionValue(found.expandedKeys, {
      type: open ? 'select' : 'deselect',
      value: key,
    });
    if (query.trim()) update({ searchExpansion: { query, keys } });
    else {
      if (opts.expandedKeys === undefined) update({ expanded: keys });
      opts.onExpandedKeysChange?.([...keys]);
    }
  }
  function reset() {
    if (!mounted.current) return;
    const opts = latest.current;
    update({
      value:
        opts.value !== undefined
          ? opts.value
          : opts.defaultValue === undefined
            ? opts.multiple
              ? []
              : null
            : opts.defaultValue,
      search: '',
      searchExpansion: null,
      expanded: opts.defaultExpandedKeys ?? [],
      open: Boolean(opts.defaultOpen && !opts.disabled),
    });
  }
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    if (options.disabled && current.current.open) update({ open: false });
  }, [options.disabled]);
  return {
    value,
    values,
    ...projection,
    ...checks,
    tags,
    searchValue,
    open: Boolean((options.open ?? view.open) && !options.disabled),
    multiple,
    checkStrictly: Boolean(options.checkStrictly),
    disabled: Boolean(options.disabled),
    readOnly: Boolean(options.readOnly),
    invalid: Boolean(options.invalid),
    select,
    check,
    remove,
    clear,
    reset,
    setExpanded,
    setSearch,
    setOpen,
  };
}
