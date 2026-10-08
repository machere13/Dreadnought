import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TableAdapter, type TableColumn } from '../../../src/DataDisplay/Table/index.ts';

afterEach(cleanup);
const rows = [{ key: 1, name: 'Anna' }, { key: 2, name: 'Boris' }];
type Row = typeof rows[number];
const column: TableColumn<Row> = { key: 'name', title: 'Name', dataIndex: 'name', filterSearch: true,
  filters: [{ text: 'Anna', value: 'Anna' }, { text: 'Boris', value: 'Boris' }], onFilter: (value, row) => row.name === value };

it('searches options without losing hidden selections or applying a filter while typing', () => {
  const changes: unknown[] = [];
  render(<TableAdapter pagination={false} columns={[column]} dataSource={rows} onChange={(_p, f) => changes.push(f)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Name' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Anna' }));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '  BOR  ' } });
  expect(screen.queryByRole('checkbox', { name: 'Anna' })).toBeNull();
  expect(screen.getByRole('checkbox', { name: 'Boris' })).toBeTruthy();
  expect(changes).toEqual([]);
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
  expect(changes).toEqual([{ name: ['Anna'] }]);
  expect(screen.queryByRole('cell', { name: 'Boris' })).toBeNull();
});

it('uses the custom search predicate and exposes an empty result without dropping choices', () => {
  render(<TableAdapter pagination={false} columns={[{ ...column, filterSearch: (input, option) => String(option.value).startsWith(input) }]} dataSource={rows} />);
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Name' }));
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'B' } });
  expect(screen.queryByRole('checkbox', { name: 'Anna' })).toBeNull();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'missing' } });
  expect(screen.getByRole('status').textContent).toBe('Ничего не найдено');
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
});

it('closes on Escape without applying drafts and resets search on reopening', () => {
  render(<TableAdapter pagination={false} columns={[column]} dataSource={rows} />);
  const trigger = screen.getByRole('button', { name: 'Фильтр Name' });
  fireEvent.click(trigger);
  const input = screen.getByRole('searchbox');
  expect(document.activeElement).toBe(input);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Anna' }));
  fireEvent.change(input, { target: { value: 'Anna' } });
  fireEvent.keyDown(input, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(screen.getAllByRole('cell')).toHaveLength(2);
  fireEvent.click(trigger);
  expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
  expect((screen.getByRole('checkbox', { name: 'Anna' }) as HTMLInputElement).checked).toBe(false);
});

it('applies a custom panel without predefined options, including same-event draft updates', () => {
  const changes: unknown[] = [];
  render(<TableAdapter processing="manual" pagination={false} dataSource={rows} columns={[{ key: 'name', title: 'Name', dataIndex: 'name',
    filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, close }) => <>
      <span>Draft: {selectedKeys.join(',')}</span>
      <button onClick={() => { setSelectedKeys(['Anna']); confirm({ closeDropdown: false }); }}>Choose Anna</button>
      <button onClick={close}>Close</button>
    </> }]} onChange={(p, f, _s, extra) => changes.push([p.current, f, extra.currentDataSource.length])} />);
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Name' }));
  fireEvent.click(screen.getByRole('button', { name: 'Choose Anna' }));
  expect(changes).toEqual([[1, { name: ['Anna'] }, 2]]);
  expect(screen.getByText('Draft: Anna')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('clears only the draft when requested, then applies it through confirm', () => {
  const changes: unknown[] = [];
  render(<TableAdapter pagination={false} dataSource={rows} columns={[{ ...column, defaultFilteredValue: ['Anna'],
    filterDropdown: ({ selectedKeys, clearFilters, confirm }) => <>
      <span>Draft: {selectedKeys.join(',')}</span>
      <button onClick={() => clearFilters({ confirm: false, closeDropdown: false })}>Clear draft</button>
      <button onClick={() => confirm()}>Apply draft</button>
    </> }]} onChange={(_p, f) => changes.push(f)} />);
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Name' }));
  fireEvent.click(screen.getByRole('button', { name: 'Clear draft' }));
  expect(screen.getByText('Draft:')).toBeTruthy();
  expect(screen.queryByRole('cell', { name: 'Boris' })).toBeNull();
  expect(changes).toEqual([]);
  fireEvent.click(screen.getByRole('button', { name: 'Apply draft' }));
  expect(changes).toEqual([{ name: [] }]);
  expect(screen.getByRole('cell', { name: 'Boris' })).toBeTruthy();
});

it('waits for controlled filter acceptance and highlights only the accepted state', () => {
  const changes: unknown[] = [];
  const props = { dataSource: rows, pagination: false as const, onChange: (_p: unknown, f: unknown) => changes.push(f) };
  const view = render(<TableAdapter {...props} columns={[{ ...column, filteredValue: [] }]} />);
  const trigger = screen.getByRole('button', { name: 'Фильтр Name' });
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Anna' }));
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
  expect(changes).toEqual([{ name: ['Anna'] }]);
  expect(screen.getByRole('cell', { name: 'Boris' })).toBeTruthy();
  expect(trigger.getAttribute('data-filtered')).toBe('false');
  view.rerender(<TableAdapter {...props} columns={[{ ...column, filteredValue: ['Anna'] }]} />);
  expect(trigger.getAttribute('data-filtered')).toBe('true');
  expect(screen.queryByRole('cell', { name: 'Boris' })).toBeNull();
});
