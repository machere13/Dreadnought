import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentPropsWithRef, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { getTreeKeyAction } from '@dreadnought/core';
import type { TreeKey, VisibleTreeRow } from '@dreadnought/core';
import { useTree } from './useTree.ts';
import type { UseTreeOptions } from './useTree.ts';

export type TreeAdapterProps<RecordType, Key extends TreeKey = TreeKey> =
  UseTreeOptions<RecordType, Key> & Omit<ComponentPropsWithRef<'ul'>, 'children'> & {
    getLabel: (record: RecordType) => string;
    renderLabel?: (row: VisibleTreeRow<RecordType, Key>) => ReactNode;
    slotClassNames?: { item?: string; content?: string; group?: string; indicator?: string };
  };

export function TreeAdapter<RecordType, Key extends TreeKey = TreeKey>({
  records, getKey, getChildren, expandedKeys, defaultExpandedKeys, onExpandedKeysChange,
  disabled = false, getLabel, renderLabel, slotClassNames, ref, onKeyDown, onClick, onFocusCapture,
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy, ...domProps
}: TreeAdapterProps<RecordType, Key>) {
  const tree = useTree({ records, getKey, getChildren, expandedKeys, defaultExpandedKeys, onExpandedKeysChange, disabled });
  const { rows } = tree;
  const root = useRef<HTMLUListElement>(null);
  useImperativeHandle(ref, () => root.current!, []);
  const elements = useRef(new Map<Key, HTMLLIElement>());
  const [focusedKey, setFocusedKey] = useState<Key | undefined>();
  const previousParents = useRef(new Map<Key, Key | null>());
  const pendingFocus = useRef<{ key: Key; element: HTMLLIElement; parents: Map<Key, Key | null> } | null>(null);
  const visible = new Set(rows.map(row => row.key));

  function fallback(key: Key | undefined, parents: Map<Key, Key | null>): Key | undefined {
    while (key !== undefined && !visible.has(key)) {
      const parent = parents.get(key);
      key = parent === null ? undefined : parent;
    }
    return key ?? rows[0]?.key;
  }
  const tabKey = fallback(focusedKey, previousParents.current);
  const parents = new Map(rows.map(row => [row.key, row.parentKey]));

  function focus(key: Key) { elements.current.get(key)?.focus(); }

  useLayoutEffect(() => {
    const pending = pendingFocus.current;
    pendingFocus.current = null;
    previousParents.current = parents;
    if (focusedKey !== tabKey) setFocusedKey(tabKey);
    if (!pending || visible.has(pending.key)) return;
    const doc = pending.element.ownerDocument;
    const active = doc.activeElement;
    if (active && active !== doc.body && active !== pending.element && active !== root.current) return;
    const next = fallback(pending.key, pending.parents);
    if (next === undefined) root.current?.focus(); else focus(next);
  });

  function ownItem(target: EventTarget | null): HTMLLIElement | undefined {
    const node = target as HTMLElement | null;
    const item = node?.closest?.('[data-slot="tree-item"]') as HTMLLIElement | null;
    return item?.closest('[role="tree"]') === root.current ? item : undefined;
  }
  function rowOf(item: HTMLLIElement) { return rows[Number(item.dataset.treeIndex)]; }
  function interactive(target: EventTarget | null): boolean {
    return Boolean((target as HTMLElement | null)?.closest?.('button,input,select,textarea,a[href],[contenteditable="true"]'));
  }
  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing || disabled
      || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || interactive(event.target)) return;
    const item = ownItem(event.target);
    if (!item || event.target !== item) return;
    const row = rowOf(item);
    const action = getTreeKeyAction(rows, row.key, event.key);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
      || ((event.key === 'Enter' || event.key === ' ') && row.expandable)) event.preventDefault();
    if (action?.type === 'focus') focus(action.key);
    if (action?.type === 'expand') tree.setExpanded(action.key, action.expanded);
  }
  function handleClick(event: MouseEvent<HTMLUListElement>) {
    onClick?.(event);
    if (event.defaultPrevented || disabled || interactive(event.target)) return;
    const item = ownItem(event.target);
    const content = (event.target as HTMLElement).closest('[data-slot="tree-content"]');
    if (!item || !content || content.closest('[data-slot="tree-item"]') !== item) return;
    const row = rowOf(item);
    focus(row.key);
    if (row.expandable) tree.toggle(row.key);
  }

  const groups = new Map<Key | null, ReactNode[]>();
  for (let index = rows.length - 1; index >= 0; index--) {
    const row = rows[index];
    const children = groups.get(row.key);
    const element = <li key={`${typeof row.key}:${row.key}`} role="treeitem" data-slot="tree-item"
      data-tree-index={index} aria-label={getLabel(row.record)} aria-level={row.depth + 1}
      aria-expanded={row.expandable ? row.expanded : undefined} tabIndex={row.key === tabKey ? 0 : -1}
      className={slotClassNames?.item} ref={node => {
        if (!node) return;
        elements.current.set(row.key, node);
        return () => {
          if (node.ownerDocument.activeElement === node)
            pendingFocus.current = { key: row.key, element: node, parents };
          if (elements.current.get(row.key) === node) elements.current.delete(row.key);
        };
      }}>
      <span data-slot="tree-content" className={slotClassNames?.content}>
        {row.expandable && <span data-slot="tree-indicator" className={slotClassNames?.indicator}
          aria-hidden="true">{row.expanded ? '▾' : '▸'}</span>}
        {renderLabel ? renderLabel(row) : getLabel(row.record)}
      </span>
      {children?.length ? <ul role="group" data-slot="tree-group"
        className={slotClassNames?.group}>{children.reverse()}</ul> : null}
    </li>;
    const siblings = groups.get(row.parentKey);
    if (siblings) siblings.push(element); else groups.set(row.parentKey, [element]);
  }
  return <ul {...domProps} ref={root} role="tree" data-ui="tree" aria-disabled={disabled || undefined}
    aria-label={labelledBy ? ariaLabel : ariaLabel ?? 'Дерево'} aria-labelledby={labelledBy}
    tabIndex={rows.length ? undefined : 0} onKeyDown={handleKeyDown} onClick={handleClick}
    onFocusCapture={event => {
      onFocusCapture?.(event);
      if (event.defaultPrevented) return;
      const item = ownItem(event.target);
      if (item && (event.target as EventTarget) === item) setFocusedKey(rowOf(item).key);
    }}>
    {groups.get(null)?.reverse()}
  </ul>;
}
