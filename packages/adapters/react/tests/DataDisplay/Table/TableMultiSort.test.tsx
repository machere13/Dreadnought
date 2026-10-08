import { afterEach, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';
import type { TableColumn, TableDataAdapterProps } from '../../../src/DataDisplay/Table/index.ts';

afterEach(cleanup);
const data = [{ key: 1, name: 'Z', role: 2 }, { key: 2, name: 'A', role: 2 }, { key: 3, name: 'A', role: 1 }, { key: 4, name: 'Z', role: 1 }];
type Row = typeof data[number];
const columns: TableColumn<Row>[] = [
  { key: 'id', title: 'ID', dataIndex: 'key', sorter: (a, b) => a.key - b.key },
  { key: 'name', title: 'Name', dataIndex: 'name', sorter: { compare: (a, b) => a.name.localeCompare(b.name), multiple: 1 } },
  { key: 'role', title: 'Role', dataIndex: 'role', sorter: { compare: (a, b) => a.role - b.role, multiple: 2 } },
];
const ids = (container: HTMLElement) => Array.from(container.querySelectorAll('tbody tr'), row => row.firstElementChild?.textContent);
const click = (title: string) => fireEvent.click(screen.getByRole('button', { name: `Сортировать ${title}` }));

it('combines priorities, clears only one sort and publishes the complete requested chain', () => {
  const changes: unknown[] = [];
  const onChange: TableDataAdapterProps<Row>['onChange'] = (_page, _filters, sorter, extra) => changes.push([sorter, extra.sorters, extra.currentDataSource.map(row => row.key)]);
  const { container } = render(<TableAdapter columns={columns} dataSource={data} pagination={false} onChange={onChange} />);
  click('Name'); click('Role');
  expect(ids(container)).toEqual(['3', '4', '2', '1']);
  expect(container.querySelectorAll('th[aria-sort]')).toHaveLength(1);
  expect(screen.getByRole('columnheader', { name: /Role/ }).getAttribute('aria-sort')).toBe('ascending');
  expect(screen.getByRole('columnheader', { name: /Name/ }).getAttribute('aria-description')).toContain('приоритет 2');
  expect(changes.at(-1)).toEqual([{ columnKey: 'role', order: 'ascend' }, [{ columnKey: 'role', order: 'ascend' }, { columnKey: 'name', order: 'ascend' }], [3, 4, 2, 1]]);
  click('Role');
  expect(ids(container)).toEqual(['2', '1', '3', '4']);
  click('Role');
  expect(ids(container)).toEqual(['2', '3', '1', '4']);
  expect(changes.at(-1)).toEqual([{ columnKey: 'role', order: null }, [{ columnKey: 'name', order: 'ascend' }], [2, 3, 1, 4]]);
});

it('uses column order to break priority ties and keeps consecutive requests before a render', () => {
  const equal = columns.map(column => typeof column.sorter === 'object'
    ? { ...column, sorter: { ...column.sorter, multiple: 1 } } : column);
  const { container } = render(<TableAdapter columns={equal} dataSource={data} pagination={false} />);
  act(() => { click('Role'); click('Name'); });
  expect(ids(container)).toEqual(['3', '2', '4', '1']);
});

it('keeps the full chain for pagination and computes summary from the sorted page', () => {
  const changes: unknown[] = [];
  render(<TableAdapter columns={columns} dataSource={data} pagination={{ pageSize: 2 }}
    summary={rows => <TableAdapter.Row><TableAdapter.Cell colSpan={3}>Keys: {rows.map(row => row.key).join(',')}</TableAdapter.Cell></TableAdapter.Row>}
    onChange={(_p, _f, sorter, extra) => changes.push([sorter, extra.sorters, extra.currentDataSource.map(row => row.key)])} />);
  click('Name'); click('Role');
  expect(screen.getByRole('cell', { name: 'Keys: 3,4' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
  expect(screen.getByRole('cell', { name: 'Keys: 2,1' })).toBeTruthy();
  expect(changes.at(-1)).toEqual([{ columnKey: 'role', order: 'ascend' }, [{ columnKey: 'role', order: 'ascend' }, { columnKey: 'name', order: 'ascend' }], [3, 4, 2, 1]]);
});

it('waits for controlled orders while callbacks report the requested multi-sort', () => {
  const changes: number[][] = [];
  const controlled = (order: 'ascend' | 'descend') => columns.map(column => ({ ...column, sortOrder: column.key === 'name' ? order : column.key === 'role' ? 'ascend' as const : undefined }));
  const view = render(<TableAdapter columns={controlled('ascend')} dataSource={data} pagination={false}
    onChange={(_p, _f, _s, extra) => changes.push(extra.currentDataSource.map(row => row.key))} />);
  click('Name');
  expect(ids(view.container)).toEqual(['3', '4', '2', '1']);
  expect(changes).toEqual([[4, 3, 1, 2]]);
  view.rerender(<TableAdapter columns={controlled('descend')} dataSource={data} pagination={false} />);
  expect(ids(view.container)).toEqual(['4', '3', '1', '2']);
});

it('filters the sorted chain without losing priority or inactive source rows', () => {
  const changes: unknown[] = [];
  const filtered = columns.map(column => column.key === 'name' ? { ...column,
    filters: [{ text: 'Only Z', value: 'Z' }], onFilter: (value: string | number | boolean, row: Row) => row.name === value,
  } : column);
  const { container } = render(<TableAdapter columns={filtered} dataSource={data} pagination={false}
    onChange={(_p, _f, _s, extra) => changes.push([extra.action, extra.sorters, extra.currentDataSource.map(row => row.key)])} />);
  click('Name'); click('Role');
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Name' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Only Z' }));
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
  expect(ids(container)).toEqual(['4', '1']);
  expect(changes.at(-1)).toEqual(['filter', [{ columnKey: 'role', order: 'ascend' }, { columnKey: 'name', order: 'ascend' }], [4, 1]]);
  expect(data.map(row => row.key)).toEqual([1, 2, 3, 4]);
});

it('preserves hidden default sorts and lets a plain sorter replace the multi-sort chain', () => {
  const defaults = columns.map(column => ({ ...column, defaultSortOrder: column.key === 'id' ? undefined : 'ascend' as const }));
  const view = render(<TableAdapter columns={defaults} dataSource={data} pagination={false} />);
  expect(ids(view.container)).toEqual(['3', '4', '2', '1']);
  view.rerender(<TableAdapter columns={defaults.map(column => ({ ...column, hidden: column.key === 'role' }))} dataSource={data} pagination={false} />);
  expect(ids(view.container)).toEqual(['2', '3', '1', '4']);
  view.rerender(<TableAdapter columns={defaults} dataSource={data} pagination={false} />);
  expect(ids(view.container)).toEqual(['3', '4', '2', '1']);
  click('ID');
  expect(ids(view.container)).toEqual(['1', '2', '3', '4']);
  click('Name');
  expect(ids(view.container)).toEqual(['2', '3', '1', '4']);
});

it('reports a requested plain sort even when another plain sort is controlled', () => {
  const changes: unknown[] = [];
  const controlled: TableColumn<Row>[] = columns.map(column => column.key === 'name'
    ? { ...column, sorter: (a, b) => a.name.localeCompare(b.name), sortOrder: 'ascend' } : column);
  const { container } = render(<TableAdapter columns={controlled} dataSource={data} pagination={false}
    onChange={(_p, _f, sorter, extra) => changes.push([sorter, extra.sorters, extra.currentDataSource.map(row => row.key)])} />);
  click('ID');
  expect(ids(container)).toEqual(['2', '3', '1', '4']);
  expect(changes).toEqual([[{ columnKey: 'id', order: 'ascend' }, [{ columnKey: 'id', order: 'ascend' }], [1, 2, 3, 4]]]);
});
