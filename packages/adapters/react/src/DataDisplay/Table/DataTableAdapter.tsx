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
  resolveFilters,
  resolveFilterValues,
  tableHeaders,
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
  const headers = tableHeaders(headerRows, selectionName, columns.length);
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
    signature: headers.signature,
  });
  const controlWidth = selectionWidth + expansionWidth;
  const [localExpandedKeys, setLocalExpandedKeys] = useState<TableRowKey[]>(() => [
    ...(expandable?.defaultExpandedRowKeys ?? []),
  ]);
  const expandedKeys = expandable?.expandedRowKeys ?? localExpandedKeys;
  const expandedKeysRef = useRef(expandedKeys);
  useLayoutEffect(() => {
    expandedKeysRef.current = expandedKeys;
  }, [expandedKeys]);
  useImperativeHandle(tableProps.ref, () => tableRef.current!);
  const headerStyle: CSSProperties = sticky
    ? {
        position: 'sticky',
        top: typeof sticky === 'object' ? (sticky.offsetHeader ?? 0) : 0,
        zIndex: 2,
      }
    : {};
  const [localSorters, setLocalSorters] = useState(() => defaultSorters(columns));
  const sortersRef = useRef(localSorters);
  useLayoutEffect(() => {
    sortersRef.current = localSorters;
  }, [localSorters]);
  const [localFilters, setLocalFilters] = useState<TableChangeFilters>(() =>
    Object.fromEntries(columns.map((column) => [column.key, column.defaultFilteredValue ?? []])),
  );
  const filtersRef = useRef(localFilters);
  useLayoutEffect(() => {
    filtersRef.current = localFilters;
  }, [localFilters]);
  const [localPage, setLocalPage] = useState(() => ({
    current: paginationNumber(pagination ? pagination.defaultCurrent : undefined, 1),
    pageSize: paginationNumber(
      pagination ? (pagination.pageSize ?? pagination.defaultPageSize) : undefined,
      10,
    ),
  }));
  const [localSelectedKeys, setLocalSelectedKeys] = useState<TableRowKey[]>([
    ...(rowSelection?.defaultSelectedRowKeys ?? []),
  ]);
  const activeSorters = resolveSorters(columns, localSorters);
  const sorted = manual
    ? dataSource
    : matchingRows(dataSource, columns, resolveFilters(columns, localFilters), activeSorters);
  const total = manual && pagination !== false ? pagination?.total : sorted.length;
  if (total === undefined) {
    throw new TypeError('Table manual pagination requires pagination.total.');
  }
  const pageSize = paginationNumber(
    pagination ? pagination.pageSize : undefined,
    localPage.pageSize,
  );
  const requestedPage = paginationNumber(
    pagination ? pagination.current : undefined,
    pageSize !== localPage.pageSize ? 1 : localPage.current,
  );
  const { current: currentPage, pageCount } = getPaginationState({
    total,
    current: requestedPage,
    pageSize,
  });
  const storedPage =
    pagination && pagination.current !== undefined ? localPage.current : currentPage;
  if (
    pagination !== false &&
    (storedPage !== localPage.current || pageSize !== localPage.pageSize)
  ) {
    setLocalPage({ current: storedPage, pageSize });
  }
  const rows =
    manual || pagination === false ? sorted : paginateTableRows(sorted, currentPage, pageSize);
  const selectedKeys = rowSelection?.selectedRowKeys ?? localSelectedKeys;
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

  function getChangeSorter(): TableChangeSorter {
    return (
      resolveSorters(columns, sortersRef.current)[0] ?? {
        columnKey:
          columns.find((column) => column.sortOrder !== undefined)?.key ??
          sortersRef.current[0]?.columnKey,
        order: null,
      }
    );
  }

  function publishChange(
    action: 'sort' | 'filter' | 'paginate',
    requestedPage: number,
    requestedFilters: TableChangeFilters,
    requestedSorter: TableChangeSorter,
    requestedSorters = resolveSorters(columns, sortersRef.current),
  ) {
    onChange?.({ current: requestedPage, pageSize }, requestedFilters, requestedSorter, {
      action,
      sorters: requestedSorters,
      currentDataSource: manual
        ? dataSource
        : matchingRows(dataSource, columns, requestedFilters, requestedSorters),
    });
  }

  function changeSort(column: TableColumn<RecordType>) {
    const currentOrder =
      resolveSorters(columns, sortersRef.current).find((sorter) => sorter.columnKey === column.key)
        ?.order ?? null;
    const order = currentOrder === null ? 'ascend' : currentOrder === 'ascend' ? 'descend' : null;
    const requestedSorter: TableChangeSorter = { columnKey: column.key, order };
    const requestedSorters = changeSorters(columns, sortersRef.current, requestedSorter);
    if (column.sortOrder === undefined) {
      sortersRef.current = requestedSorters;
      setLocalSorters(requestedSorters);
    }
    publishChange(
      'sort',
      currentPage,
      resolveFilters(columns, filtersRef.current),
      requestedSorter,
      resolveSorters(columns, requestedSorters, requestedSorter),
    );
  }
  function changePage(requestedPage: number) {
    if (pagination === false) {
      return;
    }
    if (pagination?.current === undefined) {
      setLocalPage({ current: requestedPage, pageSize });
    }
    pagination?.onChange?.(requestedPage, pageSize);
    publishChange(
      'paginate',
      requestedPage,
      resolveFilters(columns, filtersRef.current),
      getChangeSorter(),
    );
  }
  function changeFilter(column: TableColumn<RecordType>, values: TableFilterValue[]) {
    if (column.filteredValue === undefined) {
      filtersRef.current = { ...filtersRef.current, [column.key]: values };
      setLocalFilters(filtersRef.current);
    }
    if (pagination !== false) {
      if (pagination?.current === undefined) {
        setLocalPage({ current: 1, pageSize });
      }
      pagination?.onChange?.(1, pageSize);
    }
    publishChange(
      'filter',
      1,
      resolveFilters(columns, filtersRef.current, { columnKey: column.key, values }),
      getChangeSorter(),
    );
  }
  function changeSelection(requestedKeys: TableRowKey[]) {
    if (rowSelection?.selectedRowKeys === undefined) {
      setLocalSelectedKeys(requestedKeys);
    }
    rowSelection?.onChange?.(
      requestedKeys,
      dataSource.filter((_, index) => requestedKeys.includes(sourceKeys[index]!)),
    );
  }
  function changeExpansion(record: RecordType, key: TableRowKey) {
    const previousKeys = expandable?.expandedRowKeys ?? expandedKeysRef.current;
    const requestedKeys = getSelectionValue(previousKeys, { type: 'toggle', value: key });
    if (expandable?.expandedRowKeys === undefined) {
      expandedKeysRef.current = requestedKeys;
      setLocalExpandedKeys(requestedKeys);
    }
    expandable?.onExpand?.(requestedKeys.includes(key), record);
    expandable?.onExpandedRowsChange?.(requestedKeys);
  }

  function renderHeaderCell(
    cell: (typeof headerRows)[number][number],
    index: number,
    rowIndex: number,
  ) {
    const { column, columnIndex, colSpan, rowSpan } = cell;
    const group = Boolean(column.children?.length);
    const cellProps = headers.cells[rowIndex]![index];
    if (cellProps?.colSpan === 0 || cellProps?.rowSpan === 0) {
      return null;
    }
    const order = !group
      ? (activeSorters.find((sorter) => sorter.columnKey === column.key)?.order ?? null)
      : null;
    const values = resolveFilterValues(column, localFilters);
    const sortIndex = activeSorters.findIndex((sorter) => sorter.columnKey === column.key);
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
        id={headers.ids.get(column.key)}
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
          ...(sticky ? { top: (headerStyle.top as number) + (headerOffsets[rowIndex] ?? 0) } : {}),
          ...(column.fixed ? { zIndex: 3 } : {}),
        }}
      >
        {!group && column.sorter ? (
          <button
            type="button"
            data-slot="sort-trigger"
            aria-label={column.sortLabel ?? `Сортировать ${String(column.title ?? column.key)}`}
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
  }

  function renderCell(
    record: RecordType,
    rowIndex: number,
    column: TableColumn<RecordType>,
    index: number,
  ) {
    const cellProps = column.onCell?.(record, rowIndex);
    if (cellProps?.colSpan === 0 || cellProps?.rowSpan === 0) {
      return null;
    }
    const value = cellValue(record, column.dataIndex);
    const content = column.render ? column.render(value, record, rowIndex) : String(value ?? '');
    return (
      <td
        {...cellProps}
        key={column.key}
        data-slot="cell"
        data-fixed={column.fixed}
        headers={cellProps?.headers ?? headers.columnHeaders[index]?.join(' ')}
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
            {headerRow.map((cell, index) => renderHeaderCell(cell, index, rowIndex))}
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
                  {columns.map((column, index) => renderCell(record, rowIndex, column, index))}
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
