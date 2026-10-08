import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const data = [
  { key: 'b', name: 'B', email: 'b@example.com', city: 'Kazan' },
  { key: 'a', name: 'A', email: 'a@example.com', city: 'Moscow' },
];

it('renders unequal-depth groups, passes header callbacks and associates data cells with all headers', () => {
  const calls: unknown[] = [];
  const ref = createRef<HTMLTableCellElement>();
  render(
    <TableAdapter
      columns={[
        { key: 'name', title: 'Name', dataIndex: 'name' },
        {
          key: 'contact',
          title: 'Contact',
          onHeaderCell: () => ({ ref, title: 'Contact group' }),
          children: [
            { key: 'email', title: 'Email', dataIndex: 'email' },
            {
              key: 'address',
              title: 'Address',
              children: [{ key: 'city', title: 'City', dataIndex: 'city' }],
            },
          ],
        },
      ]}
      dataSource={data}
      pagination={false}
      onHeaderRow={(columns, index) => {
        calls.push([columns.map((column) => column.key), index]);
        return { title: `Level ${index}` };
      }}
    />,
  );
  const group = screen.getByRole('columnheader', { name: 'Contact' });
  expect(group.getAttribute('colspan')).toBe('2');
  expect(group.getAttribute('scope')).toBe('colgroup');
  expect(ref.current).toBe(group);
  expect(group.title).toBe('Contact group');
  expect(screen.getByRole('columnheader', { name: 'Name' }).getAttribute('rowspan')).toBe('3');
  expect(screen.getByRole('columnheader', { name: 'Email' }).getAttribute('rowspan')).toBe('2');
  expect(calls).toEqual([
    [['name', 'contact'], 0],
    [['email', 'address'], 1],
    [['city'], 2],
  ]);
  const city = screen.getByRole('cell', { name: 'Kazan' });
  expect(city.getAttribute('headers')?.split(' ')).toEqual(
    ['Contact', 'Address', 'City'].map((name) => screen.getByRole('columnheader', { name }).id),
  );
  expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual([
    'B',
    'b@example.com',
    'Kazan',
    'A',
    'a@example.com',
    'Moscow',
  ]);
});

it('keeps nested sorting, filters, selection and expandable detail spans', () => {
  render(
    <TableAdapter
      columns={[
        {
          key: 'person',
          title: 'Person',
          children: [
            {
              key: 'name',
              title: 'Name',
              dataIndex: 'name',
              sorter: (a, b) => a.name.localeCompare(b.name),
            },
            {
              key: 'city',
              title: 'City',
              dataIndex: 'city',
              filters: [{ text: 'Moscow', value: 'Moscow' }],
              onFilter: (value, row) => row.city === value,
            },
          ],
        },
      ]}
      dataSource={data}
      pagination={false}
      rowSelection={{}}
      expandable={{ expandedRowRender: (row) => `${row.name} details` }}
    />,
  );
  expect(screen.getByRole('columnheader', { name: 'Выбор строк' }).getAttribute('rowspan')).toBe(
    '2',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать Name' }));
  expect(
    screen.getAllByRole('checkbox').map((checkbox) => checkbox.getAttribute('aria-label')),
  ).toEqual(['Выбрать все строки на странице', 'Выбрать строку a', 'Выбрать строку b']);
  fireEvent.click(screen.getByRole('button', { name: 'Раскрыть строку a' }));
  expect(screen.getByRole('cell', { name: 'A details' }).getAttribute('colspan')).toBe('4');
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр City' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Moscow' }));
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
  expect(screen.queryByRole('cell', { name: 'Kazan' })).toBeNull();
});

it('measures all header levels and leaf widths for sticky groups', () => {
  vi.spyOn(HTMLTableRowElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLTableRowElement,
  ) {
    return { height: this.rowIndex === 0 ? 34 : 42 } as DOMRect;
  });
  vi.spyOn(HTMLTableCellElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLTableCellElement,
  ) {
    return {
      width: this.textContent === 'Name' ? 140 : this.textContent === 'City' ? 100 : 240,
    } as DOMRect;
  });
  render(
    <TableAdapter
      sticky={{ offsetHeader: 10 }}
      columns={[
        {
          key: 'person',
          title: 'Person',
          fixed: 'left',
          children: [
            { key: 'name', title: 'Name', dataIndex: 'name' },
            { key: 'city', title: 'City', dataIndex: 'city' },
          ],
        },
      ]}
      dataSource={data}
      pagination={false}
    />,
  );
  const group = screen.getByRole('columnheader', { name: 'Person' });
  const city = screen.getByRole('columnheader', { name: 'City' });
  expect(group.style.left).toBe('0px');
  expect(group.style.top).toBe('10px');
  expect(city.style.left).toBe('140px');
  expect(city.style.top).toBe('44px');
  expect(screen.getAllByRole('cell')[1]?.style.left).toBe('140px');
});

it('rejects a group that crosses fixed column regions', () => {
  expect(() =>
    render(
      <TableAdapter
        columns={[
          {
            key: 'mixed',
            title: 'Mixed',
            children: [
              { key: 'name', title: 'Name', fixed: 'left' },
              { key: 'city', title: 'City' },
            ],
          },
        ]}
        dataSource={data}
      />,
    ),
  ).toThrow(/fixed/);
});

it('spans every leaf column in an empty grouped table', () => {
  render(
    <TableAdapter
      columns={[
        {
          key: 'person',
          title: 'Person',
          children: [
            { key: 'name', title: 'Name' },
            { key: 'city', title: 'City' },
          ],
        },
      ]}
      dataSource={[]}
    />,
  );
  expect(screen.getByText('Нет данных').getAttribute('colspan')).toBe('2');
});

it('keeps the selection header when there are no data columns', () => {
  render(<TableAdapter columns={[]} dataSource={data} rowSelection={{}} />);
  expect(screen.getByRole('columnheader', { name: 'Выбор строк' })).toBeTruthy();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Выбрать все строки на странице' }));
  expect(
    (screen.getByRole('checkbox', { name: 'Выбрать строку a' }) as HTMLInputElement).checked,
  ).toBe(true);
});

it('updates sticky row offsets when headers resize and positions right-hand groups from the last leaf', () => {
  let height = 30;
  let resize = () => {};
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLTableRowElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ height }) as DOMRect,
  );
  vi.spyOn(HTMLTableCellElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLTableCellElement,
  ) {
    return { width: this.textContent === 'City' ? 100 : 140 } as DOMRect;
  });
  render(
    <TableAdapter
      sticky
      columns={[
        {
          key: 'person',
          title: 'Person',
          fixed: 'right',
          children: [
            { key: 'name', title: 'Name', dataIndex: 'name' },
            { key: 'city', title: 'City', dataIndex: 'city' },
          ],
        },
      ]}
      dataSource={data}
    />,
  );
  expect(screen.getByRole('columnheader', { name: 'Person' }).style.right).toBe('0px');
  expect(screen.getByRole('columnheader', { name: 'Name' }).style.right).toBe('100px');
  expect(screen.getByRole('columnheader', { name: 'Name' }).style.top).toBe('30px');
  height = 58;
  act(() => resize());
  expect(screen.getByRole('columnheader', { name: 'Name' }).style.top).toBe('58px');
});
