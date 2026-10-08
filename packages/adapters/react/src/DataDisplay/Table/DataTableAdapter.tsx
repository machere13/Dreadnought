import { useId, useImperativeHandle, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { PaginationAdapter } from '../../Navigation/Pagination/index.ts';
import { LoaderAdapter } from '../../Feedback/Loader/index.ts';
import { TableHead } from './TableHead.tsx';
import { TableBody } from './TableBody.tsx';
import { useDataTableState } from './useDataTableState.ts';
import { useTableWidths } from './useTableWidths.ts';
import { groupedColumns, tableHeaders } from './tableData.ts';
import type { TableDataAdapterProps } from './table.types.ts';

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
  const layout = useTableWidths(columns, {
    selection: Boolean(rowSelection),
    expansion: Boolean(expandable),
    sticky: Boolean(sticky),
    signature: headers.signature,
  });
  const state = useDataTableState({
    columns,
    dataSource,
    rowKey,
    pagination,
    rowSelection,
    expandable,
    onChange,
    manual,
  });
  useImperativeHandle(tableProps.ref, () => layout.table.current!);
  const tableStyle = {
    ...tableProps.style,
    ...(scroll?.x ? { minWidth: scroll.x } : {}),
  } as CSSProperties;
  const footer = summary?.(state.rows);

  const table = (
    <table
      {...tableProps}
      aria-busy={loading || tableProps['aria-busy']}
      ref={layout.table}
      data-ui="table"
      data-sticky={Boolean(sticky)}
      data-ellipsis={columns.some((column) => column.ellipsis)}
      style={tableStyle}
    >
      <TableHead
        columns={columns}
        headerRows={headerRows}
        headers={headers}
        layout={layout}
        state={state}
        rowSelection={rowSelection}
        expandable={expandable}
        sticky={sticky}
        slotProps={slotProps}
        onHeaderRow={onHeaderRow}
      />
      <TableBody
        columns={columns}
        columnHeaders={headers.columnHeaders}
        layout={layout}
        state={state}
        rowKey={rowKey}
        rowSelection={rowSelection}
        expandable={expandable}
        selectionName={selectionName}
        slotProps={slotProps}
        onRow={onRow}
        locale={locale}
      />
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
      {pagination !== false && state.pageCount > 1 && (
        <PaginationAdapter
          simple
          total={state.total}
          current={state.currentPage}
          pageSize={state.pageSize}
          onChange={state.changePage}
          aria-label="Страницы таблицы"
          data-slot="pagination"
        />
      )}
    </div>
  );
}
