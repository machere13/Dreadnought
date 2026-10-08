import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';
import type { TableColumn } from '../../../src/DataDisplay/Table/table.types.ts';

afterEach(cleanup);
const rows = [
  { key: 'a', name: 'A' },
  { key: 'b', name: 'B' },
  { key: 'c', name: 'C' },
];
const columns = [{ key: 'name', title: 'Name', dataIndex: 'name' }] satisfies TableColumn<
  (typeof rows)[number]
>[];

it('uses shared native ButtonAdapter controls in its simple pagination', () => {
  render(<TableAdapter columns={columns} dataSource={rows} pagination={{ pageSize: 1 }} />);
  const nav = screen.getByRole('navigation', { name: 'Страницы таблицы' });
  expect(nav.getAttribute('data-slot')).toBe('pagination');
  expect(within(nav).getByText('1 / 3')).toBeTruthy();
  const buttons = within(nav).getAllByRole('button');
  expect(buttons).toHaveLength(2);
  expect(buttons.every((button) => button.getAttribute('data-ui') === 'button')).toBe(true);
});

it('emits one controlled request and waits for acceptance', () => {
  const changed = vi.fn();
  const tableChanged = vi.fn();
  const view = render(
    <TableAdapter
      columns={columns}
      dataSource={rows}
      onChange={tableChanged}
      pagination={{ current: 2, pageSize: 1, onChange: changed }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
  expect(changed).toHaveBeenCalledExactlyOnceWith(3, 1);
  expect(tableChanged).toHaveBeenCalledTimes(1);
  expect(tableChanged.mock.calls[0]![0]).toEqual({ current: 3, pageSize: 1 });
  expect(tableChanged.mock.calls[0]![3]).toEqual({
    action: 'paginate',
    sorters: [],
    currentDataSource: rows,
  });
  expect(screen.getByRole('cell', { name: 'B' })).toBeTruthy();
  view.rerender(
    <TableAdapter
      columns={columns}
      dataSource={rows}
      pagination={{ current: 3, pageSize: 1, onChange: changed }}
    />,
  );
  expect(screen.getByRole('cell', { name: 'C' })).toBeTruthy();
  expect(screen.getByText('3 / 3')).toBeTruthy();
});

it('clamps a shrinking last page consistently and does not resurrect it', () => {
  const changed = vi.fn();
  const pagination = { defaultCurrent: 3, pageSize: 1, onChange: changed };
  const view = render(<TableAdapter columns={columns} dataSource={rows} pagination={pagination} />);
  view.rerender(
    <TableAdapter columns={columns} dataSource={rows.slice(0, 2)} pagination={pagination} />,
  );
  expect(screen.getByRole('cell', { name: 'B' })).toBeTruthy();
  expect(screen.getByText('2 / 2')).toBeTruthy();
  expect(
    (screen.getByRole('button', { name: 'Следующая страница' }) as HTMLButtonElement).disabled,
  ).toBe(true);
  view.rerender(<TableAdapter columns={columns} dataSource={rows} pagination={pagination} />);
  expect(screen.getByText('2 / 3')).toBeTruthy();
  expect(changed).not.toHaveBeenCalled();
});

it('keeps keyboard pagination inside a form from submitting', async () => {
  const user = userEvent.setup();
  const submitted = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={submitted}>
      <TableAdapter columns={columns} dataSource={rows} pagination={{ pageSize: 1 }} />
    </form>,
  );
  screen.getByRole('button', { name: 'Следующая страница' }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('cell', { name: 'B' })).toBeTruthy();
  expect(submitted).not.toHaveBeenCalled();
});

it('hides pagination when disabled or when there is only one page', () => {
  const view = render(<TableAdapter columns={columns} dataSource={rows} pagination={false} />);
  expect(screen.queryByRole('navigation')).toBeNull();
  view.rerender(<TableAdapter columns={columns} dataSource={rows} />);
  expect(screen.queryByRole('navigation')).toBeNull();
});
