export type TableSortOrder = 'ascend' | 'descend' | null;

export function sortTableRows<RecordType>(
  rows: readonly RecordType[],
  sorter: ((a: RecordType, b: RecordType) => number) | undefined,
  order: TableSortOrder,
): RecordType[] {
  if (!sorter || !order) return [...rows];
  const direction = order === 'ascend' ? 1 : -1;
  return rows.map((record, index) => ({ record, index }))
    .sort((a, b) => direction * sorter(a.record, b.record) || a.index - b.index)
    .map(({ record }) => record);
}
