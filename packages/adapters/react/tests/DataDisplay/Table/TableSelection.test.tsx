import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';
import type { TableColumn } from '../../../src/DataDisplay/Table/table.types.ts';

afterEach(cleanup);

const rows = [
  { key: 'a', name: 'A', locked: false },
  { key: 'b', name: 'B', locked: false },
  { key: 'c', name: 'C', locked: true },
  { key: 'd', name: 'D', locked: false },
];
const columns: TableColumn<(typeof rows)[number]>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
];
const allLabel = 'Выбрать все строки на странице';

describe('Table selection', () => {
  it('shows mixed selection and preserves disabled and off-page keys during select-all', () => {
    const changes: unknown[] = [];
    render(
      <TableAdapter
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 3 }}
        rowSelection={{
          defaultSelectedRowKeys: ['a', 'c', 'd', 'missing'],
          getCheckboxProps: (row) => ({ disabled: row.locked }),
          onChange: (keys, selectedRows) =>
            changes.push([keys, selectedRows.map((row) => row.name)]),
        }}
      />,
    );
    const header = screen.getByRole('checkbox', { name: allLabel }) as HTMLInputElement;
    expect(header.checked).toBe(false);
    expect(header.indeterminate).toBe(true);
    expect(header.getAttribute('aria-checked')).toBe('mixed');
    expect(
      (screen.getByRole('checkbox', { name: 'Выбрать строку c' }) as HTMLInputElement).disabled,
    ).toBe(true);
    fireEvent.click(header);
    expect(header.checked).toBe(true);
    expect(header.indeterminate).toBe(false);
    expect(header.getAttribute('aria-checked')).not.toBe('mixed');
    fireEvent.click(header);
    expect(header.checked).toBe(false);
    expect(header.indeterminate).toBe(false);
    expect(changes).toEqual([
      [
        ['a', 'c', 'd', 'missing', 'b'],
        ['A', 'B', 'C', 'D'],
      ],
      [
        ['c', 'd', 'missing'],
        ['C', 'D'],
      ],
    ]);
  });

  it.each([{ dataSource: [] }, { dataSource: [rows[2]!] }])(
    'disables an empty selectable page $dataSource',
    ({ dataSource }) => {
      render(
        <TableAdapter
          columns={columns}
          dataSource={dataSource}
          rowSelection={{
            defaultSelectedRowKeys: ['c'],
            getCheckboxProps: (row) => ({ disabled: row.locked }),
          }}
        />,
      );
      const header = screen.getByRole('checkbox', { name: allLabel }) as HTMLInputElement;
      expect(header.disabled).toBe(true);
      expect(header.checked).toBe(false);
      expect(header.indeterminate).toBe(false);
    },
  );

  it('updates mixed state after page navigation and controlled selection changes', () => {
    const changes: unknown[] = [];
    const rowSelection = {
      selectedRowKeys: ['a'],
      onChange: (keys: readonly (string | number)[]) => changes.push(keys),
    };
    const view = render(
      <TableAdapter
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 2 }}
        rowSelection={rowSelection}
      />,
    );
    const header = screen.getByRole('checkbox', { name: allLabel }) as HTMLInputElement;
    expect(header.indeterminate).toBe(true);
    fireEvent.click(header);
    expect(changes).toEqual([['a', 'b']]);
    expect(header.checked).toBe(false);
    expect(header.indeterminate).toBe(true);
    view.rerender(
      <TableAdapter
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 2 }}
        rowSelection={{ ...rowSelection, selectedRowKeys: ['a', 'b'] }}
      />,
    );
    expect(header.checked).toBe(true);
    expect(header.indeterminate).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
    expect(header.checked).toBe(false);
    expect(header.indeterminate).toBe(false);
  });

  it('keeps native radio selection independent between tables', () => {
    render(
      <>
        <TableAdapter
          aria-label="First"
          columns={columns}
          dataSource={rows}
          rowSelection={{ type: 'radio' }}
        />
        <TableAdapter
          aria-label="Second"
          columns={columns}
          dataSource={rows}
          rowSelection={{ type: 'radio' }}
        />
      </>,
    );
    const first = within(screen.getByRole('table', { name: 'First' }));
    const second = within(screen.getByRole('table', { name: 'Second' }));
    const a = first.getByRole('radio', { name: 'Выбрать строку a' }) as HTMLInputElement;
    const b = second.getByRole('radio', { name: 'Выбрать строку b' }) as HTMLInputElement;
    fireEvent.click(a);
    fireEvent.click(b);
    expect(a.checked).toBe(true);
    expect(b.checked).toBe(true);
    expect(first.queryByRole('checkbox', { name: allLabel })).toBeNull();
    fireEvent.click(first.getByRole('radio', { name: 'Выбрать строку d' }));
    expect(a.checked).toBe(false);
    expect(b.checked).toBe(true);
  });

  it('keeps single-choice filter drafts independent for matching column keys', () => {
    const filterColumns: TableColumn<(typeof rows)[number]>[] = [
      {
        ...columns[0]!,
        filterMultiple: false,
        filters: [
          { text: 'A', value: 'A' },
          { text: 'B', value: 'B' },
        ],
        onFilter: (value, row) => row.name === value,
      },
    ];
    render(
      <>
        <TableAdapter aria-label="First" columns={filterColumns} dataSource={rows} />
        <TableAdapter aria-label="Second" columns={filterColumns} dataSource={rows} />
      </>,
    );
    const first = within(screen.getByRole('table', { name: 'First' }));
    const second = within(screen.getByRole('table', { name: 'Second' }));
    fireEvent.click(first.getByRole('button', { name: 'Фильтр Name' }));
    fireEvent.click(second.getByRole('button', { name: 'Фильтр Name' }));
    const a = first.getByRole('radio', { name: 'A' }) as HTMLInputElement;
    const b = second.getByRole('radio', { name: 'B' }) as HTMLInputElement;
    fireEvent.click(a);
    fireEvent.click(b);
    expect(a.checked).toBe(true);
    expect(b.checked).toBe(true);
    fireEvent.click(first.getByRole('button', { name: 'Применить' }));
    fireEvent.click(second.getByRole('button', { name: 'Применить' }));
    expect(first.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['A']);
    expect(second.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['B']);
  });
});
