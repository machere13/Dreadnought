export function filterTableRows<RecordType>(
  rows: readonly RecordType[],
  filters: readonly { values: readonly (string | number)[]; predicate: (value: string | number, row: RecordType) => boolean }[],
): RecordType[] {
  return rows.filter((row) => filters.every(({ values, predicate }) =>
    values.length === 0 || values.some((value) => predicate(value, row)),
  ));
}
