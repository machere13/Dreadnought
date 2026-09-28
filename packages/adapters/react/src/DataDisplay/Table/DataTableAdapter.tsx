import { useState } from 'react';
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { filterTableRows, paginateTableRows, sortTableRows } from '@dreadnought/core';
import type { TableSortOrder } from '@dreadnought/core';

export type TableRowKey = string | number;
export type TableFilterValue = string | number;
export type TableColumn<RecordType extends object> = {
  key: string;
  title: ReactNode;
  dataIndex?: keyof RecordType | readonly (string | number)[];
  render?: (value: unknown, record: RecordType, index: number) => ReactNode;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: (a: RecordType, b: RecordType) => number;
  sortOrder?: TableSortOrder;
  defaultSortOrder?: Exclude<TableSortOrder, null>;
  sortLabel?: string;
  filters?: readonly { text: string; value: TableFilterValue }[];
  onFilter?: (value: TableFilterValue, record: RecordType) => boolean;
  filteredValue?: readonly TableFilterValue[] | null;
  defaultFilteredValue?: readonly TableFilterValue[];
  filterMultiple?: boolean;
};
export type TablePagination = {
  current?: number;
  defaultCurrent?: number;
  pageSize?: number;
  defaultPageSize?: number;
  onChange?: (page: number, pageSize: number) => void;
};
export type TableRowSelection<RecordType extends object> = {
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: readonly TableRowKey[];
  defaultSelectedRowKeys?: readonly TableRowKey[];
  onChange?: (keys: TableRowKey[], rows: RecordType[]) => void;
  getCheckboxProps?: (record: RecordType) => { disabled?: boolean };
};
export type TableDataAdapterProps<RecordType extends object> = Omit<ComponentPropsWithRef<'table'>, 'children'> & {
  columns: readonly TableColumn<RecordType>[];
  dataSource: readonly RecordType[];
  rowKey?: keyof RecordType | ((record: RecordType) => TableRowKey);
  pagination?: false | TablePagination;
  rowSelection?: TableRowSelection<RecordType>;
  sticky?: boolean | { offsetHeader?: number };
  scroll?: { x?: number | string; y?: number | string };
  locale?: { emptyText?: ReactNode };
};

function cellValue<RecordType extends object>(record: RecordType, dataIndex: TableColumn<RecordType>['dataIndex']) {
  if (dataIndex === undefined) return undefined;
  const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
  return path.reduce<unknown>((value, segment) =>
    value != null && typeof value === 'object' ? (value as Record<string | number, unknown>)[segment] : undefined,
  record);
}

function recordKey<RecordType extends object>(record: RecordType, rowKey: TableDataAdapterProps<RecordType>['rowKey'], index: number): TableRowKey {
  if (typeof rowKey === 'function') return rowKey(record);
  const value = record[rowKey ?? 'key' as keyof RecordType];
  return typeof value === 'string' || typeof value === 'number' ? value : index;
}

function fixedStyle<RecordType extends object>(columns: readonly TableColumn<RecordType>[], index: number, hasSelection: boolean): CSSProperties | undefined {
  const column = columns[index];
  if (!column) return undefined;
  const style: CSSProperties = column.width ? { width: column.width, minWidth: column.width } : {};
  if (column.fixed) {
    const siblings = column.fixed === 'left' ? columns.slice(0, index) : columns.slice(index + 1);
    const offset = siblings.filter((item) => item.fixed === column.fixed).reduce((sum, item) => sum + (item.width ?? 0), 0);
    style[column.fixed] = column.fixed === 'left' && hasSelection
      ? `calc(var(--dreadnought-table-selection-width) + ${offset}px)` : offset;
  }
  return style;
}

function FilterMenu<RecordType extends object>({ column, values, onApply }: {
  column: TableColumn<RecordType>;
  values: readonly TableFilterValue[];
  onApply: (values: TableFilterValue[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TableFilterValue[]>([...values]);
  if (!column.filters?.length) return null;
  const title = String(column.title ?? column.key);
  function apply(next: TableFilterValue[]) { onApply(next); setOpen(false); }
  return <span data-slot="filter-control">
    <button type="button" data-slot="filter-trigger" aria-label={`Фильтр ${title}`} aria-expanded={open} onClick={() => { setDraft([...values]); setOpen(!open); }}>⌄</button>
    {open && <span data-slot="filter-menu">
      {column.filters.map((filter) => <label key={filter.value} data-slot="filter-option"><input type={column.filterMultiple === false ? 'radio' : 'checkbox'} name={`filter-${column.key}`} checked={draft.includes(filter.value)} onChange={() => setDraft(column.filterMultiple === false ? [filter.value] : draft.includes(filter.value) ? draft.filter((value) => value !== filter.value) : [...draft, filter.value])} />{filter.text}</label>)}
      <span data-slot="filter-actions"><button type="button" onClick={() => apply([])}>Сбросить</button><button type="button" onClick={() => apply(draft)}>Применить</button></span>
    </span>}
  </span>;
}

export function DataTableAdapter<RecordType extends object>({ columns, dataSource, rowKey, pagination, rowSelection, sticky, scroll, locale, ...tableProps }: TableDataAdapterProps<RecordType>) {
  const defaultSorted = columns.find((column) => column.defaultSortOrder);
  const [sorting, setSorting] = useState<{ key: string; order: TableSortOrder }>({ key: defaultSorted?.key ?? '', order: defaultSorted?.defaultSortOrder ?? null });
  const [filters, setFilters] = useState<Record<string, TableFilterValue[]>>({});
  const [page, setPage] = useState(pagination && pagination.defaultCurrent || 1);
  const [selected, setSelected] = useState<TableRowKey[]>([...(rowSelection?.defaultSelectedRowKeys ?? [])]);
  const activeColumn = columns.find((column) => column.sortOrder !== undefined) ?? columns.find((column) => column.key === sorting.key);
  const activeOrder = activeColumn?.sortOrder !== undefined ? activeColumn.sortOrder : sorting.order;
  const filtered = filterTableRows(dataSource, columns.filter((column) => column.onFilter).map((column) => ({ values: column.filteredValue ?? filters[column.key] ?? column.defaultFilteredValue ?? [], predicate: column.onFilter! })));
  const sorted = sortTableRows(filtered, activeColumn?.sorter, activeOrder);
  const pageSize = Math.max(1, pagination && (pagination.pageSize ?? pagination.defaultPageSize) || 10);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(pagination && pagination.current || page, pageCount);
  const rows = pagination === false ? sorted : paginateTableRows(sorted, currentPage, pageSize);
  const selectedKeys = rowSelection?.selectedRowKeys ?? selected;
  const keysOnPage = rows.map((record, index) => recordKey(record, rowKey, (currentPage - 1) * pageSize + index))
    .filter((_, index) => !rowSelection?.getCheckboxProps?.(rows[index]!)?.disabled);

  function changeSort(column: TableColumn<RecordType>) {
    const current = column.key === activeColumn?.key ? activeOrder : null;
    if (column.sortOrder === undefined) setSorting({ key: column.key, order: current === null ? 'ascend' : current === 'ascend' ? 'descend' : null });
  }
  function changePage(next: number) {
    if (pagination === false) return;
    if (pagination?.current === undefined) setPage(next);
    pagination?.onChange?.(next, pageSize);
  }
  function changeSelection(next: TableRowKey[]) {
    if (rowSelection?.selectedRowKeys === undefined) setSelected(next);
    rowSelection?.onChange?.(next, dataSource.filter((record, index) => next.includes(recordKey(record, rowKey, index))));
  }

  const table = <table {...tableProps} data-ui="table" data-sticky={Boolean(sticky)} style={{ ...tableProps.style, ...(scroll?.x ? { minWidth: scroll.x } : {}), '--dreadnought-table-sticky-header-offset': typeof sticky === 'object' ? `${sticky.offsetHeader ?? 0}px` : '0px' } as CSSProperties}>
    <thead><tr>
      {rowSelection && <th scope="col" data-slot="selection-cell" data-fixed="left" style={{ left: 0 }} aria-label="Выбор строк">
        {rowSelection.type !== 'radio' && <input type="checkbox" aria-label="Выбрать все строки на странице" checked={keysOnPage.length > 0 && keysOnPage.every((key) => selectedKeys.includes(key))} onChange={(event) => changeSelection(event.target.checked ? [...new Set([...selectedKeys, ...keysOnPage])] : selectedKeys.filter((key) => !keysOnPage.includes(key)))} />}
      </th>}
      {columns.map((column, index) => {
        const order = activeColumn?.key === column.key ? activeOrder : null;
        const values = column.filteredValue ?? filters[column.key] ?? column.defaultFilteredValue ?? [];
        return <th key={column.key} scope="col" data-slot="header-cell" data-fixed={column.fixed} aria-sort={column.sorter ? order === 'ascend' ? 'ascending' : order === 'descend' ? 'descending' : 'none' : undefined} style={fixedStyle(columns, index, Boolean(rowSelection))}>
          {column.sorter ? <button type="button" data-slot="sort-trigger" aria-label={column.sortLabel ?? `Сортировать ${String(column.title ?? column.key)}`} onClick={() => changeSort(column)}>{column.title}<span data-slot="sort-indicator" aria-hidden="true">{order === 'ascend' ? '↑' : order === 'descend' ? '↓' : '↕'}</span></button> : column.title}
          <FilterMenu column={column} values={values} onApply={(next) => { if (column.filteredValue === undefined) setFilters({ ...filters, [column.key]: next }); changePage(1); }} />
        </th>;
      })}
    </tr></thead>
    <tbody>{rows.length ? rows.map((record, rowIndex) => {
      const key = recordKey(record, rowKey, (currentPage - 1) * pageSize + rowIndex);
      return <tr key={key} data-selected={selectedKeys.includes(key)}>
        {rowSelection && <td data-slot="selection-cell" data-fixed="left" style={{ left: 0 }}><input type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'} name={rowSelection.type === 'radio' ? 'table-row-selection' : undefined} aria-label={`Выбрать строку ${key}`} checked={selectedKeys.includes(key)} disabled={rowSelection.getCheckboxProps?.(record)?.disabled} onChange={(event) => changeSelection(rowSelection.type === 'radio' ? [key] : event.target.checked ? [...selectedKeys, key] : selectedKeys.filter((item) => item !== key))} /></td>}
        {columns.map((column, index) => { const value = cellValue(record, column.dataIndex); return <td key={column.key} data-slot="cell" data-fixed={column.fixed} style={fixedStyle(columns, index, Boolean(rowSelection))}>{column.render ? column.render(value, record, rowIndex) : String(value ?? '')}</td>; })}
      </tr>;
    }) : <tr><td data-slot="empty" colSpan={columns.length + (rowSelection ? 1 : 0)}>{locale?.emptyText ?? 'Нет данных'}</td></tr>}</tbody>
  </table>;

  return <div data-slot="table-container">
    {scroll ? <div data-slot="scroll-container" style={{ overflow: 'auto', maxHeight: scroll.y, maxWidth: '100%' }}>{table}</div> : table}
    {pagination !== false && pageCount > 1 && <nav data-slot="pagination" aria-label="Страницы таблицы"><button type="button" aria-label="Предыдущая страница" disabled={currentPage <= 1} onClick={() => changePage(currentPage - 1)}>‹</button><span>{currentPage} / {pageCount}</span><button type="button" aria-label="Следующая страница" disabled={currentPage >= pageCount} onClick={() => changePage(currentPage + 1)}>›</button></nav>}
  </div>;
}
