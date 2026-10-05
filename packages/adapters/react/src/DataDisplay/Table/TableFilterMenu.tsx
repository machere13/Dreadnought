import { useEffect, useId, useRef, useState } from 'react';
import { getSelectionValue } from '@dreadnought/core';
import type { TableColumn, TableFilterValue } from './table.types.ts';
import { useAnchoredPopover } from '../../shared/useAnchoredPopover.ts';

export function TableFilterMenu<RecordType extends object>({ column, values, onApply }: {
  column: TableColumn<RecordType>;
  values: readonly TableFilterValue[];
  onApply: (values: TableFilterValue[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TableFilterValue[]>([...values]);
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLSpanElement>(null);
  useAnchoredPopover(open, trigger, popup);
  useEffect(() => {
    const node = popup.current;
    if (!open || !node || typeof node.showPopover === 'function') return;
    function dismiss(event: PointerEvent) {
      if (root.current && !event.composedPath().includes(root.current)) setOpen(false);
    }
    node.ownerDocument.addEventListener('pointerdown', dismiss);
    return () => node.ownerDocument.removeEventListener('pointerdown', dismiss);
  }, [open]);
  if (!column.filters?.length) return null;

  const title = String(column.title ?? column.key);
  function close(restoreFocus = false) {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  }
  function apply(next: TableFilterValue[]) {
    onApply(next);
    close(true);
  }

  return <span ref={root} data-slot="filter-control" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) close();
  }}>
    <button
      ref={trigger}
      type="button"
      data-slot="filter-trigger"
      aria-label={`Фильтр ${title}`}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-controls={id}
      popoverTarget={id}
      onClick={event => { event.preventDefault(); setDraft([...values]); setOpen(!open); }}
    >⌄</button>
    {open && <span ref={popup} id={id} popover="auto" role="dialog" aria-label={`Фильтр ${title}`} data-slot="filter-menu"
      onToggle={event => { if (event.newState === 'closed') close(); }}
      onKeyDown={event => {
        if (!event.defaultPrevented && !event.nativeEvent.isComposing && event.key === 'Escape'
          && (event.target as Element).closest('[popover]') === event.currentTarget) {
          event.preventDefault(); close(true);
        }
      }}>
      {column.filters.map((filter) => <label key={filter.value} data-slot="filter-option">
        <input
          type={column.filterMultiple === false ? 'radio' : 'checkbox'}
          name={`filter-${column.key}`}
          checked={draft.includes(filter.value)}
          onChange={() => setDraft(column.filterMultiple === false ? [filter.value]
            : getSelectionValue(draft, { type: 'toggle', value: filter.value }))}
        />
        {filter.text}
      </label>)}
      <span data-slot="filter-actions">
        <button type="button" onClick={() => apply([])}>Сбросить</button>
        <button type="button" onClick={() => apply(draft)}>Применить</button>
      </span>
    </span>}
  </span>;
}
