import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { PaginationAdapter } from '../../../src/Navigation/Pagination/PaginationAdapter.tsx';
import { usePagination } from '../../../src/Navigation/Pagination/usePagination.ts';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';

afterEach(cleanup);

it('resets the uncontrolled page and changes page size in one request', () => {
  const changed = vi.fn();
  const view = renderHook(
    () =>
      usePagination({
        total: 100,
        defaultCurrent: 4,
        defaultPageSize: 10,
        onChange: changed,
      }),
    { wrapper: StrictMode },
  );
  act(() => view.result.current.changePageSize(20));
  expect(view.result.current.current).toBe(1);
  expect(view.result.current.pageSize).toBe(20);
  expect(changed).toHaveBeenCalledExactlyOnceWith(1, 20);
  act(() => view.result.current.changePageSize(20));
  expect(changed).toHaveBeenCalledTimes(1);
  expect(() => view.result.current.changePageSize(0)).toThrow(RangeError);
});

it('waits for controlled page and size acceptance without rerender events', () => {
  const changed = vi.fn();
  const view = renderHook(
    ({ current, pageSize, disabled }) =>
      usePagination({
        total: 100,
        current,
        pageSize,
        disabled,
        onChange: changed,
      }),
    { initialProps: { current: 4, pageSize: 10, disabled: false } },
  );
  act(() => view.result.current.changePageSize(20));
  expect(view.result.current.current).toBe(4);
  expect(view.result.current.pageSize).toBe(10);
  expect(changed).toHaveBeenCalledExactlyOnceWith(1, 20);
  view.rerender({ current: 1, pageSize: 20, disabled: true });
  act(() => view.result.current.changePageSize(50));
  expect(view.result.current.pageSize).toBe(20);
  expect(changed).toHaveBeenCalledTimes(1);
});

it('uses Select for page size including a custom current value', () => {
  const changed = vi.fn();
  render(
    <PaginationAdapter
      total={100}
      defaultCurrent={4}
      defaultPageSize={15}
      showSizeChanger
      pageSizeOptions={[10, 20]}
      showTotal
      onChange={changed}
    />,
  );
  expect(screen.getByText('46–60 из 100')).toBeTruthy();
  const select = screen.getByRole('combobox', { name: 'Строк на странице' });
  expect((select as HTMLInputElement).value).toBe('15 / стр.');
  fireEvent.click(select);
  fireEvent.click(screen.getByRole('option', { name: '20 / стр.' }));
  expect(changed).toHaveBeenCalledExactlyOnceWith(1, 20);
  expect(screen.getByText('1–20 из 100')).toBeTruthy();
});

it('jumps on Enter, rejects invalid drafts, clamps the last page and never submits', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const submitted = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={submitted}>
      <PaginationAdapter total={95} showQuickJumper onChange={changed} />
    </form>,
  );
  const input = screen.getByRole('textbox', { name: 'Перейти на страницу' });
  for (const value of ['', '0', '-2', '1.5', 'abc', '9007199254740992']) {
    fireEvent.change(input, { target: { value } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  }
  expect(changed).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: '999' } });
  input.focus();
  await user.keyboard('{Enter}');
  expect(changed).toHaveBeenCalledExactlyOnceWith(10, 10);
  expect((input as HTMLInputElement).value).toBe('');
  expect(submitted).not.toHaveBeenCalled();
});

it('ignores composition and disables both optional controls', () => {
  const changed = vi.fn();
  const view = render(
    <PaginationAdapter total={100} showQuickJumper showSizeChanger onChange={changed} />,
  );
  const input = screen.getByRole('textbox', { name: 'Перейти на страницу' });
  fireEvent.change(input, { target: { value: '3' } });
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
  expect(changed).not.toHaveBeenCalled();
  view.rerender(
    <PaginationAdapter total={100} disabled showQuickJumper showSizeChanger onChange={changed} />,
  );
  expect((screen.getByRole('textbox') as HTMLInputElement).disabled).toBe(true);
  expect((screen.getByRole('combobox') as HTMLInputElement).disabled).toBe(true);
});

it('passes an empty or partial range to the total renderer', () => {
  const total = vi.fn((count, range) => `${range.join(':')} / ${count}`);
  const view = render(<PaginationAdapter total={0} showTotal={total} />);
  expect(screen.getByText('0:0 / 0')).toBeTruthy();
  view.rerender(<PaginationAdapter total={95} current={10} showTotal={total} />);
  expect(screen.getByText('91:95 / 95')).toBeTruthy();
});

const data = Array.from({ length: 12 }, (_, index) => ({ key: index, name: `Row ${index + 1}` }));
const columns = [{ key: 'name', title: 'Name', dataIndex: 'name' as const }];

it('changes Table rows and publishes the new size once at both boundaries', () => {
  const changed = vi.fn();
  const tableChanged = vi.fn();
  render(
    <TableAdapter
      columns={columns}
      dataSource={data}
      onChange={tableChanged}
      pagination={{
        defaultCurrent: 3,
        defaultPageSize: 2,
        showSizeChanger: true,
        pageSizeOptions: [2, 5, 20],
        showQuickJumper: true,
        showTotal: true,
        onChange: changed,
      }}
    />,
  );
  fireEvent.click(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: '5 / стр.' }));
  expect(screen.getAllByRole('cell')).toHaveLength(5);
  expect(screen.getByRole('cell', { name: 'Row 1' })).toBeTruthy();
  expect(changed).toHaveBeenCalledExactlyOnceWith(1, 5);
  expect(tableChanged).toHaveBeenCalledTimes(1);
  expect(tableChanged.mock.calls[0]![0]).toEqual({ current: 1, pageSize: 5 });
  fireEvent.click(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: '20 / стр.' }));
  expect(screen.getAllByRole('cell')).toHaveLength(12);
  expect(screen.getByRole('combobox')).toBeTruthy();
  expect(screen.getByText('1–12 из 12')).toBeTruthy();
});

it('keeps manual Table rows and controlled values until the owner accepts the size', () => {
  const changed = vi.fn();
  const tableChanged = vi.fn();
  render(
    <TableAdapter
      columns={columns}
      dataSource={data.slice(0, 2)}
      processing="manual"
      onChange={tableChanged}
      pagination={{
        total: 100,
        current: 3,
        pageSize: 2,
        showSizeChanger: true,
        pageSizeOptions: [2, 5],
        onChange: changed,
      }}
    />,
  );
  fireEvent.click(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: '5 / стр.' }));
  expect(changed).toHaveBeenCalledExactlyOnceWith(1, 5);
  expect(tableChanged.mock.calls[0]![0]).toEqual({ current: 1, pageSize: 5 });
  expect(screen.getByText('3 / 50')).toBeTruthy();
  expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('2 / стр.');
  expect(screen.getAllByRole('cell')).toHaveLength(2);
});
