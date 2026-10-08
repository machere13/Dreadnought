import { useLayoutEffect, useRef, useState } from 'react';
import { getPaginationState, getSelectionValue, paginateTableRows } from '@dreadnought/core';
import { changeSorters, defaultSorters, resolveSorters } from './tableSort.ts';
import { matchingRows, paginationNumber, recordKey, resolveFilters } from './tableData.ts';
import type {
  TableChangeFilters,
  TableChangeSorter,
  TableColumn,
  TableDataAdapterProps,
  TableFilterValue,
  TableRowKey,
} from './table.types.ts';

type TableStateOptions<RecordType extends object> = Pick<
  TableDataAdapterProps<RecordType>,
  'columns' | 'dataSource' | 'rowKey' | 'pagination' | 'rowSelection' | 'expandable' | 'onChange'
> & { manual: boolean };

export function useDataTableState<RecordType extends object>({
  columns,
  dataSource,
  rowKey,
  pagination,
  rowSelection,
  expandable,
  onChange,
  manual,
}: TableStateOptions<RecordType>) {
  const [localExpandedKeys, setLocalExpandedKeys] = useState<TableRowKey[]>(() => [
    ...(expandable?.defaultExpandedRowKeys ?? []),
  ]);
  const expandedKeys = expandable?.expandedRowKeys ?? localExpandedKeys;
  const expandedKeysRef = useRef(expandedKeys);
  useLayoutEffect(() => {
    expandedKeysRef.current = expandedKeys;
  }, [expandedKeys]);
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

  return {
    rows,
    total,
    currentPage,
    pageSize,
    pageCount,
    activeSorters,
    localFilters,
    selectedKeys,
    expandedKeys,
    keysOnPage,
    selectedOnPage,
    changeSort,
    changeFilter,
    changePage,
    changeSelection,
    changeExpansion,
  };
}
