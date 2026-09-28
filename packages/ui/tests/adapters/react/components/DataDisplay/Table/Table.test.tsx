import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TableAdapter } from '@dreadnought/react/unstyled';
import { Table } from '@dreadnought/ui/react';

afterEach(cleanup);

describe('Table', () => {
  it('exposes density, borders and row hover settings on the ready table', () => {
    render(<Table size="small" bordered rowHoverable={false} aria-label="Свойства">
      <Table.Head><Table.Row><Table.HeaderCell scope="col">Имя</Table.HeaderCell></Table.Row></Table.Head>
      <Table.Body><Table.Row><Table.Cell>Button</Table.Cell></Table.Row></Table.Body>
    </Table>);

    const table = screen.getByRole('table', { name: 'Свойства' });
    expect(table.getAttribute('data-size')).toBe('small');
    expect(table.getAttribute('data-bordered')).toBe('true');
    expect(table.getAttribute('data-row-hoverable')).toBe('false');
  });

  it('styles the ready table and its cells without styling the adapter', () => {
    render(<>
      <Table className="consumer-table"><Table.Body><Table.Row><Table.Cell className="consumer-cell">Готовая ячейка</Table.Cell></Table.Row></Table.Body></Table>
      <TableAdapter className="plain"><TableAdapter.Body><TableAdapter.Row><TableAdapter.Cell>Своя ячейка</TableAdapter.Cell></TableAdapter.Row></TableAdapter.Body></TableAdapter>
    </>);

    expect(screen.getByText('Готовая ячейка').className).toContain('consumer-cell');
    expect(screen.getByText('Готовая ячейка').className).not.toBe('consumer-cell');
    expect(screen.getAllByRole('table')[0]?.className).toContain('consumer-table');
    expect(screen.getAllByRole('table')[1]?.className).toBe('plain');
    expect(screen.getByText('Своя ячейка').className).toBe('');
  });
});
