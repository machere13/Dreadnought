export function paginateTableRows<RecordType>(rows: readonly RecordType[], page: number, pageSize: number): RecordType[] {
  return rows.slice((page - 1) * pageSize, page * pageSize);
}
