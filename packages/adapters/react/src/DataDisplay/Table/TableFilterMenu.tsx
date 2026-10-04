import { useState } from 'react';
import { getSelectionValue } from '@dreadnought/core';
import type { TableColumn, TableFilterValue } from './table.types.ts';

export function TableFilterMenu<RecordType extends object>({ column, values, onApply }: {
  column: TableColumn<RecordType>;
  values: readonly TableFilterValue[];
  onApply: (values: TableFilterValue[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TableFilterValue[]>([...values]);
  if (!column.filters?.length) return null;

  const title = String(column.title ?? column.key);
  function apply(next: TableFilterValue[]) {
    onApply(next);
    setOpen(false);
  }

  return <span data-slot="filter-control">
    <button
      type="button"
      data-slot="filter-trigger"
      aria-label={`Фильтр ${title}`}
      aria-expanded={open}
      onClick={() => { setDraft([...values]); setOpen(!open); }}
    >⌄</button>
    {open && <span data-slot="filter-menu">
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
