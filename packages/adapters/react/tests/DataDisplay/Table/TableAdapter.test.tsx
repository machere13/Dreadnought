import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';

afterEach(cleanup);

describe('TableAdapter', () => {
  it('renders columns and records from a data source', () => {
    render(<TableAdapter
      aria-label="Пользователи"
      rowKey="id"
      columns={[
        { key: 'name', title: 'Имя', dataIndex: 'name' },
        { key: 'role', title: 'Роль', dataIndex: 'role', render: (value) => <strong>{String(value)}</strong> },
      ]}
      dataSource={[{ id: 1, name: 'Анна', role: 'Редактор' }]}
    />);

    expect(screen.getByRole('table', { name: 'Пользователи' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Имя' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Анна' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Редактор' }).querySelector('strong')).toBeTruthy();
  });

  it('preserves native table semantics, refs and consumer classes', () => {
    const ref = createRef<HTMLTableElement>();
    render(<TableAdapter ref={ref} className="custom-table" aria-label="Свойства">
      <TableAdapter.Head><TableAdapter.Row><TableAdapter.HeaderCell scope="col">Имя</TableAdapter.HeaderCell></TableAdapter.Row></TableAdapter.Head>
      <TableAdapter.Body><TableAdapter.Row><TableAdapter.HeaderCell scope="row">size</TableAdapter.HeaderCell><TableAdapter.Cell>compact</TableAdapter.Cell></TableAdapter.Row></TableAdapter.Body>
    </TableAdapter>);

    expect(screen.getByRole('table', { name: 'Свойства' })).toBe(ref.current);
    expect(ref.current?.className).toBe('custom-table');
    expect(screen.getByRole('columnheader', { name: 'Имя' })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'size' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'compact' })).toBeTruthy();
  });
});
