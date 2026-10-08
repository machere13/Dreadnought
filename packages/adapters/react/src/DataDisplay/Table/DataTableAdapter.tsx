import { Fragment, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { getDisclosureState, getPaginationState, getSelectionValue, paginateTableRows } from '@dreadnought/core';
import type { TableSortOrder } from '@dreadnought/core';
import { CheckboxAdapter } from '../../Fields/Checkbox/CheckboxAdapter.tsx';
import { PaginationAdapter } from '../../Navigation/Pagination/index.ts';
import { TableFilterMenu } from './TableFilterMenu.tsx';
import { TableDetailRow } from './TableDetailRow.tsx';
import { TableEllipsis } from './TableEllipsis.tsx';
import { ButtonAdapter } from '../../Controls/Button/index.ts';
import { useTableWidths } from './useTableWidths.ts';
import { cellValue, fixedStyle, groupedColumns, matchingRows, paginationNumber, recordKey } from './tableData.ts';
import type { TableChangeFilters, TableChangeSorter, TableColumn, TableDataAdapterProps, TableFilterValue, TableRowKey } from './table.types.ts';

export function DataTableAdapter<RecordType extends object>({
  columns: columnTree, dataSource, rowKey, pagination, rowSelection, expandable, onRow, onHeaderRow, sticky, scroll, locale, slotProps, onChange, ...tableProps
}: TableDataAdapterProps<RecordType>) {
  const selectionName = useId();
  const { columns, rows: headerRows } = useMemo(() => groupedColumns(columnTree), [columnTree]);
  const headerCells = headerRows.map(row => row.map(cell => cell.column.onHeaderCell?.(cell.column, cell.columnIndex)));
  const headerSpans = headerRows.map((row, rowIndex) => row.map((cell, index) =>
    `${cell.column.key}:${headerCells[rowIndex]![index]?.colSpan ?? cell.colSpan}:${headerCells[rowIndex]![index]?.rowSpan ?? cell.rowSpan}`).join(',')).join(';');
  const { table: tableRef, widths, selectionWidth, expansionWidth, headerOffsets } = useTableWidths(columns,
    { selection: Boolean(rowSelection), expansion: Boolean(expandable), sticky: Boolean(sticky), signature: headerSpans });
  const headerIds = new Map<string, string>();
  const columnHeaders = columns.map(() => [] as string[]);
  headerRows.forEach((row, rowIndex) => row.forEach((cell, index) => {
    const props = headerCells[rowIndex]![index];
    if (props?.colSpan === 0 || props?.rowSpan === 0) return;
    const id = props?.id ?? `${selectionName}-header-${encodeURIComponent(cell.column.key)}`;
    headerIds.set(cell.column.key, id);
    for (let leaf = cell.columnIndex; leaf < cell.columnIndex + cell.colSpan; leaf++) columnHeaders[leaf]!.push(id);
  }));
  const controlWidth = selectionWidth + expansionWidth;
  const [expanded, setExpanded] = useState<TableRowKey[]>(() => [...(expandable?.defaultExpandedRowKeys ?? [])]);
  const expandedKeys = expandable?.expandedRowKeys ?? expanded;
  const pendingExpanded = useRef(expandedKeys);
  useLayoutEffect(() => { pendingExpanded.current = expandedKeys; }, [expandedKeys]);
  useImperativeHandle(tableProps.ref, () => tableRef.current!);
  const headerStyle: CSSProperties = sticky
    ? { position: 'sticky', top: typeof sticky === 'object' ? sticky.offsetHeader ?? 0 : 0, zIndex: 2 } : {};
  const defaultSorted = columns.find((column) => column.defaultSortOrder);
  const [sorting, setSorting] = useState<{ key: string; order: TableSortOrder }>({ key: defaultSorted?.key ?? '', order: defaultSorted?.defaultSortOrder ?? null });
  const [filters, setFilters] = useState<Record<string, readonly TableFilterValue[]>>(() =>
    Object.fromEntries(columns.map(column => [column.key, column.defaultFilteredValue ?? []])));
  const pendingFilters = useRef(filters);
  useLayoutEffect(() => { pendingFilters.current = filters; }, [filters]);
  const [page, setPage] = useState(() => ({
    current: paginationNumber(pagination ? pagination.defaultCurrent : undefined, 1),
    pageSize: paginationNumber(pagination ? pagination.pageSize ?? pagination.defaultPageSize : undefined, 10),
  }));
  const [selected, setSelected] = useState<TableRowKey[]>([...(rowSelection?.defaultSelectedRowKeys ?? [])]);
  const activeColumn = columns.find((column) => column.sortOrder !== undefined) ?? columns.find((column) => column.key === sorting.key);
  const activeOrder = activeColumn?.sortOrder !== undefined ? activeColumn.sortOrder : sorting.order;
  const sorted = matchingRows(dataSource, columns, currentFilters(), { columnKey: activeColumn?.key, order: activeOrder });
  const pageSize = paginationNumber(pagination ? pagination.pageSize : undefined, page.pageSize);
  const requestedPage = paginationNumber(pagination ? pagination.current : undefined, pageSize !== page.pageSize ? 1 : page.current);
  const { current: currentPage, pageCount } = getPaginationState({ total: sorted.length, current: requestedPage, pageSize });
  const storedPage = pagination && pagination.current !== undefined ? page.current : currentPage;
  if (pagination !== false && (storedPage !== page.current || pageSize !== page.pageSize)) {
    setPage({ current: storedPage, pageSize });
  }
  const rows = pagination === false ? sorted : paginateTableRows(sorted, currentPage, pageSize);
  const selectedKeys = rowSelection?.selectedRowKeys ?? selected;
  const sourceKeys = rowSelection || expandable ? dataSource.map(record => recordKey(record, rowKey)) : [];
  if (new Set(sourceKeys.map(String)).size !== sourceKeys.length) {
    throw new Error('Table selection and expansion require unique rowKey or record.key values.');
  }
  const keysOnPage = rows.map((record, index) => recordKey(record, rowKey, rowSelection || expandable ? undefined : (currentPage - 1) * pageSize + index))
    .filter((_, index) => !rowSelection?.getCheckboxProps?.(rows[index]!)?.disabled);
  const selectedOnPage = keysOnPage.filter(key => selectedKeys.includes(key)).length;

  function filterValues(column: TableColumn<RecordType>, source = filters): readonly TableFilterValue[] {
    return column.filteredValue !== undefined ? column.filteredValue ?? [] : source[column.key] ?? [];
  }

  function currentFilters(override?: { key: string; values: readonly TableFilterValue[] }, source = filters): TableChangeFilters {
    return Object.fromEntries(columns.filter((column) => column.filters || column.onFilter).map((column) => [
      column.key,
      override?.key === column.key ? override.values : filterValues(column, source),
    ]));
  }

  function publishChange(action: 'sort' | 'filter' | 'paginate', nextPage: number, nextFilters: TableChangeFilters, nextSorter: TableChangeSorter) {
    onChange?.(
      { current: nextPage, pageSize },
      nextFilters,
      nextSorter,
      { action, currentDataSource: matchingRows(dataSource, columns, nextFilters, nextSorter) },
    );
  }

  function changeSort(column: TableColumn<RecordType>) {
    const current = column.key === activeColumn?.key ? activeOrder : null;
    const order = current === null ? 'ascend' : current === 'ascend' ? 'descend' : null;
    if (column.sortOrder === undefined) setSorting({ key: column.key, order });
    publishChange('sort', currentPage, currentFilters(undefined, pendingFilters.current), { columnKey: column.key, order });
  }
  function changePage(next: number) {
    if (pagination === false) return;
    if (pagination?.current === undefined) setPage({ current: next, pageSize });
    pagination?.onChange?.(next, pageSize);
    publishChange('paginate', next, currentFilters(undefined, pendingFilters.current), { columnKey: activeColumn?.key, order: activeOrder });
  }
  function changeFilter(column: TableColumn<RecordType>, values: TableFilterValue[]) {
    if (column.filteredValue === undefined) {
      pendingFilters.current = { ...pendingFilters.current, [column.key]: values };
      setFilters(pendingFilters.current);
    }
    if (pagination !== false) {
      if (pagination?.current === undefined) setPage({ current: 1, pageSize });
      pagination?.onChange?.(1, pageSize);
    }
    publishChange('filter', 1, currentFilters({ key: column.key, values }, pendingFilters.current), { columnKey: activeColumn?.key, order: activeOrder });
  }
  function changeSelection(next: TableRowKey[]) {
    if (rowSelection?.selectedRowKeys === undefined) setSelected(next);
    rowSelection?.onChange?.(next, dataSource.filter((_, index) => next.includes(sourceKeys[index]!)));
  }
  function changeExpansion(record: RecordType, key: TableRowKey) {
    const previous = expandable?.expandedRowKeys ?? pendingExpanded.current;
    const next = getSelectionValue(previous, { type: 'toggle', value: key });
    if (expandable?.expandedRowKeys === undefined) {
      pendingExpanded.current = next;
      setExpanded(next);
    }
    expandable?.onExpand?.(next.includes(key), record);
    expandable?.onExpandedRowsChange?.(next);
  }

  const tableStyle = {
    ...tableProps.style,
    ...(scroll?.x ? { minWidth: scroll.x } : {}),
  } as CSSProperties;

  const table = <table {...tableProps} ref={tableRef} data-ui="table" data-sticky={Boolean(sticky)} data-ellipsis={columns.some(column => column.ellipsis)} style={tableStyle}>
    <thead>{headerRows.map((headerRow, rowIndex) => <tr key={rowIndex} {...onHeaderRow?.(headerRow.map(cell => cell.column), rowIndex)}>
      {rowIndex === 0 && rowSelection && <th rowSpan={headerRows.length} scope="col" data-slot="selection-cell" data-fixed="left" style={{ ...headerStyle, position: 'sticky', left: 0, zIndex: 3 }} aria-label="Выбор строк">
        {rowSelection.type !== 'radio' && <CheckboxAdapter
          aria-label="Выбрать все строки на странице"
          checked={keysOnPage.length > 0 && selectedOnPage === keysOnPage.length}
          indeterminate={selectedOnPage > 0 && selectedOnPage < keysOnPage.length}
          disabled={keysOnPage.length === 0}
          onChange={(event) => changeSelection(event.target.checked
            ? [...new Set([...selectedKeys, ...keysOnPage])]
            : selectedKeys.filter((key) => !keysOnPage.includes(key)))}
        />}
      </th>}
      {rowIndex === 0 && expandable && <th rowSpan={headerRows.length} scope="col" data-slot="expansion-cell" data-fixed="left"
        style={{ ...headerStyle, position: 'sticky', left: selectionWidth, zIndex: 3 }} aria-label="Раскрытие строк">
        {expandable.columnTitle}
      </th>}
      {headerRow.map((cell, index) => {
        const { column, columnIndex, colSpan, rowSpan } = cell;
        const group = Boolean(column.children?.length);
        const cellProps = headerCells[rowIndex]![index];
        if (cellProps?.colSpan === 0 || cellProps?.rowSpan === 0) return null;
        const order = !group && activeColumn?.key === column.key ? activeOrder : null;
        const values = filterValues(column);
        const ariaSort = !group && column.sorter
          ? order === 'ascend' ? 'ascending' : order === 'descend' ? 'descending' : 'none'
          : undefined;
        return <th
          {...cellProps}
          key={column.key}
          id={headerIds.get(column.key)}
          scope={cellProps?.scope ?? (group ? 'colgroup' : 'col')}
          colSpan={cellProps?.colSpan ?? colSpan}
          rowSpan={cellProps?.rowSpan ?? rowSpan}
          data-slot="header-cell"
          data-column-index={group ? undefined : columnIndex}
          data-fixed={column.fixed}
          aria-sort={ariaSort}
          style={{ textAlign: column.align, ...cellProps?.style, ...fixedStyle(columns, column.fixed === 'right' ? columnIndex + colSpan - 1 : columnIndex, widths, controlWidth),
            ...(group ? { width: undefined, minWidth: undefined } : {}), ...headerStyle,
            ...(sticky ? { top: (headerStyle.top as number) + (headerOffsets[rowIndex] ?? 0) } : {}), ...(column.fixed ? { zIndex: 3 } : {}) }}
        >
          {!group && column.sorter ? <button
            type="button"
            data-slot="sort-trigger"
            aria-label={column.sortLabel ?? `Сортировать ${String(column.title ?? column.key)}`}
            onClick={() => changeSort(column)}
          >
            {column.title}
            <span data-slot="sort-indicator" aria-hidden="true">{order === 'ascend' ? '↑' : order === 'descend' ? '↓' : '↕'}</span>
          </button> : column.ellipsis ? <TableEllipsis tooltip={slotProps?.tooltip}>{column.title}</TableEllipsis> : column.title}
          {!group && <TableFilterMenu column={column} values={values} onApply={(next) => changeFilter(column, next)} />}
        </th>;
      })}
    </tr>)}</thead>
    <tbody>{rows.length ? rows.map((record, rowIndex) => {
      const key = recordKey(record, rowKey, rowSelection || expandable ? undefined : (currentPage - 1) * pageSize + rowIndex);
      const canExpand = Boolean(expandable && (expandable.rowExpandable?.(record) ?? true));
      const open = canExpand && expandedKeys.includes(key);
      const disclosure = getDisclosureState({ open, triggerId: `${selectionName}-${encodeURIComponent(String(key))}-trigger`, panelId: `${selectionName}-${encodeURIComponent(String(key))}-detail` });
      return <Fragment key={key}><tr {...onRow?.(record, rowIndex)} data-selected={selectedKeys.includes(key)}>
        {rowSelection && <td data-slot="selection-cell" data-fixed="left" style={{ position: 'sticky', left: 0, zIndex: 1 }}>
          <input
            type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
            name={rowSelection.type === 'radio' ? selectionName : undefined}
            aria-label={`Выбрать строку ${key}`}
            checked={selectedKeys.includes(key)}
            disabled={rowSelection.getCheckboxProps?.(record)?.disabled}
            onChange={(event) => changeSelection(rowSelection.type === 'radio'
              ? [key]
              : getSelectionValue(selectedKeys, { type: event.target.checked ? 'select' : 'deselect', value: key }))}
          />
        </td>}
        {expandable && <td data-slot="expansion-cell" data-fixed="left" style={{ position: 'sticky', left: selectionWidth, zIndex: 1 }}>
          {canExpand && <ButtonAdapter {...disclosure.triggerProps} data-slot="expand-trigger"
            aria-label={`${open ? 'Свернуть' : 'Раскрыть'} строку ${key}`} onClick={() => changeExpansion(record, key)}>
            {expandable.expandIcon?.(open, record) ?? <span aria-hidden="true">{open ? '−' : '+'}</span>}
          </ButtonAdapter>}
        </td>}
        {columns.map((column, index) => {
          const cellProps = column.onCell?.(record, rowIndex);
          if (cellProps?.colSpan === 0 || cellProps?.rowSpan === 0) return null;
          const value = cellValue(record, column.dataIndex);
          const content = column.render ? column.render(value, record, rowIndex) : String(value ?? '');
          return <td {...cellProps} key={column.key} data-slot="cell" data-fixed={column.fixed}
            headers={cellProps?.headers ?? columnHeaders[index]?.join(' ')}
            style={{ textAlign: column.align, ...cellProps?.style, ...fixedStyle(columns, index, widths, controlWidth) }}>
            {column.ellipsis ? <TableEllipsis tooltip={slotProps?.tooltip}>{content}</TableEllipsis> : content}
          </td>;
        })}
      </tr>{open && expandable && <TableDetailRow id={disclosure.panelProps.id} triggerId={disclosure.triggerProps.id}
        colSpan={columns.length + (rowSelection ? 1 : 0) + 1}>{expandable.expandedRowRender(record, rowIndex)}</TableDetailRow>}</Fragment>;
    }) : <tr><td data-slot="empty" colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0)}>
      {locale?.emptyText ?? 'Нет данных'}
    </td></tr>}</tbody>
  </table>;

  return <div data-slot="table-container">
    {scroll ? <div data-slot="scroll-container" style={{ overflow: 'auto', maxHeight: scroll.y, maxWidth: '100%' }}>
      {table}
    </div> : table}
    {pagination !== false && pageCount > 1 && <PaginationAdapter simple total={sorted.length}
      current={currentPage} pageSize={pageSize} onChange={changePage}
      aria-label="Страницы таблицы" data-slot="pagination" />}
  </div>;
}
