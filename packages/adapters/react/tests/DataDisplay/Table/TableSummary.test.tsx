import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';

afterEach(cleanup);

const data = [{ key: 1, amount: 10 }, { key: 2, amount: 30 }, { key: 3, amount: 20 }];
const columns = [{ key: 'amount', title: 'Amount', dataIndex: 'amount' as const,
  sorter: (a: typeof data[number], b: typeof data[number]) => a.amount - b.amount,
  defaultSortOrder: 'descend' as const, onFilter: (value: string | number, row: typeof data[number]) => row.amount >= Number(value),
  filteredValue: [20] }];
const summary = (rows: readonly typeof data[number][]) => <TableAdapter.Row>
  <TableAdapter.Cell>{rows.map(row => row.amount).join(',') || 'Empty total'}</TableAdapter.Cell>
</TableAdapter.Row>;

describe('Table summary', () => {
  it('renders filtered and sorted current-page records in a native footer', async () => {
    const { container } = render(<TableAdapter dataSource={data} columns={columns} pagination={{ pageSize: 1 }} summary={summary} />);
    expect(container.querySelector('tfoot')?.textContent).toBe('30');
    await userEvent.click(screen.getByRole('button', { name: /Следующая/ }));
    expect(container.querySelector('tfoot')?.textContent).toBe('20');
    expect(within(screen.getByRole('table')).getAllByRole('rowgroup')).toHaveLength(3);
  });

  it('passes all matching rows without pagination and updates on props changes', () => {
    const { container, rerender } = render(<TableAdapter dataSource={data} columns={columns} pagination={false} summary={summary} />);
    expect(container.querySelector('tfoot')?.textContent).toBe('30,20');
    rerender(<TableAdapter dataSource={[]} columns={columns} pagination={false} summary={summary} />);
    expect(container.querySelector('tfoot')?.textContent).toBe('Empty total');
    expect(screen.getByText('Нет данных')).toBeTruthy();
  });

  it('omits the footer when the summary returns null', () => {
    const { container } = render(<TableAdapter dataSource={data} columns={columns} summary={() => null} />);
    expect(container.querySelector('tfoot')).toBeNull();
    expect(screen.getByRole('table').hasAttribute('summary')).toBe(false);
  });
});
