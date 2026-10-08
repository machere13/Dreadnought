import type { CSSProperties } from 'react';
import { filterTableRows, getTableHeaderRows, sortTableRowsBy } from '@dreadnought/core';
import type {
  TableChangeFilters,
  TableChangeSorter,
  TableColumn,
  TableDataAdapterProps,
  TableFilterValue,
  TableRowKey,
} from './table.types.ts';

export function groupedColumns<RecordType extends object>(
  source: readonly TableColumn<RecordType>[],
) {
  const layout = getTableHeaderRows(source);
  const resolved = new Map<string, TableColumn<RecordType>>();
  for (const row of layout.rows) {
    for (const cell of row) {
      const column = cell.column;
      const fixed =
        column.fixed ?? (cell.parentKey === null ? undefined : resolved.get(cell.parentKey)?.fixed);
      resolved.set(column.key, fixed === column.fixed ? column : { ...column, fixed });
    }
  }
  const columns = layout.columns.map((column) => resolved.get(column.key)!);
  for (const row of layout.rows) {
    for (const cell of row) {
      if (!cell.column.children?.length) {
        continue;
      }
      const children = columns.slice(cell.columnIndex, cell.columnIndex + cell.colSpan);
      const fixed = children[0]?.fixed;
      if (children.some((column) => column.fixed !== fixed)) {
        throw new TypeError('Table column groups cannot cross fixed regions.');
      }
      const column = resolved.get(cell.column.key)!;
      resolved.set(column.key, fixed === column.fixed ? column : { ...column, fixed });
    }
  }
  return {
    columns,
    rows: layout.rows.length
      ? layout.rows.map((row) =>
          row.map((cell) => ({ ...cell, column: resolved.get(cell.column.key)! })),
        )
      : [[]],
  };
}

export function tableHeaders<RecordType extends object>(
  rows: ReturnType<typeof groupedColumns<RecordType>>['rows'],
  idPrefix: string,
  columnCount: number,
) {
  const cells = rows.map((row) =>
    row.map((cell) => cell.column.onHeaderCell?.(cell.column, cell.columnIndex)),
  );
  const signature = rows
    .map((row, rowIndex) =>
      row
        .map((cell, index) => {
          const props = cells[rowIndex]![index];
          const colSpan = props?.colSpan ?? cell.colSpan;
          const rowSpan = props?.rowSpan ?? cell.rowSpan;
          return `${cell.column.key}:${colSpan}:${rowSpan}`;
        })
        .join(','),
    )
    .join(';');
  const ids = new Map<string, string>();
  const columnHeaders = Array.from({ length: columnCount }, () => [] as string[]);
  rows.forEach((row, rowIndex) =>
    row.forEach((cell, index) => {
      const props = cells[rowIndex]![index];
      if (props?.colSpan === 0 || props?.rowSpan === 0) {
        return;
      }
      const id = props?.id ?? `${idPrefix}-header-${encodeURIComponent(cell.column.key)}`;
      ids.set(cell.column.key, id);
      for (let leaf = cell.columnIndex; leaf < cell.columnIndex + cell.colSpan; leaf++) {
        columnHeaders[leaf]!.push(id);
      }
    }),
  );
  return { cells, signature, ids, columnHeaders };
}

export function resolveFilterValues<RecordType extends object>(
  column: TableColumn<RecordType>,
  localFilters: TableChangeFilters,
): readonly TableFilterValue[] {
  if (column.filteredValue !== undefined) {
    return column.filteredValue ?? [];
  }
  return localFilters[column.key] ?? [];
}

export function resolveFilters<RecordType extends object>(
  columns: readonly TableColumn<RecordType>[],
  localFilters: TableChangeFilters,
  requestedFilter?: { columnKey: string; values: readonly TableFilterValue[] },
): TableChangeFilters {
  return Object.fromEntries(
    columns
      .filter((column) => column.filters || column.filterDropdown || column.onFilter)
      .map((column) => [
        column.key,
        requestedFilter?.columnKey === column.key
          ? requestedFilter.values
          : resolveFilterValues(column, localFilters),
      ]),
  );
}

export function matchingRows<RecordType extends object>(
  data: readonly RecordType[],
  columns: readonly TableColumn<RecordType>[],
  filters: TableChangeFilters,
  sorters: readonly TableChangeSorter[],
) {
  const filtered = filterTableRows(
    data,
    columns
      .filter((column) => column.onFilter)
      .map((column) => ({
        values: filters[column.key] ?? [],
        predicate: column.onFilter!,
      })),
  );
  return sortTableRowsBy(
    filtered,
    sorters.flatMap((sorter) => {
      const column = columns.find((column) => column.key === sorter.columnKey);
      const compare =
        typeof column?.sorter === 'object'
          ? column.sorter.compare
          : typeof column?.sorter === 'function'
            ? column.sorter
            : undefined;
      return compare ? [{ compare, order: sorter.order }] : [];
    }),
  );
}

export function cellValue<RecordType extends object>(
  record: RecordType,
  dataIndex: TableColumn<RecordType>['dataIndex'],
) {
  if (dataIndex === undefined) {
    return undefined;
  }
  const path = Array.isArray(dataIndex) ? dataIndex : [dataIndex];
  return path.reduce<unknown>(
    (value, segment) =>
      value != null && typeof value === 'object'
        ? (value as Record<string | number, unknown>)[segment]
        : undefined,
    record,
  );
}

export function recordKey<RecordType extends object>(
  record: RecordType,
  rowKey: TableDataAdapterProps<RecordType>['rowKey'],
  index?: number,
): TableRowKey {
  const value =
    typeof rowKey === 'function' ? rowKey(record) : record[rowKey ?? ('key' as keyof RecordType)];
  if (typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) {
    return value;
  }
  if (index !== undefined) {
    return index;
  }
  throw new Error(
    'Table selection and expansion require a string or finite number from rowKey or record.key.',
  );
}

export function paginationNumber(value: number | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new RangeError('Table pagination requires a positive integer.');
  }
  return value;
}

export function fixedStyle<RecordType extends object>(
  columns: readonly TableColumn<RecordType>[],
  index: number,
  widths: readonly number[],
  selectionWidth: number,
): CSSProperties | undefined {
  const column = columns[index];
  if (!column) {
    return undefined;
  }
  const style: CSSProperties = column.width ? { width: column.width, minWidth: column.width } : {};
  if (column.fixed) {
    const offset = columns.reduce(
      (sum, item, sibling) =>
        item.fixed === column.fixed && (column.fixed === 'left' ? sibling < index : sibling > index)
          ? sum + (widths[sibling] || item.width || 0)
          : sum,
      0,
    );
    style[column.fixed] = offset + (column.fixed === 'left' ? selectionWidth : 0);
    style.position = 'sticky';
    style.zIndex = 1;
  }
  return style;
}
