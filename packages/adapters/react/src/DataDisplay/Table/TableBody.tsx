import { Fragment } from 'react';
import { getDisclosureState, getSelectionValue } from '@dreadnought/core';
import { ButtonAdapter } from '../../Controls/Button/index.ts';
import { TableDetailRow } from './TableDetailRow.tsx';
import { TableEllipsis } from './TableEllipsis.tsx';
import { cellValue, fixedStyle, recordKey } from './tableData.ts';
import type { TableColumn, TableDataAdapterProps } from './table.types.ts';
import type { useDataTableState } from './useDataTableState.ts';
import type { useTableWidths } from './useTableWidths.ts';

type TableBodyProps<RecordType extends object> = Pick<
  TableDataAdapterProps<RecordType>,
  'columns' | 'rowKey' | 'rowSelection' | 'expandable' | 'slotProps' | 'onRow' | 'locale'
> & {
  selectionName: string;
  columnHeaders: readonly (readonly string[])[];
  layout: ReturnType<typeof useTableWidths<RecordType>>;
  state: Pick<
    ReturnType<typeof useDataTableState<RecordType>>,
    | 'rows'
    | 'currentPage'
    | 'pageSize'
    | 'selectedKeys'
    | 'expandedKeys'
    | 'changeSelection'
    | 'changeExpansion'
  >;
};

export function TableBody<RecordType extends object>({
  columns,
  rowKey,
  rowSelection,
  expandable,
  slotProps,
  onRow,
  locale,
  selectionName,
  columnHeaders,
  layout,
  state,
}: TableBodyProps<RecordType>) {
  const {
    rows,
    currentPage,
    pageSize,
    selectedKeys,
    expandedKeys,
    changeSelection,
    changeExpansion,
  } = state;
  const { widths, selectionWidth, expansionWidth } = layout;
  const controlWidth = selectionWidth + expansionWidth;
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
  }

  return (
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
  );
}
