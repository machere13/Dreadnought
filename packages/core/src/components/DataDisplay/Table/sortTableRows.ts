export type TableSortOrder = 'ascend' | 'descend' | null;
export type TableRowSorter<RecordType> = { compare: (a: RecordType, b: RecordType) => number; order: TableSortOrder };

export function sortTableRowsBy<RecordType>(rows: readonly RecordType[], sorters: readonly TableRowSorter<RecordType>[]): RecordType[] {
  const active = sorters.filter(sorter => sorter.order);
  if (!active.length) return [...rows];
  return rows.map((record, index) => ({ record, index }))
    .sort((a, b) => {
      for (const sorter of active) {
        const result = (sorter.order === 'ascend' ? 1 : -1) * sorter.compare(a.record, b.record);
        if (result) return result;
      }
      return a.index - b.index;
    }).map(({ record }) => record);
}

export function sortTableRows<RecordType>(
  rows: readonly RecordType[],
  sorter: ((a: RecordType, b: RecordType) => number) | undefined,
  order: TableSortOrder,
): RecordType[] {
  return sorter && order ? sortTableRowsBy(rows, [{ compare: sorter, order }]) : [...rows];
}
