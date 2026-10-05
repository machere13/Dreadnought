import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';
import type { TableColumn, TableDataAdapterProps } from '../../../src/DataDisplay/Table/table.types.ts';

afterEach(cleanup);

const records = [{ key: 'b', name: 'B' }, { key: 'a', name: 'A' }, { key: 'c', name: 'C' }];
const columns: TableColumn<typeof records[number]>[] = [{
  key: 'name', title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name),
  filters: [{ text: 'Only A', value: 'A' }], onFilter: (value, record) => record.name === value,
}];

function applyFilter() {
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Name' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Only A' }));
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
}

describe('Table data transitions', () => {
  it('rejects selection without stable row keys', () => {
    expect(() => render(<TableAdapter columns={[{ key: 'name', title: 'Name', dataIndex: 'name' }]}
      dataSource={[{ name: 'B' }, { name: 'A' }]} rowSelection={{}} />))
      .toThrow(/rowKey|record.key/);
  });

  it.each([
    { dataSource: [{ key: 'a', name: 'B' }, { key: 'a', name: 'A' }] },
    { dataSource: [{ key: 1, name: 'B' }, { key: '1', name: 'A' }] },
    { dataSource: [{ key: Number.NaN, name: 'B' }] },
  ])('rejects ambiguous selection keys $dataSource', ({ dataSource }) => {
    expect(() => render(<TableAdapter columns={[{ key: 'name', title: 'Name', dataIndex: 'name' }]}
      dataSource={dataSource} rowSelection={{}} />)).toThrow(/rowKey|record.key/);
  });

  it('selects the visible record after sorting and retains selection after data reordering', () => {
    const changes: unknown[] = [];
    const props = { columns, dataSource: records, rowSelection: {
      onChange: (keys: unknown[], rows: readonly typeof records[number][]) => changes.push([keys, rows.map(row => row.name)]),
    } };
    const view = render(<TableAdapter {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Сортировать Name' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Выбрать строку a' }));
    expect(changes).toEqual([[['a'], ['A']]]);
    view.rerender(<TableAdapter {...props} dataSource={[records[1]!, records[0]!, records[2]!]} />);
    expect((screen.getByRole('checkbox', { name: 'Выбрать строку a' }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('checkbox', { name: 'Выбрать строку b' }) as HTMLInputElement).checked).toBe(false);
  });

  it('keeps ordinary tables usable without row keys', () => {
    render(<TableAdapter columns={[{ key: 'name', title: 'Name', dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name) }]} dataSource={[{ name: 'B' }, { name: 'A' }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Сортировать Name' }));
    expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual(['A', 'B']);
  });

  it('uses a function rowKey and waits for controlled selection props', () => {
    const changes: unknown[] = [];
    const rowSelection = { selectedRowKeys: [] as string[],
      onChange: (keys: unknown[], rows: readonly typeof records[number][]) => changes.push([keys, rows.map(row => row.name)]) };
    const view = render(<TableAdapter columns={columns} dataSource={records} rowKey={row => row.name}
      rowSelection={rowSelection} />);
    const checkbox = screen.getByRole('checkbox', { name: 'Выбрать строку A' }) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(changes).toEqual([[['A'], ['A']]]);
    expect(checkbox.checked).toBe(false);
    view.rerender(<TableAdapter columns={columns} dataSource={records} rowKey={row => row.name}
      rowSelection={{ ...rowSelection, selectedRowKeys: ['A'] }} />);
    expect(checkbox.checked).toBe(true);
  });

  it('treats null as an empty controlled filter even with a default filter', () => {
    const view = render(<TableAdapter columns={[{ ...columns[0]!, defaultFilteredValue: ['A'] }]}
      dataSource={records} pagination={false} />);
    expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual(['A']);
    view.rerender(<TableAdapter columns={[{ ...columns[0]!, defaultFilteredValue: ['A'], filteredValue: null }]}
      dataSource={records} pagination={false} />);
    expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual(['B', 'A', 'C']);
    applyFilter();
    expect(screen.getAllByRole('cell')).toHaveLength(3);
  });

  it('initializes default filters and page size only once', () => {
    const view = render(<TableAdapter columns={columns} dataSource={records} pagination={{ defaultPageSize: 2 }} />);
    view.rerender(<TableAdapter columns={[{ ...columns[0]!, defaultFilteredValue: ['A'] }]}
      dataSource={records} pagination={{ defaultPageSize: 1, defaultCurrent: 2 }} />);
    expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual(['B', 'A']);
  });

  it('reports a filter reset to page one through both callbacks in order, once each', () => {
    const changes: unknown[] = [];
    const onChange: TableDataAdapterProps<typeof records[number]>['onChange'] = (page, filters, sorter, extra) =>
      changes.push(['table', page.current, filters.name, sorter.order, extra]);
    render(<TableAdapter columns={columns} dataSource={records} pagination={{ defaultCurrent: 3, pageSize: 1,
      onChange: (page, size) => changes.push(['pagination', page, size]) }} onChange={onChange} />);
    applyFilter();
    expect(changes).toEqual([
      ['pagination', 1, 1],
      ['table', 1, ['A'], null, { action: 'filter', currentDataSource: [records[1]] }],
    ]);
    expect(screen.getByRole('cell', { name: 'A' })).toBeTruthy();
  });

  it('identifies sort and paginate events and keeps the current page when sorting', () => {
    const changes: unknown[] = [];
    const onChange: TableDataAdapterProps<typeof records[number]>['onChange'] = (page, _filters, _sorter, extra) =>
      changes.push([page, extra]);
    render(<TableAdapter columns={columns} dataSource={records} pagination={{ defaultCurrent: 2, pageSize: 1 }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Сортировать Name' }));
    expect(screen.getByRole('cell', { name: 'B' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
    expect(changes).toEqual([
      [{ current: 2, pageSize: 1 }, { action: 'sort', currentDataSource: [records[1], records[0], records[2]] }],
      [{ current: 3, pageSize: 1 }, { action: 'paginate', currentDataSource: [records[1], records[0], records[2]] }],
    ]);
    expect(screen.getByRole('cell', { name: 'C' })).toBeTruthy();
  });

  it('clamps an uncontrolled page after data shrinks without resurrecting it or emitting events', () => {
    const changes: unknown[] = [];
    const props = { columns, pagination: { defaultCurrent: 3, pageSize: 1, onChange: () => changes.push('page') },
      onChange: () => changes.push('table') };
    const view = render(<TableAdapter {...props} dataSource={records} />);
    view.rerender(<TableAdapter {...props} dataSource={[records[0]!]} />);
    view.rerender(<TableAdapter {...props} dataSource={records} />);
    expect(screen.getByRole('cell', { name: 'B' })).toBeTruthy();
    expect(changes).toEqual([]);
  });

  it('resets an uncontrolled page when controlled page size changes without emitting events', () => {
    const changes: unknown[] = [];
    const view = render(<TableAdapter columns={columns} dataSource={records} pagination={{ defaultCurrent: 3, pageSize: 1 }}
      onChange={() => changes.push('table')} />);
    view.rerender(<TableAdapter columns={columns} dataSource={records} pagination={{ defaultCurrent: 3, pageSize: 2 }}
      onChange={() => changes.push('table')} />);
    expect(screen.getAllByRole('cell').map(cell => cell.textContent)).toEqual(['B', 'A']);
    expect(changes).toEqual([]);
  });

  it('clamps only the display for a controlled page and never emits render callbacks', () => {
    const changes: unknown[] = [];
    const props = { columns, pagination: { current: 3, pageSize: 1, onChange: () => changes.push('page') },
      onChange: () => changes.push('table') };
    const view = render(<TableAdapter {...props} dataSource={records} />);
    view.rerender(<TableAdapter {...props} dataSource={[records[0]!]} />);
    expect(screen.getByRole('cell', { name: 'B' })).toBeTruthy();
    view.rerender(<TableAdapter {...props} dataSource={records} />);
    expect(screen.getByRole('cell', { name: 'C' })).toBeTruthy();
    expect(changes).toEqual([]);
  });

  it('does not apply a requested filter or page reset until controlled props change', () => {
    const changes: unknown[] = [];
    const props = { dataSource: records, pagination: { current: 3, pageSize: 1,
      onChange: (page: number, size: number) => changes.push([page, size]) } };
    const view = render(<TableAdapter {...props} columns={[{ ...columns[0]!, filteredValue: null }]} />);
    applyFilter();
    expect(changes).toEqual([[1, 1]]);
    expect(screen.getByRole('cell', { name: 'C' })).toBeTruthy();
    view.rerender(<TableAdapter {...props} pagination={{ ...props.pagination, current: 1 }}
      columns={[{ ...columns[0]!, filteredValue: ['A'] }]} />);
    expect(screen.getByRole('cell', { name: 'A' })).toBeTruthy();
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid pagination number %s', (value) => {
    expect(() => render(<TableAdapter columns={columns} dataSource={records} pagination={{ current: value }} />))
      .toThrow(/positive integer/);
    expect(() => render(<TableAdapter columns={columns} dataSource={records} pagination={{ pageSize: value }} />))
      .toThrow(/positive integer/);
  });
});
