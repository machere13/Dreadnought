import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('passes displayed records and page indices to row and cell props after sorting', () => {
  const clicked: string[] = [];
  render(<TableAdapter rowKey="id" pagination={{ pageSize: 1 }} dataSource={[{ id: 1, name: 'Борис' }, { id: 2, name: 'Анна' }]}
    onRow={(record, index) => ({ title: `${record.id}:${index}`, onClick: () => clicked.push(record.name) })}
    columns={[{ key: 'name', title: 'Имя', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name),
      onCell: (record, index) => ({ title: `cell:${record.id}:${index}`, className: 'custom-cell' }) }]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать Имя' }));
  const cell = screen.getByRole('cell', { name: 'Анна' });
  expect(cell.title).toBe('cell:2:0');
  expect(cell.className).toBe('custom-cell');
  expect(cell.closest('tr')?.title).toBe('2:0');
  fireEvent.click(cell);
  expect(clicked).toEqual(['Анна']);
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
  expect(screen.getByRole('cell', { name: 'Борис' }).title).toBe('cell:1:0');
});

it('merges cells and omits zero spans before calling a hidden cell renderer', () => {
  const hiddenRender = vi.fn(() => 'Hidden');
  render(<TableAdapter pagination={false} dataSource={[{ key: 1 }, { key: 2 }]}
    columns={[
      { key: 'a', title: 'A', render: () => 'Merged', onCell: (_record, index) => ({ rowSpan: index === 0 ? 2 : 0, colSpan: 2 }) },
      { key: 'b', title: 'B', render: hiddenRender, onCell: () => ({ colSpan: 0 }) },
    ]} />);
  const cell = screen.getByRole('cell', { name: 'Merged' }) as HTMLTableCellElement;
  expect(cell.rowSpan).toBe(2);
  expect(cell.colSpan).toBe(2);
  expect(screen.getAllByRole('cell')).toHaveLength(1);
  expect(hiddenRender).not.toHaveBeenCalled();
});

it('keeps sorting, selection and sticky geometry alongside native header and cell props', () => {
  const headerRef = createRef<HTMLTableCellElement>();
  const cellRef = createRef<HTMLTableCellElement>();
  render(<TableAdapter sticky={{ offsetHeader: 12 }} rowSelection={{ defaultSelectedRowKeys: [1] }} pagination={false}
    onHeaderRow={() => ({ title: 'Header row' })} onRow={() => ({ className: 'custom-row' })}
    columns={[{ key: 'name', title: 'Имя', dataIndex: 'name', width: 120, fixed: 'left', sorter: (a, b) => a.name.localeCompare(b.name),
      onHeaderCell: () => ({ ref: headerRef, className: 'custom-header', style: { color: 'red', position: 'absolute' } }),
      onCell: () => ({ ref: cellRef, style: { color: 'blue', position: 'absolute' } }) }]}
    dataSource={[{ key: 1, name: 'Анна' }]} />);
  const header = screen.getByRole('columnheader', { name: /Имя/ });
  expect(headerRef.current).toBe(header);
  expect(header.style.color).toBe('red');
  expect(header.style.position).toBe('sticky');
  expect(header.style.top).toBe('12px');
  expect(header.closest('tr')?.title).toBe('Header row');
  expect(cellRef.current?.style.color).toBe('blue');
  expect(cellRef.current?.style.position).toBe('sticky');
  expect(cellRef.current?.closest('tr')?.getAttribute('data-selected')).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать Имя' }));
  expect(header.getAttribute('aria-sort')).toBe('ascending');
});

it('does not shift fixed offsets when a header merges or hides columns', () => {
  let merged = true;
  vi.spyOn(HTMLTableCellElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLTableCellElement) {
    return { width: this.colSpan === 2 ? 300 : 80 } as DOMRect;
  });
  const columns = [
    { key: 'a', title: 'AB', width: 100, fixed: 'left' as const, onHeaderCell: () => ({ colSpan: merged ? 2 : 1 }) },
    { key: 'b', title: 'Hidden', width: 200, fixed: 'left' as const, onHeaderCell: () => ({ colSpan: merged ? 0 : 1 }) },
    { key: 'c', title: 'C', width: 80, fixed: 'left' as const },
  ];
  const view = render(<TableAdapter pagination={false} dataSource={[{ key: 1 }]} columns={columns} />);
  expect(screen.queryByRole('columnheader', { name: 'Hidden' })).toBeNull();
  expect(screen.getByRole('columnheader', { name: 'AB' }).getAttribute('colspan')).toBe('2');
  expect(screen.getByRole('columnheader', { name: 'C' }).style.left).toBe('300px');
  merged = false;
  view.rerender(<TableAdapter pagination={false} dataSource={[{ key: 1 }]} columns={columns} />);
  expect(screen.getByRole('columnheader', { name: 'Hidden' })).toBeTruthy();
  expect(screen.getByRole('columnheader', { name: 'C' }).style.left).toBe('160px');
});
