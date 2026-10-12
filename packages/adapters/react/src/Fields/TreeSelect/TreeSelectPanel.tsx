import { useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { getTreeKeyAction } from '@dreadnought/core';
import type { TreeKey } from '@dreadnought/core';
import type { TreeSelectAdapterProps, UseTreeSelectResult } from './treeSelect.types.ts';

interface PanelProps<RecordType, Key extends TreeKey> {
  model: UseTreeSelectResult<RecordType, Key>;
  options: TreeSelectAdapterProps<RecordType, Key>;
  tree: RefObject<HTMLUListElement | null>;
  focusRequested: RefObject<boolean>;
  choose(key: Key): void;
}

export function TreeSelectPanel<RecordType, Key extends TreeKey>({
  model,
  options,
  tree,
  focusRequested,
  choose,
}: PanelProps<RecordType, Key>) {
  const nodes = useRef(new Map<Key, HTMLLIElement>());
  const parents = useRef(new Map<Key, Key | null>());
  const lostFocus = useRef<HTMLLIElement | null>(null);
  const available = model.rows.filter((row) => !options.getDisabled?.(row.record));
  const [active, setActive] = useState<Key | undefined>(available[0]?.key);
  const slots = options.slotClassNames ?? {};

  function focus(key: Key | undefined) {
    setActive(key);
    const node = key === undefined ? tree.current : nodes.current.get(key);
    node?.focus({ preventScroll: true });
    const viewport = tree.current?.parentElement;
    if (!node || !viewport) return;
    const item = node.getBoundingClientRect();
    const bounds = viewport.getBoundingClientRect();
    if (item.top < bounds.top) viewport.scrollTop += item.top - bounds.top;
    else if (item.bottom > bounds.bottom) viewport.scrollTop += item.bottom - bounds.bottom;
  }

  useEffect(() => {
    let next = active;
    const keys = new Set(available.map((row) => row.key));
    while (next !== undefined && !keys.has(next)) {
      next = parents.current.get(next) ?? undefined;
    }
    next ??= available[0]?.key;
    const removed = lostFocus.current;
    lostFocus.current = null;
    const doc = tree.current?.ownerDocument;
    const restore =
      removed &&
      !removed.isConnected &&
      (doc?.activeElement === doc?.body || doc?.activeElement === tree.current);
    const disabledFocus =
      next !== active && active !== undefined && doc?.activeElement === nodes.current.get(active);
    if (focusRequested.current || restore || disabledFocus) {
      focusRequested.current = false;
      focus(next);
    } else if (next !== active) setActive(next);
    parents.current = new Map(model.allRows.map((row) => [row.key, row.parentKey]));
  });

  const groups = new Map<Key | null, ReactNode[]>();
  for (const row of [...model.rows].reverse()) {
    const label = options.getLabel(row.record);
    const disabled = Boolean(options.getDisabled?.(row.record));
    const checked = model.checkedKeys.includes(row.key);
    const mixed = model.halfCheckedKeys.includes(row.key);
    const children = groups.get(row.key);
    const item = (
      <li
        key={`${typeof row.key}:${row.key}`}
        role="treeitem"
        aria-label={label}
        aria-level={row.depth + 1}
        aria-expanded={row.expandable ? row.expanded : undefined}
        aria-disabled={disabled || undefined}
        aria-checked={model.multiple ? (mixed ? 'mixed' : checked) : undefined}
        aria-selected={!model.multiple ? model.values.includes(row.key) : undefined}
        tabIndex={!disabled && active === row.key ? 0 : -1}
        className={slots.item}
        data-slot="item"
        ref={(node) => {
          const previous = nodes.current.get(row.key);
          if (!node && previous && previous.ownerDocument.activeElement === previous)
            lostFocus.current = previous;
          if (node) nodes.current.set(row.key, node);
          else nodes.current.delete(row.key);
        }}
        onFocus={(event) => {
          if (event.target === event.currentTarget) setActive(row.key);
        }}
        onClick={(event) => {
          if (disabled || event.defaultPrevented || event.target !== event.currentTarget) return;
          focus(row.key);
          if (model.multiple) model.check(row.key, !checked);
          else choose(row.key);
        }}
        onKeyDown={(event) => {
          if (
            event.target !== event.currentTarget ||
            event.defaultPrevented ||
            event.nativeEvent.isComposing ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            disabled
          )
            return;
          const action = getTreeKeyAction(available, row.key, event.key, {
            selectable: !model.multiple,
            checkable: model.multiple,
          });
          if (model.multiple && event.key === 'Enter') {
            event.preventDefault();
            model.check(row.key, !checked);
            return;
          }
          if (
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
          )
            event.preventDefault();
          if (!action) return;
          event.preventDefault();
          if (action.type === 'focus') focus(action.key);
          else if (action.type === 'expand') model.setExpanded(action.key, action.expanded);
          else if (action.type === 'check') model.check(action.key, !checked);
          else choose(action.key);
        }}
      >
        <div
          data-slot="content"
          className={slots.content}
          onClick={(event) => {
            if (
              disabled ||
              event.defaultPrevented ||
              (event.target as HTMLElement).closest(
                'button, input, label, select, textarea, a[href], [contenteditable="true"]',
              )
            )
              return;
            focus(row.key);
            if (model.multiple) model.check(row.key, !checked);
            else choose(row.key);
          }}
        >
          {row.expandable &&
            options.renderAction?.({
              action: 'expand',
              className: slots.indicator,
              type: 'button',
              tabIndex: -1,
              disabled,
              'aria-label': `${row.expanded ? 'Свернуть' : 'Развернуть'} ${label}`,
              onClick: () => {
                focus(row.key);
                model.setExpanded(row.key, !row.expanded);
              },
              children: row.expanded ? '−' : '+',
            })}
          {model.multiple && (
            <span data-slot="tree-checkbox">
              {options.renderCheckbox?.(
                {
                  checked,
                  indeterminate: mixed,
                  disabled:
                    disabled || model.readOnly || Boolean(options.getCheckDisabled?.(row.record)),
                  tabIndex: -1,
                  'aria-label': label,
                  onChange: (event) => {
                    focus(row.key);
                    model.check(row.key, event.target.checked);
                  },
                },
                row,
              )}
            </span>
          )}
          <span>{options.renderLabel?.(row) ?? label}</span>
        </div>
        {children && (
          <ul role="group" className={slots.group}>
            {children}
          </ul>
        )}
      </li>
    );
    const siblings = groups.get(row.parentKey) ?? [];
    siblings.unshift(item);
    groups.set(row.parentKey, siblings);
  }
  return (
    <ul
      ref={tree}
      role="tree"
      aria-label={options['aria-label']}
      aria-labelledby={options['aria-labelledby']}
      aria-multiselectable={model.multiple || undefined}
      tabIndex={available.length ? -1 : 0}
      className={slots.tree}
    >
      {groups.get(null)}
      {!model.rows.length && (
        <li role="presentation" className={slots.empty}>
          {options.emptyContent ?? 'Нет результатов'}
        </li>
      )}
    </ul>
  );
}
