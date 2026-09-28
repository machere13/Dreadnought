import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';

afterEach(cleanup);

describe('TableAdapter', () => {
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
