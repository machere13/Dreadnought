import { useState } from 'react';
import type { CSSProperties } from 'react';
import { filterTableRows, paginateTableRows, sortTableRows } from '@dreadnought/core';
import type { TableSortOrder } from '@dreadnought/core';
import { TableFilterMenu } from './TableFilterMenu.tsx';
import { cellValue, fixedStyle, recordKey } from './tableData.ts';
import type { TableChangeFilters, TableChangeSorter, TableColumn, TableDataAdapterProps, TableFilterValue, TableRowKey } from './table.types.ts';

export function DataTableAdapter<RecordType extends object>({
  columns, dataSource, rowKey, pagination, rowSelection, sticky, scroll, locale, onChange, ...tableProps
}: TableDataAdapterProps<RecordType>) {
  const defaultSorted = columns.find((column) => column.defaultSortOrder);
  const [sorting, setSorting] = useState<{ key: string; order: TableSortOrder }>({ key: defaultSorted?.key ?? '', order: defaultSorted?.defaultSortOrder ?? null });
  const [filters, setFilters] = useState<Record<string, TableFilterValue[]>>({});
  const [page, setPage] = useState(pagination && pagination.defaultCurrent || 1);
  const [selected, setSelected] = useState<TableRowKey[]>([...(rowSelection?.defaultSelectedRowKeys ?? [])]);
  const activeColumn = columns.find((column) => column.sortOrder !== undefined) ?? columns.find((column) => column.key === sorting.key);
  const activeOrder = activeColumn?.sortOrder !== undefined ? activeColumn.sortOrder : sorting.order;
  const filtered = filterTableRows(dataSource, columns.filter((column) => column.onFilter).map((column) => ({
    values: column.filteredValue ?? filters[column.key] ?? column.defaultFilteredValue ?? [],
    predicate: column.onFilter!,
  })));
  const sorted = sortTableRows(filtered, activeColumn?.sorter, activeOrder);
  const pageSize = Math.max(1, pagination && (pagination.pageSize ?? pagination.defaultPageSize) || 10);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(pagination && pagination.current || page, pageCount);
  const rows = pagination === false ? sorted : paginateTableRows(sorted, currentPage, pageSize);
  const selectedKeys = rowSelection?.selectedRowKeys ?? selected;
  const keysOnPage = rows.map((record, index) => recordKey(record, rowKey, (currentPage - 1) * pageSize + index))
    .filter((_, index) => !rowSelection?.getCheckboxProps?.(rows[index]!)?.disabled);

  function currentFilters(override?: { key: string; values: readonly TableFilterValue[] }): TableChangeFilters {
    return Object.fromEntries(columns.filter((column) => column.filters).map((column) => [
      column.key,
      override?.key === column.key ? override.values : column.filteredValue ?? filters[column.key] ?? column.defaultFilteredValue ?? [],
    ]));
  }

  function publishChange(nextPage: number, nextFilters: TableChangeFilters, nextSorter: TableChangeSorter) {
    const matching = filterTableRows(dataSource, columns.filter((column) => column.onFilter).map((column) => ({
      values: nextFilters[column.key] ?? [],
      predicate: column.onFilter!,
    })));
    const sorterColumn = columns.find((column) => column.key === nextSorter.columnKey);
    onChange?.(
      { current: nextPage, pageSize },
      nextFilters,
      nextSorter,
      { currentDataSource: sortTableRows(matching, sorterColumn?.sorter, nextSorter.order) },
    );
  }

  function changeSort(column: TableColumn<RecordType>) {
    const current = column.key === activeColumn?.key ? activeOrder : null;
    const order = current === null ? 'ascend' : current === 'ascend' ? 'descend' : null;
    if (column.sortOrder === undefined) setSorting({ key: column.key, order });
    publishChange(currentPage, currentFilters(), { columnKey: column.key, order });
  }
  function changePage(next: number) {
    if (pagination === false) return;
    if (pagination?.current === undefined) setPage(next);
    pagination?.onChange?.(next, pageSize);
    publishChange(next, currentFilters(), { columnKey: activeColumn?.key, order: activeOrder });
  }
  function changeFilter(column: TableColumn<RecordType>, values: TableFilterValue[]) {
    if (column.filteredValue === undefined) setFilters({ ...filters, [column.key]: values });
    if (pagination !== false && pagination?.current === undefined) setPage(1);
    publishChange(1, currentFilters({ key: column.key, values }), { columnKey: activeColumn?.key, order: activeOrder });
  }
  function changeSelection(next: TableRowKey[]) {
    if (rowSelection?.selectedRowKeys === undefined) setSelected(next);
    rowSelection?.onChange?.(next, dataSource.filter((record, index) => next.includes(recordKey(record, rowKey, index))));
  }

  const tableStyle = {
    ...tableProps.style,
    ...(scroll?.x ? { minWidth: scroll.x } : {}),
    '--dreadnought-table-sticky-header-offset': typeof sticky === 'object' ? `${sticky.offsetHeader ?? 0}px` : '0px',
  } as CSSProperties;

  const table = <table {...tableProps} data-ui="table" data-sticky={Boolean(sticky)} style={tableStyle}>
    <thead><tr>
      {rowSelection && <th scope="col" data-slot="selection-cell" data-fixed="left" style={{ left: 0 }} aria-label="Выбор строк">
        {rowSelection.type !== 'radio' && <input
          type="checkbox"
          aria-label="Выбрать все строки на странице"
          checked={keysOnPage.length > 0 && keysOnPage.every((key) => selectedKeys.includes(key))}
          onChange={(event) => changeSelection(event.target.checked
            ? [...new Set([...selectedKeys, ...keysOnPage])]
            : selectedKeys.filter((key) => !keysOnPage.includes(key)))}
        />}
      </th>}
      {columns.map((column, index) => {
        const order = activeColumn?.key === column.key ? activeOrder : null;
        const values = column.filteredValue ?? filters[column.key] ?? column.defaultFilteredValue ?? [];
        const ariaSort = column.sorter
          ? order === 'ascend' ? 'ascending' : order === 'descend' ? 'descending' : 'none'
          : undefined;
        return <th
          key={column.key}
          scope="col"
          data-slot="header-cell"
          data-fixed={column.fixed}
          aria-sort={ariaSort}
          style={fixedStyle(columns, index, Boolean(rowSelection))}
        >
          {column.sorter ? <button
            type="button"
            data-slot="sort-trigger"
            aria-label={column.sortLabel ?? `Сортировать ${String(column.title ?? column.key)}`}
            onClick={() => changeSort(column)}
          >
            {column.title}
            <span data-slot="sort-indicator" aria-hidden="true">{order === 'ascend' ? '↑' : order === 'descend' ? '↓' : '↕'}</span>
          </button> : column.title}
          <TableFilterMenu column={column} values={values} onApply={(next) => changeFilter(column, next)} />
        </th>;
      })}
    </tr></thead>
    <tbody>{rows.length ? rows.map((record, rowIndex) => {
      const key = recordKey(record, rowKey, (currentPage - 1) * pageSize + rowIndex);
      return <tr key={key} data-selected={selectedKeys.includes(key)}>
        {rowSelection && <td data-slot="selection-cell" data-fixed="left" style={{ left: 0 }}>
          <input
            type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
            name={rowSelection.type === 'radio' ? 'table-row-selection' : undefined}
            aria-label={`Выбрать строку ${key}`}
            checked={selectedKeys.includes(key)}
            disabled={rowSelection.getCheckboxProps?.(record)?.disabled}
            onChange={(event) => changeSelection(rowSelection.type === 'radio' ? [key]
              : event.target.checked ? [...selectedKeys, key] : selectedKeys.filter((item) => item !== key))}
          />
        </td>}
        {columns.map((column, index) => {
          const value = cellValue(record, column.dataIndex);
          return <td key={column.key} data-slot="cell" data-fixed={column.fixed} style={fixedStyle(columns, index, Boolean(rowSelection))}>
            {column.render ? column.render(value, record, rowIndex) : String(value ?? '')}
          </td>;
        })}
      </tr>;
    }) : <tr><td data-slot="empty" colSpan={columns.length + (rowSelection ? 1 : 0)}>
      {locale?.emptyText ?? 'Нет данных'}
    </td></tr>}</tbody>
  </table>;

  return <div data-slot="table-container">
    {scroll ? <div data-slot="scroll-container" style={{ overflow: 'auto', maxHeight: scroll.y, maxWidth: '100%' }}>
      {table}
    </div> : table}
    {pagination !== false && pageCount > 1 && <nav data-slot="pagination" aria-label="Страницы таблицы">
      <button type="button" aria-label="Предыдущая страница" disabled={currentPage <= 1} onClick={() => changePage(currentPage - 1)}>‹</button>
      <span>{currentPage} / {pageCount}</span>
      <button type="button" aria-label="Следующая страница" disabled={currentPage >= pageCount} onClick={() => changePage(currentPage + 1)}>›</button>
    </nav>}
  </div>;
}
