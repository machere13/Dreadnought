import {
  Fragment,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CSSProperties } from 'react';
import {
  getDisclosureState,
  getPaginationState,
  getSelectionValue,
  paginateTableRows,
} from '@dreadnought/core';
import { CheckboxAdapter } from '../../Fields/Checkbox/CheckboxAdapter.tsx';
import { PaginationAdapter } from '../../Navigation/Pagination/index.ts';
import { LoaderAdapter } from '../../Feedback/Loader/index.ts';
import { TableFilterMenu } from './TableFilterMenu.tsx';
import { TableDetailRow } from './TableDetailRow.tsx';
import { TableEllipsis } from './TableEllipsis.tsx';
import { ButtonAdapter } from '../../Controls/Button/index.ts';
import { useTableWidths } from './useTableWidths.ts';
import { changeSorters, defaultSorters, resolveSorters } from './tableSort.ts';
import {
  cellValue,
  fixedStyle,
  groupedColumns,
  matchingRows,
  paginationNumber,
  recordKey,
} from './tableData.ts';
import type {
  TableChangeFilters,
  TableChangeSorter,
  TableColumn,
  TableDataAdapterProps,
  TableFilterValue,
  TableRowKey,
} from './table.types.ts';

export function DataTableAdapter<RecordType extends object>({
  columns: columnTree,
  dataSource,
  processing = 'local',
  loading = false,
  rowKey,
  pagination,
  rowSelection,
  expandable,
  summary,
  onRow,
  onHeaderRow,
  sticky,
  scroll,
  locale,
  slotProps,
  onChange,
  ...tableProps
}: TableDataAdapterProps<RecordType>) {
  const selectionName = useId();
  const { columns, rows: headerRows } = useMemo(() => groupedColumns(columnTree), [columnTree]);
  const manual = processing === 'manual';
  if (
    !manual &&
    columns.some(
      (column) =>
        column.sorter === true || (typeof column.sorter === 'object' && !column.sorter.compare),
    )
  ) {
    throw new TypeError('Table sorter without compare requires processing="manual".');
  }
  const headerCells = headerRows.map((row) =>
    row.map((cell) => cell.column.onHeaderCell?.(cell.column, cell.columnIndex)),
  );
  const headerSpans = headerRows
    .map((row, rowIndex) =>
      row
        .map(
          (cell, index) =>
            `${cell.column.key}:${headerCells[rowIndex]![index]?.colSpan ?? cell.colSpan}:${headerCells[rowIndex]![index]?.rowSpan ?? cell.rowSpan}`,
        )
        .join(','),
    )
    .join(';');
  const {
    table: tableRef,
    widths,
    selectionWidth,
    expansionWidth,
    headerOffsets,
  } = useTableWidths(columns, {
    selection: Boolean(rowSelection),
    expansion: Boolean(expandable),
    sticky: Boolean(sticky),
    signature: headerSpans,
  });
  const headerIds = new Map<string, string>();
  const columnHeaders = columns.map(() => [] as string[]);
  headerRows.forEach((row, rowIndex) =>
    row.forEach((cell, index) => {
      const props = headerCells[rowIndex]![index];
      if (props?.colSpan === 0 || props?.rowSpan === 0) {
        return;
      }
      const id = props?.id ?? `${selectionName}-header-${encodeURIComponent(cell.column.key)}`;
      headerIds.set(cell.column.key, id);
      for (let leaf = cell.columnIndex; leaf < cell.columnIndex + cell.colSpan; leaf++) {
        columnHeaders[leaf]!.push(id);
      }
    }),
  );
  const controlWidth = selectionWidth + expansionWidth;
  const [expanded, setExpanded] = useState<TableRowKey[]>(() => [
    ...(expandable?.defaultExpandedRowKeys ?? []),
  ]);
  const expandedKeys = expandable?.expandedRowKeys ?? expanded;
  const pendingExpanded = useRef(expandedKeys);
  useLayoutEffect(() => {
    pendingExpanded.current = expandedKeys;
  }, [expandedKeys]);
  useImperativeHandle(tableProps.ref, () => tableRef.current!);
  const headerStyle: CSSProperties = sticky
    ? {
        position: 'sticky',
        top: typeof sticky === 'object' ? (sticky.offsetHeader ?? 0) : 0,
        zIndex: 2,
      }
    : {};
  const [sorting, setSorting] = useState(() => defaultSorters(columns));
  const pendingSorting = useRef(sorting);
  useLayoutEffect(() => {
    pendingSorting.current = sorting;
  }, [sorting]);
  const [filters, setFilters] = useState<Record<string, readonly TableFilterValue[]>>(() =>
    Object.fromEntries(columns.map((column) => [column.key, column.defaultFilteredValue ?? []])),
  );
  const pendingFilters = useRef(filters);
  useLayoutEffect(() => {
    pendingFilters.current = filters;
  }, [filters]);
  const [page, setPage] = useState(() => ({
    current: paginationNumber(pagination ? pagination.defaultCurrent : undefined, 1),
    pageSize: paginationNumber(
      pagination ? (pagination.pageSize ?? pagination.defaultPageSize) : undefined,
      10,
    ),
  }));
  const [selected, setSelected] = useState<TableRowKey[]>([
    ...(rowSelection?.defaultSelectedRowKeys ?? []),
  ]);
  const activeSorters = resolveSorters(columns, sorting);
  const sorted = manual
    ? dataSource
    : matchingRows(dataSource, columns, currentFilters(), activeSorters);
  const total = manual && pagination !== false ? pagination?.total : sorted.length;
  if (total === undefined) {
    throw new TypeError('Table manual pagination requires pagination.total.');
  }
  const pageSize = paginationNumber(pagination ? pagination.pageSize : undefined, page.pageSize);
  const requestedPage = paginationNumber(
    pagination ? pagination.current : undefined,
    pageSize !== page.pageSize ? 1 : page.current,
  );
  const { current: currentPage, pageCount } = getPaginationState({
    total,
    current: requestedPage,
    pageSize,
  });
  const storedPage = pagination && pagination.current !== undefined ? page.current : currentPage;
  if (pagination !== false && (storedPage !== page.current || pageSize !== page.pageSize)) {
    setPage({ current: storedPage, pageSize });
  }
  const rows =
    manual || pagination === false ? sorted : paginateTableRows(sorted, currentPage, pageSize);
  const selectedKeys = rowSelection?.selectedRowKeys ?? selected;
  const sourceKeys =
    rowSelection || expandable ? dataSource.map((record) => recordKey(record, rowKey)) : [];
  if (new Set(sourceKeys.map(String)).size !== sourceKeys.length) {
    throw new Error('Table selection and expansion require unique rowKey or record.key values.');
  }
  const keysOnPage = rows
    .map((record, index) =>
      recordKey(
        record,
        rowKey,
        rowSelection || expandable ? undefined : (currentPage - 1) * pageSize + index,
      ),
    )
    .filter((_, index) => !rowSelection?.getCheckboxProps?.(rows[index]!)?.disabled);
  const selectedOnPage = keysOnPage.filter((key) => selectedKeys.includes(key)).length;

  function filterValues(
    column: TableColumn<RecordType>,
    source = filters,
  ): readonly TableFilterValue[] {
    return column.filteredValue !== undefined
      ? (column.filteredValue ?? [])
      : (source[column.key] ?? []);
  }

  function currentFilters(
    override?: { key: string; values: readonly TableFilterValue[] },
    source = filters,
  ): TableChangeFilters {
    return Object.fromEntries(
      columns
        .filter((column) => column.filters || column.filterDropdown || column.onFilter)
        .map((column) => [
          column.key,
          override?.key === column.key ? override.values : filterValues(column, source),
        ]),
    );
  }

  function currentSorter(): TableChangeSorter {
    return (
      resolveSorters(columns, pendingSorting.current)[0] ?? {
        columnKey:
          columns.find((column) => column.sortOrder !== undefined)?.key ??
          pendingSorting.current[0]?.columnKey,
        order: null,
      }
    );
  }

  function publishChange(
    action: 'sort' | 'filter' | 'paginate',
    nextPage: number,
    nextFilters: TableChangeFilters,
    nextSorter: TableChangeSorter,
    sorters = resolveSorters(columns, pendingSorting.current),
  ) {
    onChange?.({ current: nextPage, pageSize }, nextFilters, nextSorter, {
      action,
      sorters,
      currentDataSource: manual
        ? dataSource
        : matchingRows(dataSource, columns, nextFilters, sorters),
    });
  }

  function changeSort(column: TableColumn<RecordType>) {
    const current =
      resolveSorters(columns, pendingSorting.current).find(
        (sorter) => sorter.columnKey === column.key,
      )?.order ?? null;
    const order = current === null ? 'ascend' : current === 'ascend' ? 'descend' : null;
    const next: TableChangeSorter = { columnKey: column.key, order };
    const requested = changeSorters(columns, pendingSorting.current, next);
    if (column.sortOrder === undefined) {
      pendingSorting.current = requested;
      setSorting(requested);
    }
    publishChange(
      'sort',
      currentPage,
      currentFilters(undefined, pendingFilters.current),
      next,
      resolveSorters(columns, requested, next),
    );
  }
  function changePage(next: number) {
    if (pagination === false) {
      return;
    }
    if (pagination?.current === undefined) {
      setPage({ current: next, pageSize });
    }
    pagination?.onChange?.(next, pageSize);
    publishChange(
      'paginate',
      next,
      currentFilters(undefined, pendingFilters.current),
      currentSorter(),
    );
  }
  function changeFilter(column: TableColumn<RecordType>, values: TableFilterValue[]) {
    if (column.filteredValue === undefined) {
      pendingFilters.current = { ...pendingFilters.current, [column.key]: values };
      setFilters(pendingFilters.current);
    }
    if (pagination !== false) {
      if (pagination?.current === undefined) {
        setPage({ current: 1, pageSize });
      }
      pagination?.onChange?.(1, pageSize);
    }
    publishChange(
      'filter',
      1,
      currentFilters({ key: column.key, values }, pendingFilters.current),
      currentSorter(),
    );
  }
  function changeSelection(next: TableRowKey[]) {
    if (rowSelection?.selectedRowKeys === undefined) {
      setSelected(next);
    }
    rowSelection?.onChange?.(
      next,
      dataSource.filter((_, index) => next.includes(sourceKeys[index]!)),
    );
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
  const footer = summary?.(rows);

  const table = (
    <table
      {...tableProps}
      aria-busy={loading || tableProps['aria-busy']}
      ref={tableRef}
      data-ui="table"
      data-sticky={Boolean(sticky)}
      data-ellipsis={columns.some((column) => column.ellipsis)}
      style={tableStyle}
    >
      <thead>
        {headerRows.map((headerRow, rowIndex) => (
          <tr
            key={rowIndex}
            {...onHeaderRow?.(
              headerRow.map((cell) => cell.column),
              rowIndex,
            )}
          >
            {rowIndex === 0 && rowSelection && (
              <th
                rowSpan={headerRows.length}
                scope="col"
                data-slot="selection-cell"
                data-fixed="left"
                style={{ ...headerStyle, position: 'sticky', left: 0, zIndex: 3 }}
                aria-label="Выбор строк"
              >
                {rowSelection.type !== 'radio' && (
                  <CheckboxAdapter
                    aria-label="Выбрать все строки на странице"
                    checked={keysOnPage.length > 0 && selectedOnPage === keysOnPage.length}
                    indeterminate={selectedOnPage > 0 && selectedOnPage < keysOnPage.length}
                    disabled={keysOnPage.length === 0}
                    onChange={(event) =>
                      changeSelection(
                        event.target.checked
                          ? [...new Set([...selectedKeys, ...keysOnPage])]
                          : selectedKeys.filter((key) => !keysOnPage.includes(key)),
                      )
                    }
                  />
                )}
              </th>
            )}
            {rowIndex === 0 && expandable && (
              <th
                rowSpan={headerRows.length}
                scope="col"
                data-slot="expansion-cell"
                data-fixed="left"
                style={{ ...headerStyle, position: 'sticky', left: selectionWidth, zIndex: 3 }}
                aria-label="Раскрытие строк"
              >
                {expandable.columnTitle}
              </th>
            )}
            {headerRow.map((cell, index) => {
              const { column, columnIndex, colSpan, rowSpan } = cell;
              const group = Boolean(column.children?.length);
              const cellProps = headerCells[rowIndex]![index];
              if (cellProps?.colSpan === 0 || cellProps?.rowSpan === 0) {
                return null;
              }
              const order = !group
                ? (activeSorters.find((sorter) => sorter.columnKey === column.key)?.order ?? null)
                : null;
              const values = filterValues(column);
              const sortIndex = activeSorters.findIndex(
                (sorter) => sorter.columnKey === column.key,
              );
              const ariaSort =
                !group && column.sorter && (activeSorters.length < 2 || sortIndex === 0)
                  ? order === 'ascend'
                    ? 'ascending'
                    : order === 'descend'
                      ? 'descending'
                      : 'none'
                  : undefined;
              return (
                <th
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
                  aria-description={
                    cellProps?.['aria-description'] ??
                    (order && activeSorters.length > 1
                      ? `Сортировка ${order === 'ascend' ? 'по возрастанию' : 'по убыванию'}, приоритет ${sortIndex + 1}`
                      : undefined)
                  }
                  style={{
                    textAlign: column.align,
                    ...cellProps?.style,
                    ...fixedStyle(
                      columns,
                      column.fixed === 'right' ? columnIndex + colSpan - 1 : columnIndex,
                      widths,
                      controlWidth,
                    ),
                    ...(group ? { width: undefined, minWidth: undefined } : {}),
                    ...headerStyle,
                    ...(sticky
                      ? { top: (headerStyle.top as number) + (headerOffsets[rowIndex] ?? 0) }
                      : {}),
                    ...(column.fixed ? { zIndex: 3 } : {}),
                  }}
                >
                  {!group && column.sorter ? (
                    <button
                      type="button"
                      data-slot="sort-trigger"
                      aria-label={
                        column.sortLabel ?? `Сортировать ${String(column.title ?? column.key)}`
                      }
                      onClick={() => changeSort(column)}
                    >
                      {column.title}
                      <span data-slot="sort-indicator" aria-hidden="true">
                        {order === 'ascend' ? '↑' : order === 'descend' ? '↓' : '↕'}
                      </span>
                    </button>
                  ) : column.ellipsis ? (
                    <TableEllipsis tooltip={slotProps?.tooltip}>{column.title}</TableEllipsis>
                  ) : (
                    column.title
                  )}
                  {!group && (
                    <TableFilterMenu
                      column={column}
                      values={values}
                      slots={slotProps?.filter}
                      onApply={(next) => changeFilter(column, next)}
                    />
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((record, rowIndex) => {
            const key = recordKey(
              record,
              rowKey,
              rowSelection || expandable ? undefined : (currentPage - 1) * pageSize + rowIndex,
            );
            const canExpand = Boolean(expandable && (expandable.rowExpandable?.(record) ?? true));
            const open = canExpand && expandedKeys.includes(key);
            const disclosure = getDisclosureState({
              open,
              triggerId: `${selectionName}-${encodeURIComponent(String(key))}-trigger`,
              panelId: `${selectionName}-${encodeURIComponent(String(key))}-detail`,
            });
            return (
              <Fragment key={key}>
                <tr {...onRow?.(record, rowIndex)} data-selected={selectedKeys.includes(key)}>
                  {rowSelection && (
                    <td
                      data-slot="selection-cell"
                      data-fixed="left"
                      style={{ position: 'sticky', left: 0, zIndex: 1 }}
                    >
                      <input
                        type={rowSelection.type === 'radio' ? 'radio' : 'checkbox'}
                        name={rowSelection.type === 'radio' ? selectionName : undefined}
                        aria-label={`Выбрать строку ${key}`}
                        checked={selectedKeys.includes(key)}
                        disabled={rowSelection.getCheckboxProps?.(record)?.disabled}
                        onChange={(event) =>
                          changeSelection(
                            rowSelection.type === 'radio'
                              ? [key]
                              : getSelectionValue(selectedKeys, {
                                  type: event.target.checked ? 'select' : 'deselect',
                                  value: key,
                                }),
                          )
                        }
                      />
                    </td>
                  )}
                  {expandable && (
                    <td
                      data-slot="expansion-cell"
                      data-fixed="left"
                      style={{ position: 'sticky', left: selectionWidth, zIndex: 1 }}
                    >
                      {canExpand && (
                        <ButtonAdapter
                          {...disclosure.triggerProps}
                          data-slot="expand-trigger"
                          aria-label={`${open ? 'Свернуть' : 'Раскрыть'} строку ${key}`}
                          onClick={() => changeExpansion(record, key)}
                        >
                          {expandable.expandIcon?.(open, record) ?? (
                            <span aria-hidden="true">{open ? '−' : '+'}</span>
                          )}
                        </ButtonAdapter>
                      )}
                    </td>
                  )}
                  {columns.map((column, index) => {
                    const cellProps = column.onCell?.(record, rowIndex);
                    if (cellProps?.colSpan === 0 || cellProps?.rowSpan === 0) {
                      return null;
                    }
                    const value = cellValue(record, column.dataIndex);
                    const content = column.render
                      ? column.render(value, record, rowIndex)
                      : String(value ?? '');
                    return (
                      <td
                        {...cellProps}
                        key={column.key}
                        data-slot="cell"
                        data-fixed={column.fixed}
                        headers={cellProps?.headers ?? columnHeaders[index]?.join(' ')}
                        style={{
                          textAlign: column.align,
                          ...cellProps?.style,
                          ...fixedStyle(columns, index, widths, controlWidth),
                        }}
                      >
                        {column.ellipsis ? (
                          <TableEllipsis tooltip={slotProps?.tooltip}>{content}</TableEllipsis>
                        ) : (
                          content
                        )}
                      </td>
                    );
                  })}
                </tr>
                {open && expandable && (
                  <TableDetailRow
                    id={disclosure.panelProps.id}
                    triggerId={disclosure.triggerProps.id}
                    colSpan={columns.length + (rowSelection ? 1 : 0) + 1}
                  >
                    {expandable.expandedRowRender(record, rowIndex)}
                  </TableDetailRow>
                )}
              </Fragment>
            );
          })
        ) : (
          <tr>
            <td
              data-slot="empty"
              colSpan={columns.length + (rowSelection ? 1 : 0) + (expandable ? 1 : 0)}
            >
              {locale?.emptyText ?? 'Нет данных'}
            </td>
          </tr>
        )}
      </tbody>
      {footer != null && footer !== false && <tfoot data-slot="summary">{footer}</tfoot>}
    </table>
  );

  return (
    <div data-slot="table-container">
      {scroll ? (
        <div
          data-slot="scroll-container"
          style={{ overflow: 'auto', maxHeight: scroll.y, maxWidth: '100%' }}
        >
          {table}
        </div>
      ) : (
        table
      )}
      {loading && (
        <LoaderAdapter
          label="Загрузка таблицы"
          showLabel
          {...slotProps?.loader}
          loading
          data-slot="loading"
        />
      )}
      {pagination !== false && pageCount > 1 && (
        <PaginationAdapter
          simple
          total={total}
          current={currentPage}
          pageSize={pageSize}
          onChange={changePage}
          aria-label="Страницы таблицы"
          data-slot="pagination"
        />
      )}
    </div>
  );
}
