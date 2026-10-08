import { createRef } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('accounts for selection and expansion widths before fixed data columns', () => {
  vi.spyOn(HTMLTableCellElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLTableCellElement) {
    return { width: [44, 40, 180, 100][this.cellIndex] ?? 0 } as DOMRect;
  });
  render(<TableAdapter columns={[{ key: 'a', title: 'A', fixed: 'left' }, { key: 'b', title: 'B', fixed: 'left' }]}
    dataSource={[{ key: 1 }]} rowSelection={{}} expandable={{ expandedRowRender: () => 'Details' }} />);
  expect(screen.getByRole('columnheader', { name: 'Раскрытие строк' }).style.left).toBe('44px');
  expect(screen.getByRole('columnheader', { name: 'A' }).style.left).toBe('84px');
  expect(screen.getByRole('columnheader', { name: 'B' }).style.left).toBe('264px');
});

it('keeps sticky selection and expansion controls separate without fixed data columns', () => {
  vi.spyOn(HTMLTableCellElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLTableCellElement) {
    return { width: [44, 40, 180][this.cellIndex] ?? 0 } as DOMRect;
  });
  render(<TableAdapter columns={[{ key: 'a', title: 'A' }]} dataSource={[{ key: 1 }]}
    rowSelection={{}} expandable={{ expandedRowRender: () => 'Details' }} />);
  expect(screen.getByRole('columnheader', { name: 'Раскрытие строк' }).style.left).toBe('44px');
});

it('uses actual selection and column widths for both fixed edges and updates after resize', () => {
  let widths = [44, 180, 90, 200, 110];
  let resize = () => {};
  vi.spyOn(HTMLTableCellElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLTableCellElement) {
    return { width: widths[this.cellIndex] ?? 0 } as DOMRect;
  });
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: () => void) { resize = callback; }
    observe() {}
    disconnect() {}
  });
  const ref = createRef<HTMLTableElement>();
  render(<TableAdapter ref={ref} rowSelection={{}} sticky={{ offsetHeader: 24 }} scroll={{ x: 800, y: 200 }}
    columns={[
      { key: 'a', title: 'A', width: 120, fixed: 'left' },
      { key: 'b', title: 'B', fixed: 'left' },
      { key: 'c', title: 'C', fixed: 'right' },
      { key: 'd', title: 'D', width: 80, fixed: 'right' },
    ]} dataSource={[{ key: 1 }]} />);
  expect(ref.current).toBe(screen.getByRole('table'));
  expect(screen.getByRole('columnheader', { name: 'A' }).style.left).toBe('44px');
  expect(screen.getByRole('columnheader', { name: 'B' }).style.left).toBe('224px');
  expect(screen.getByRole('columnheader', { name: 'C' }).style.right).toBe('110px');
  expect(screen.getByRole('columnheader', { name: 'B' }).style.top).toBe('24px');
  expect(screen.getByRole('columnheader', { name: 'B' }).style.position).toBe('sticky');
  widths = [52, 240, 90, 200, 140];
  act(() => resize());
  expect(screen.getByRole('columnheader', { name: 'B' }).style.left).toBe('292px');
  expect(screen.getByRole('columnheader', { name: 'C' }).style.right).toBe('140px');
  expect(screen.getAllByRole('cell')[2]?.style.left).toBe('292px');
});

it('disconnects measurement when the table unmounts', () => {
  const disconnect = vi.fn();
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect = disconnect; });
  const view = render(<TableAdapter columns={[{ key: 'a', title: 'A', fixed: 'left' }]} dataSource={[]} />);
  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});

it('keeps declared widths as a fallback when layout is unavailable', () => {
  vi.stubGlobal('ResizeObserver', undefined);
  render(<TableAdapter sticky columns={[{ key: 'a', title: 'A', width: 100, fixed: 'left' }, { key: 'b', title: 'B', fixed: 'left' }]} dataSource={[]} />);
  expect(screen.getByRole('columnheader', { name: 'B' }).style.left).toBe('100px');
  expect(screen.getByRole('columnheader', { name: 'B' }).style.top).toBe('0px');
});
