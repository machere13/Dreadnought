import type { CSSProperties } from 'react';
import { CheckboxAdapter } from '../../Fields/Checkbox/CheckboxAdapter.tsx';
import { TableFilterMenu } from './TableFilterMenu.tsx';
import { TableEllipsis } from './TableEllipsis.tsx';
import { fixedStyle, resolveFilterValues } from './tableData.ts';
import type { groupedColumns, tableHeaders } from './tableData.ts';
import type { TableDataAdapterProps } from './table.types.ts';
import type { useDataTableState } from './useDataTableState.ts';
import type { useTableWidths } from './useTableWidths.ts';

type TableHeadProps<RecordType extends object> = Pick<
  TableDataAdapterProps<RecordType>,
  'columns' | 'rowSelection' | 'expandable' | 'sticky' | 'slotProps' | 'onHeaderRow'
> & {
  headerRows: ReturnType<typeof groupedColumns<RecordType>>['rows'];
  headers: ReturnType<typeof tableHeaders<RecordType>>;
  layout: ReturnType<typeof useTableWidths<RecordType>>;
  state: Pick<
    ReturnType<typeof useDataTableState<RecordType>>,
    | 'activeSorters'
    | 'localFilters'
    | 'keysOnPage'
    | 'selectedOnPage'
    | 'selectedKeys'
    | 'changeSort'
    | 'changeFilter'
    | 'changeSelection'
  >;
};

export function TableHead<RecordType extends object>({
  columns,
  rowSelection,
  expandable,
  sticky,
  slotProps,
  onHeaderRow,
  headerRows,
  headers,
  layout,
  state,
}: TableHeadProps<RecordType>) {
  const {
    activeSorters,
    localFilters,
    keysOnPage,
    selectedOnPage,
    selectedKeys,
    changeSort,
    changeFilter,
    changeSelection,
  } = state;
  const { widths, selectionWidth, expansionWidth, headerOffsets } = layout;
  const controlWidth = selectionWidth + expansionWidth;
  const headerStyle: CSSProperties = sticky
    ? {
        position: 'sticky',
        top: typeof sticky === 'object' ? (sticky.offsetHeader ?? 0) : 0,
        zIndex: 2,
      }
    : {};
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

  return (
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
  );
}
