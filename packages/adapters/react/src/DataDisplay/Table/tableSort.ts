import type { TableChangeSorter, TableColumn } from './table.types.ts';

export function isMultiple<RecordType extends object>(column: TableColumn<RecordType>) {
  return typeof column.sorter === 'object';
}

export function defaultSorters<RecordType extends object>(
  columns: readonly TableColumn<RecordType>[],
): TableChangeSorter[] {
  const defaults = columns.filter((column) => column.defaultSortOrder);
  return (
    defaults[0] && !isMultiple(defaults[0]) ? defaults.slice(0, 1) : defaults.filter(isMultiple)
  ).map((column) => ({ columnKey: column.key, order: column.defaultSortOrder! }));
}

export function resolveSorters<RecordType extends object>(
  columns: readonly TableColumn<RecordType>[],
  state: readonly TableChangeSorter[],
  override?: TableChangeSorter,
): TableChangeSorter[] {
  const controlledSingle = columns.find(
    (column) => !isMultiple(column) && column.sortOrder !== undefined,
  );
  const result = columns.flatMap((column) => {
    if (
      typeof column.sorter === 'object' &&
      (!Number.isFinite(column.sorter.multiple) ||
        (column.sorter.compare !== undefined && typeof column.sorter.compare !== 'function'))
    ) {
      throw new TypeError(
        'Table multiple sorter requires a finite priority and an optional compare function.',
      );
    }
    const order =
      override?.columnKey === column.key
        ? override.order
        : column.sortOrder !== undefined
          ? column.sortOrder
          : state.find((sorter) => sorter.columnKey === column.key)?.order;
    return order ? [{ columnKey: column.key, order }] : [];
  });
  const requestedSingle =
    override && columns.find((column) => column.key === override.columnKey && !isMultiple(column));
  if (requestedSingle) {
    return result.filter((sorter) => sorter.columnKey === requestedSingle.key);
  }
  if (controlledSingle) {
    return result.filter((sorter) => sorter.columnKey === controlledSingle.key);
  }
  const single = result.find(
    (sorter) => !isMultiple(columns.find((column) => column.key === sorter.columnKey)!),
  );
  if (single) {
    return [single];
  }
  return result.sort((a, b) => {
    const priority = (key: string | undefined) => {
      const sorter = columns.find((column) => column.key === key)?.sorter;
      return typeof sorter === 'object' ? sorter.multiple : 0;
    };
    return priority(b.columnKey) - priority(a.columnKey);
  });
}

export function changeSorters<RecordType extends object>(
  columns: readonly TableColumn<RecordType>[],
  state: readonly TableChangeSorter[],
  next: TableChangeSorter,
): TableChangeSorter[] {
  const column = columns.find((column) => column.key === next.columnKey)!;
  if (!isMultiple(column)) {
    return [next];
  }
  return [
    ...state.filter((sorter) => {
      const previous = columns.find((column) => column.key === sorter.columnKey);
      return sorter.columnKey !== next.columnKey && (!previous || isMultiple(previous));
    }),
    next,
  ];
}
