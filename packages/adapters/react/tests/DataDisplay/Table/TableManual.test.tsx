import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';
import type { TableColumn } from '../../../src/DataDisplay/Table/index.ts';

afterEach(cleanup);
const rows = [
  { key: 3, name: 'Z' },
  { key: 4, name: 'A' },
];
type Row = (typeof rows)[number];
const columns: TableColumn<Row>[] = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    filters: [{ text: 'Only A', value: 'A' }],
    onFilter: (value, row) => row.name === value,
  },
];

it('renders the complete server page without local sorting, filtering or slicing', () => {
  const changes: unknown[] = [];
  const { container } = render(
    <TableAdapter
      processing="manual"
      columns={columns}
      dataSource={rows}
      pagination={{ current: 2, pageSize: 2, total: 10 }}
      onChange={(page, filters, sorter, extra) =>
        changes.push([
          page.current,
          filters,
          sorter.order,
          extra.currentDataSource.map((row) => row.key),
        ])
      }
      summary={(page) => (
        <TableAdapter.Row>
          <TableAdapter.Cell>Keys: {page.map((row) => row.key).join(',')}</TableAdapter.Cell>
        </TableAdapter.Row>
      )}
    />,
  );
  expect(screen.getByText('2 / 5')).toBeTruthy();
  expect(screen.getByRole('cell', { name: 'Keys: 3,4' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать Name' }));
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Name' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Only A' }));
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
  expect(Array.from(container.querySelectorAll('tbody td'), (cell) => cell.textContent)).toEqual([
    'Z',
    'A',
  ]);
  expect(changes).toEqual([
    [2, { name: [] }, 'ascend', [3, 4]],
    [1, { name: ['A'] }, 'ascend', [3, 4]],
  ]);
  expect(screen.getByText('2 / 5')).toBeTruthy();
});

it('reports comparator-free multi-sort and waits for controlled page acceptance', () => {
  const changes: unknown[] = [];
  const serverColumns: TableColumn<Row>[] = [
    { key: 'key', title: 'ID', dataIndex: 'key', sorter: { multiple: 2 } },
    { key: 'name', title: 'Name', dataIndex: 'name', sorter: { multiple: 1 } },
  ];
  const view = render(
    <TableAdapter
      processing="manual"
      columns={serverColumns}
      dataSource={rows}
      pagination={{ current: 2, pageSize: 2, total: 10 }}
      onChange={(page, _f, _s, extra) => changes.push([page.current, extra.sorters])}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать Name' }));
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать ID' }));
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
  expect(changes.at(-1)).toEqual([
    3,
    [
      { columnKey: 'key', order: 'ascend' },
      { columnKey: 'name', order: 'ascend' },
    ],
  ]);
  expect(screen.getByText('2 / 5')).toBeTruthy();
  view.rerender(
    <TableAdapter
      processing="manual"
      columns={serverColumns}
      dataSource={[{ key: 5, name: 'Next' }]}
      pagination={{ current: 3, pageSize: 2, total: 10 }}
    />,
  );
  expect(screen.getByRole('cell', { name: 'Next' })).toBeTruthy();
  expect(screen.getByText('3 / 5')).toBeTruthy();
});

it('uses a boolean server sorter without invoking a comparator', () => {
  render(
    <TableAdapter
      processing="manual"
      pagination={false}
      dataSource={rows}
      columns={[{ key: 'name', title: 'Name', dataIndex: 'name', sorter: true }]}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать Name' }));
  expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('ascending');
});

it.each([undefined, -1, 1.5, NaN, Infinity])(
  'rejects missing or invalid server total %s',
  (total) => {
    expect(() =>
      render(
        <TableAdapter
          processing="manual"
          columns={columns}
          dataSource={rows}
          pagination={{ total }}
        />,
      ),
    ).toThrow(/total/i);
  },
);

it('accepts zero total and manual mode without pagination', () => {
  const view = render(
    <TableAdapter
      processing="manual"
      columns={columns}
      dataSource={[]}
      pagination={{ total: 0 }}
    />,
  );
  expect(screen.getByText('Нет данных')).toBeTruthy();
  expect(screen.queryByRole('navigation')).toBeNull();
  view.rerender(
    <TableAdapter processing="manual" columns={columns} dataSource={rows} pagination={false} />,
  );
  expect(screen.getByRole('cell', { name: 'Z' })).toBeTruthy();
});

it('rejects comparator-free sorters in local mode', () => {
  expect(() =>
    render(
      <TableAdapter columns={[{ key: 'name', title: 'Name', sorter: true }]} dataSource={rows} />,
    ),
  ).toThrow(/manual|compare/i);
  expect(() =>
    render(
      <TableAdapter
        columns={[{ key: 'name', title: 'Name', sorter: { multiple: 1 } }]}
        dataSource={rows}
      />,
    ),
  ).toThrow(/manual|compare/i);
});

it('never calls local comparators or predicates in manual mode', () => {
  const forbidden = () => {
    throw new Error('Local processing was called');
  };
  render(
    <TableAdapter
      processing="manual"
      pagination={false}
      dataSource={rows}
      columns={[
        {
          ...columns[0]!,
          sorter: forbidden,
          onFilter: forbidden,
          defaultSortOrder: 'ascend',
          defaultFilteredValue: ['A'],
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать Name' }));
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Name' }));
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
  expect(screen.getByRole('cell', { name: 'Z' })).toBeTruthy();
  expect(screen.getByRole('cell', { name: 'A' })).toBeTruthy();
});

it('preserves selected keys across server pages while returning only available records', () => {
  const changes: unknown[] = [];
  const selection = {
    onChange: (keys: (string | number)[], records: Row[]) =>
      changes.push([keys, records.map((row) => row.key)]),
  };
  const view = render(
    <TableAdapter
      processing="manual"
      columns={columns}
      dataSource={rows}
      rowSelection={selection}
      pagination={{ current: 2, pageSize: 2, total: 10 }}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Выбрать строку 3' }));
  view.rerender(
    <TableAdapter
      processing="manual"
      columns={columns}
      dataSource={[{ key: 5, name: 'Next' }]}
      rowSelection={selection}
      pagination={{ current: 3, pageSize: 2, total: 10 }}
    />,
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Выбрать все строки на странице' }));
  expect(changes).toEqual([
    [[3], [3]],
    [[3, 5], [5]],
  ]);
});

it('clamps a shrinking server total without emitting requests or slicing supplied rows', () => {
  const changes: unknown[] = [];
  const props = {
    processing: 'manual' as const,
    columns,
    dataSource: rows,
    onChange: (...args: unknown[]) => changes.push(args),
  };
  const view = render(
    <TableAdapter {...props} pagination={{ defaultCurrent: 5, pageSize: 2, total: 10 }} />,
  );
  view.rerender(<TableAdapter {...props} pagination={{ pageSize: 2, total: 3 }} />);
  expect(screen.getByText('2 / 2')).toBeTruthy();
  expect(screen.getByRole('cell', { name: 'Z' })).toBeTruthy();
  expect(changes).toEqual([]);
});

it('announces loading without remounting rows or discarding keyboard focus', () => {
  const view = render(
    <TableAdapter aria-label="Results" columns={columns} dataSource={rows} pagination={false} />,
  );
  const trigger = screen.getByRole('button', { name: 'Сортировать Name' });
  const cell = screen.getByRole('cell', { name: 'Z' });
  trigger.focus();
  view.rerender(
    <TableAdapter
      aria-label="Results"
      loading
      columns={columns}
      dataSource={rows}
      pagination={false}
    />,
  );
  expect(screen.getByRole('table', { name: 'Results' }).getAttribute('aria-busy')).toBe('true');
  expect(screen.getByRole('status', { name: 'Загрузка таблицы' })).toBeTruthy();
  expect(document.activeElement).toBe(trigger);
  expect(screen.getByRole('cell', { name: 'Z' })).toBe(cell);
  view.rerender(
    <TableAdapter aria-label="Results" columns={columns} dataSource={rows} pagination={false} />,
  );
  expect(screen.queryByRole('status')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
