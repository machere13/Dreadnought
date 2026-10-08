import { useId, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  FocusEvent,
  MouseEvent,
  ReactNode,
} from 'react';
import {
  getNavigationDirection,
  getNextEnabledValue,
  getSelectionValue,
  getTreeKeyAction,
  getTypeaheadValue,
  getVisibleMenuRows,
} from '@dreadnought/core';
import type { NavigationItem } from '@dreadnought/core';

export interface MenuItem extends NavigationItem {
  label?: ReactNode;
  ariaLabel?: string;
  type?: 'group' | 'divider';
  children?: readonly MenuItem[];
  href?: string;
  target?: string;
  rel?: string;
}

export type MenuAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  items: readonly MenuItem[];
  mode?: 'actions' | 'navigation';
  selectedValue?: string;
  onAction?: (value: string) => void;
  openKeys?: readonly string[];
  defaultOpenKeys?: readonly string[];
  onOpenKeysChange?: (keys: string[]) => void;
  renderIndicator?: (item: MenuItem, expanded: boolean) => ReactNode;
  slotProps?: {
    item?: ComponentPropsWithoutRef<'button'>;
    link?: ComponentPropsWithoutRef<'a'>;
    group?: ComponentPropsWithoutRef<'div'>;
    groupLabel?: ComponentPropsWithoutRef<'span'>;
    submenu?: ComponentPropsWithoutRef<'div'>;
    divider?: ComponentPropsWithoutRef<'div'>;
    indicator?: ComponentPropsWithoutRef<'span'>;
  };
};

const getKind = (item: MenuItem) => item.type ?? (item.children ? 'submenu' : 'item');
const projection = {
  getKey: (item: MenuItem) => item.value,
  getChildren: (item: MenuItem) => item.children,
  getKind,
  getDisabled: (item: MenuItem) => Boolean(item.disabled),
};

export function MenuAdapter({
  items,
  mode = 'actions',
  selectedValue,
  onAction,
  openKeys,
  defaultOpenKeys = [],
  onOpenKeysChange,
  renderIndicator,
  slotProps = {},
  onKeyDown,
  onBlur,
  ref,
  ...props
}: MenuAdapterProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => root.current!);
  const [internalOpen, setInternalOpen] = useState<string[]>(() => [...defaultOpenKeys]);
  const pendingOpen = useRef(internalOpen);
  const [focusedValue, setFocusedValue] = useState(selectedValue);
  const search = useRef({ query: '', time: 0 });
  const rows = getVisibleMenuRows(items, { ...projection, expandedKeys: openKeys ?? internalOpen });
  const navigable = rows.filter((row) => row.kind === 'item' || row.kind === 'submenu');
  const buttons = useRef(new Map<string, HTMLButtonElement | HTMLAnchorElement>());
  const parents = new Map(rows.map((row) => [row.key, row.parentKey]));
  const navigationParents = new Map<string, string | null>();
  for (const row of rows) {
    navigationParents.set(
      row.key,
      row.kind === 'group'
        ? row.parentKey === null
          ? null
          : navigationParents.get(row.parentKey)!
        : row.key,
    );
  }
  const keyRows = navigable.map((row) => ({
    ...row,
    parentKey: row.parentKey === null ? null : navigationParents.get(row.parentKey)!,
  }));
  const pendingFocus = useRef<{
    key: string;
    element: HTMLElement;
    parents: Map<string, string | null>;
  } | null>(null);
  const tabStop =
    navigable.find((row) => !row.disabled && row.key === focusedValue)?.key ??
    navigable.find((row) => !row.disabled && row.key === selectedValue)?.key ??
    navigable.find((row) => !row.disabled)?.key;
  const current = useRef({ rows, keyRows, mode, items, openKeys, onOpenKeysChange, onAction });
  useLayoutEffect(() => {
    current.current = { rows, keyRows, mode, items, openKeys, onOpenKeysChange, onAction };
    pendingOpen.current = internalOpen;
    const pending = pendingFocus.current;
    pendingFocus.current = null;
    if (!pending || pending.element.isConnected) {
      return;
    }
    const doc = pending.element.ownerDocument;
    if (
      doc.activeElement &&
      doc.activeElement !== doc.body &&
      doc.activeElement !== pending.element
    ) {
      return;
    }
    let key: string | null = pending.key;
    while (key !== null && !buttons.current.has(key)) {
      key = pending.parents.get(key) ?? null;
    }
    const target = key === null ? tabStop : key;
    if (target) {
      buttons.current.get(target)?.focus();
    } else {
      root.current?.focus();
    }
  });

  function setExpanded(key: string, expanded: boolean) {
    const latest = current.current;
    const keys = latest.openKeys ?? pendingOpen.current;
    const row = getVisibleMenuRows(latest.items, { ...projection, expandedKeys: keys }).find(
      (row) => row.key === key,
    );
    if (!row || row.kind !== 'submenu' || row.disabled || keys.includes(key) === expanded) {
      return;
    }
    const next = getSelectionValue(keys, { type: expanded ? 'select' : 'deselect', value: key });
    if (latest.openKeys === undefined) {
      pendingOpen.current = next;
      setInternalOpen(next);
    }
    latest.onOpenKeysChange?.(next);
  }
  const groups = new Map<string | null, ReactNode[]>();
  for (let index = rows.length - 1; index >= 0; index--) {
    const row = rows[index];
    const item = row.record;
    const children = groups.get(row.key)?.reverse();
    let element: ReactNode;
    if (row.kind === 'divider') {
      element = (
        <div {...slotProps.divider} key={row.key} role="separator" data-slot="menu-divider" />
      );
    } else if (row.kind === 'group') {
      element = (
        <div
          {...slotProps.group}
          key={row.key}
          role="group"
          aria-labelledby={`${id}-label-${index}`}
          data-slot="menu-group"
        >
          <span {...slotProps.groupLabel} id={`${id}-label-${index}`} data-slot="menu-group-label">
            {item.ariaLabel ?? item.label}
          </span>
          {children}
        </div>
      );
    } else {
      const submenu = row.kind === 'submenu';
      const link = !submenu && item.href !== undefined;
      const attributes = {
        'data-slot': 'menu-item',
        'data-menu-value': row.key,
        'data-menu-disabled': row.disabled ? '' : undefined,
        role:
          mode === 'navigation'
            ? undefined
            : submenu || selectedValue === undefined
              ? 'menuitem'
              : 'menuitemradio',
        'aria-checked':
          mode === 'actions' && !submenu && selectedValue !== undefined
            ? selectedValue === row.key
            : undefined,
        'aria-current':
          mode === 'navigation' && !submenu && selectedValue === row.key
            ? ('page' as const)
            : undefined,
        'aria-expanded': submenu ? row.expanded : undefined,
        'aria-controls': submenu && row.expanded ? `${id}-submenu-${index}` : undefined,
        'aria-label': item.ariaLabel,
        'aria-disabled': row.disabled || undefined,
        tabIndex: row.disabled ? -1 : mode === 'navigation' || row.key === tabStop ? 0 : -1,
      };
      const contents = (
        <>
          <span data-slot="menu-label">{item.label}</span>
          {submenu && (
            <span {...slotProps.indicator} data-slot="menu-indicator" aria-hidden="true">
              {renderIndicator ? renderIndicator(item, row.expanded) : row.expanded ? '▾' : '▸'}
            </span>
          )}
        </>
      );
      const handlers = {
        onFocus: (event: FocusEvent<HTMLButtonElement | HTMLAnchorElement>) => {
          if (link) {
            slotProps.link?.onFocus?.(event as FocusEvent<HTMLAnchorElement>);
          } else {
            slotProps.item?.onFocus?.(event as FocusEvent<HTMLButtonElement>);
          }
          if (!event.defaultPrevented) {
            setFocusedValue(row.key);
          }
        },
        onClick: (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
          if (link) {
            slotProps.link?.onClick?.(event as MouseEvent<HTMLAnchorElement>);
          } else {
            slotProps.item?.onClick?.(event as MouseEvent<HTMLButtonElement>);
          }
          if (event.defaultPrevented) {
            return;
          }
          const initial = current.current.rows.find((candidate) => candidate.key === row.key);
          if (!initial || initial.disabled) {
            event.preventDefault();
            return;
          }
          event.currentTarget.focus();
          const latest = current.current.rows.find((candidate) => candidate.key === row.key);
          if (!latest || latest.disabled) {
            event.preventDefault();
            return;
          }
          if (latest.kind === 'submenu') {
            setExpanded(row.key, !latest.expanded);
          } else {
            current.current.onAction?.(row.key);
          }
        },
      };
      const controlRef = (node: HTMLButtonElement | HTMLAnchorElement | null) => {
        if (!node) {
          return;
        }
        buttons.current.set(row.key, node);
        return () => {
          if (node.ownerDocument.activeElement === node) {
            pendingFocus.current = { key: row.key, element: node, parents };
          }
          if (buttons.current.get(row.key) === node) {
            buttons.current.delete(row.key);
          }
        };
      };
      const control = link ? (
        <a
          {...slotProps.link}
          {...attributes}
          {...handlers}
          ref={controlRef}
          href={row.disabled ? undefined : item.href}
          target={item.target}
          rel={item.rel ?? (item.target === '_blank' ? 'noopener noreferrer' : undefined)}
        >
          {contents}
        </a>
      ) : (
        <button
          {...slotProps.item}
          {...attributes}
          {...handlers}
          ref={controlRef}
          type="button"
          disabled={row.disabled}
        >
          {contents}
        </button>
      );
      element = (
        <div key={row.key} role="presentation" data-slot="menu-entry">
          {control}
          {children && (
            <div
              {...slotProps.submenu}
              id={`${id}-submenu-${index}`}
              role="group"
              data-slot="menu-submenu"
            >
              {children}
            </div>
          )}
        </div>
      );
    }
    const siblings = groups.get(row.parentKey);
    if (siblings) {
      siblings.push(element);
    } else {
      groups.set(row.parentKey, [element]);
    }
  }
  return (
    <div
      data-ui="menu"
      data-slot="menu"
      {...props}
      ref={root}
      role={mode === 'navigation' ? 'navigation' : 'menu'}
      onBlur={(event) => {
        onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget)) {
          search.current.query = '';
        }
      }}
      onKeyDown={(event) => {
        const target = event.target as HTMLElement;
        const key = target.getAttribute('data-menu-value');
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          event.nativeEvent.isComposing ||
          event.ctrlKey ||
          event.altKey ||
          event.metaKey ||
          event.shiftKey ||
          !key ||
          buttons.current.get(key) !== target
        ) {
          return;
        }
        const latest = current.current;
        const direction = getNavigationDirection(event.key);
        const action = getTreeKeyAction(
          latest.keyRows.filter((row) => !row.disabled),
          key,
          event.key,
        );
        let next: string | undefined;
        if (direction) {
          search.current.query = '';
          next = getNextEnabledValue(
            latest.keyRows.map((row) => ({ value: row.key, disabled: row.disabled })),
            key,
            direction,
          );
        } else if (action?.type === 'focus') {
          next = action.key;
        } else if (action?.type === 'expand') {
          event.preventDefault();
          setExpanded(action.key, action.expanded);
          return;
        } else if (event.key.length === 1 && event.key !== ' ') {
          const now = Date.now();
          const letter = event.key.toLowerCase();
          const previous = now - search.current.time > 500 ? '' : search.current.query;
          const query = previous === letter ? letter : previous + letter;
          search.current = { query, time: now };
          next = getTypeaheadValue(
            latest.keyRows.map((row) => ({
              value: row.key,
              disabled: row.disabled,
              text:
                buttons.current.get(row.key)?.getAttribute('aria-label') ??
                buttons.current.get(row.key)?.textContent ??
                '',
            })),
            key,
            query,
            { includeCurrent: query.length > 1 },
          );
        } else {
          return;
        }
        event.preventDefault();
        if (next) {
          buttons.current.get(next)?.focus();
        }
      }}
    >
      {groups.get(null)?.reverse()}
    </div>
  );
}
