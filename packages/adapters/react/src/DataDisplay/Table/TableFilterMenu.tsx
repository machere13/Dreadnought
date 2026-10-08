import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { getSelectionValue } from '@dreadnought/core';
import type { TableColumn, TableFilterSlots, TableFilterValue } from './table.types.ts';
import { useAnchoredPopover } from '../../shared/useAnchoredPopover.ts';

export function TableFilterMenu<RecordType extends object>({
  column,
  values,
  slots,
  onApply,
}: {
  column: TableColumn<RecordType>;
  values: readonly TableFilterValue[];
  onApply: (values: TableFilterValue[]) => void;
  slots?: TableFilterSlots;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TableFilterValue[]>([...values]);
  const pendingDraft = useRef(draft);
  const [search, setSearch] = useState('');
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLSpanElement>(null);
  useAnchoredPopover(open, trigger, popup);
  useEffect(() => {
    if (open && (column.filterSearch || column.filterDropdown)) {
      popup.current
        ?.querySelector<HTMLElement>(
          'input:not([disabled]), button:not([disabled]), [tabindex="0"]',
        )
        ?.focus();
    }
  }, [open]);
  useEffect(() => {
    const node = popup.current;
    if (!open || !node || typeof node.showPopover === 'function') {
      return;
    }
    function dismiss(event: PointerEvent) {
      if (root.current && !event.composedPath().includes(root.current)) {
        setOpen(false);
      }
    }
    node.ownerDocument.addEventListener('pointerdown', dismiss);
    return () => node.ownerDocument.removeEventListener('pointerdown', dismiss);
  }, [open]);
  if (!column.filters?.length && !column.filterDropdown) {
    return null;
  }

  const title = String(column.title ?? column.key);
  function close(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) {
      trigger.current?.focus();
    }
  }
  function setSelectedKeys(keys: readonly TableFilterValue[]) {
    pendingDraft.current = [...keys];
    setDraft(pendingDraft.current);
  }
  function confirm({ closeDropdown = true } = {}) {
    onApply([...pendingDraft.current]);
    if (closeDropdown) {
      close(true);
    }
  }
  function clearFilters({ confirm: apply = true, closeDropdown = true } = {}) {
    setSelectedKeys([]);
    if (apply) {
      onApply([]);
    }
    if (closeDropdown) {
      close(true);
    }
  }
  const options = (column.filters ?? []).filter(
    (option) =>
      !search.trim() ||
      !column.filterSearch ||
      (typeof column.filterSearch === 'function'
        ? column.filterSearch(search, option)
        : option.text.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())),
  );
  const searchProps = {
    type: 'search' as const,
    'aria-label': `Поиск вариантов ${title}`,
    value: search,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value),
  };
  const resetProps = {
    type: 'button' as const,
    onClick: () => clearFilters(),
    children: 'Сбросить',
  };
  const applyProps = { type: 'button' as const, onClick: () => confirm(), children: 'Применить' };

  return (
    <span
      ref={root}
      data-slot="filter-control"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          close();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        data-slot="filter-trigger"
        data-filtered={values.length > 0}
        aria-label={`Фильтр ${title}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={id}
        popoverTarget={id}
        onClick={(event) => {
          event.preventDefault();
          setSelectedKeys(values);
          setSearch('');
          setOpen(!open);
        }}
      >
        {slots?.icon ?? <span aria-hidden="true">⌄</span>}
      </button>
      {open && (
        <span
          ref={popup}
          id={id}
          popover="auto"
          role="dialog"
          aria-label={`Фильтр ${title}`}
          data-slot="filter-menu"
          onToggle={(event) => {
            if (event.newState === 'closed') {
              close();
            }
          }}
          onKeyDown={(event) => {
            if (
              !event.defaultPrevented &&
              !event.nativeEvent.isComposing &&
              event.key === 'Escape' &&
              (event.target as Element).closest('[popover]') === event.currentTarget
            ) {
              event.preventDefault();
              close(true);
            }
          }}
        >
          {column.filterDropdown ? (
            column.filterDropdown({
              selectedKeys: draft,
              setSelectedKeys,
              confirm,
              clearFilters,
              close: () => close(true),
            })
          ) : (
            <>
              {column.filterSearch &&
                (slots?.renderSearch ? (
                  slots.renderSearch(searchProps)
                ) : (
                  <input {...searchProps} data-slot="filter-search" />
                ))}
              {options.map((filter) => (
                <label key={filter.value} data-slot="filter-option">
                  <input
                    type={column.filterMultiple === false ? 'radio' : 'checkbox'}
                    name={id}
                    checked={draft.includes(filter.value)}
                    onChange={() =>
                      setSelectedKeys(
                        column.filterMultiple === false
                          ? [filter.value]
                          : getSelectionValue(pendingDraft.current, {
                              type: 'toggle',
                              value: filter.value,
                            }),
                      )
                    }
                  />
                  {filter.text}
                </label>
              ))}
              {options.length === 0 && <span role="status">Ничего не найдено</span>}
              <span data-slot="filter-actions">
                {slots?.renderButton ? slots.renderButton(resetProps) : <button {...resetProps} />}
                {slots?.renderButton ? slots.renderButton(applyProps) : <button {...applyProps} />}
              </span>
            </>
          )}
        </span>
      )}
    </span>
  );
}
