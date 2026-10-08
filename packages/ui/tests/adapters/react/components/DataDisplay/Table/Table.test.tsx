import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TableAdapter } from '@dreadnought/react/unstyled';
import { Table } from '@dreadnought/ui/react';

afterEach(cleanup);

describe('Table', () => {
  it('styles the shared loader, keeps consumer options and preserves focused rows', () => {
    const props = { processing: 'manual' as const, pagination: { total: 10, current: 2, pageSize: 2 },
      columns: [{ key: 'name', title: 'Name', dataIndex: 'name' as const, sorter: true as const }], dataSource: [{ key: 3, name: 'Anna' }] };
    const view = render(<Table {...props} />);
    const trigger = screen.getByRole('button', { name: 'Сортировать Name' });
    const cell = screen.getByRole('cell', { name: 'Anna' });
    trigger.focus();
    view.rerender(<Table {...props} loading slotProps={{ loader: { label: 'Loading results', showLabel: true,
      indicator: <span>Custom spinner</span>, className: 'consumer-loader', slotClassNames: { graphic: 'consumer-graphic' } } }} />);
    const status = screen.getByRole('status', { name: 'Loading results' });
    expect(status.closest('[data-ui="loader"]')?.className).toContain('consumer-loader');
    expect(status.closest('[data-ui="loader"]')?.className).not.toBe('consumer-loader');
    expect(status.closest('[data-ui="loader"]')?.getAttribute('data-custom-indicator')).toBe('true');
    expect(screen.getByText('Custom spinner').parentElement?.className).toContain('consumer-graphic');
    expect(screen.getByRole('cell', { name: 'Anna' })).toBe(cell);
    expect(document.activeElement).toBe(trigger);
    expect(cell.closest('[inert]')).toBeNull();
    expect(screen.getByText('2 / 5')).toBeTruthy();
  });
  it('renders styled summary cells with native spans and consumer properties', () => {
    render(<Table columns={[{ key: 'name', title: 'Name', dataIndex: 'name' }]} dataSource={[{ key: 1, name: 'Anna' }]}
      rowSelection={{}} expandable={{ expandedRowRender: row => row.name }}
      summary={rows => <Table.Row><Table.HeaderCell scope="row" colSpan={2}>Total</Table.HeaderCell>
        <Table.Cell className="consumer-total" title="Page count">{rows.length}</Table.Cell></Table.Row>} />);
    const total = screen.getByRole('cell', { name: '1' });
    expect(total.closest('tfoot')?.dataset.slot).toBe('summary');
    expect(total.className).toContain('consumer-total');
    expect(total.className).not.toBe('consumer-total');
    expect(total.title).toBe('Page count');
    expect(screen.getByRole('rowheader', { name: 'Total' }).getAttribute('colspan')).toBe('2');
  });
  it('styles the shared ellipsis tooltip without losing consumer options', () => {
    render(<Table columns={[{ key: 'name', title: 'Name', dataIndex: 'name', ellipsis: true }]}
      slotProps={{ tooltip: { className: 'consumer-tooltip', closeDelay: 0, placement: 'bottom' } }}
      dataSource={[{ key: 1, name: 'Full name' }]} />);
    const trigger = screen.getByText('Full name');
    fireEvent.focus(trigger);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.className).toContain('consumer-tooltip');
    expect(tooltip.className).not.toBe('consumer-tooltip');
    expect(tooltip.textContent).toBe('Full name');
    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
  it('passes grouped columns through the ready facade', () => {
    render(<Table columns={[{ key: 'person', title: 'Person', children: [
      { key: 'name', title: 'Name', dataIndex: 'name' }, { key: 'city', title: 'City', dataIndex: 'city' },
    ] }]} dataSource={[{ key: 1, name: 'Anna', city: 'Moscow' }]} />);
    expect(screen.getByRole('columnheader', { name: 'Person' }).getAttribute('colspan')).toBe('2');
    expect(screen.getByRole('cell', { name: 'Moscow' })).toBeTruthy();
  });
  it('uses the shared icon and preserves custom expansion content', () => {
    const props = { columns: [{ key: 'name', title: 'Name', dataIndex: 'name' as const }], dataSource: [{ key: 1, name: 'Anna' }] };
    const view = render(<Table {...props} expandable={{ expandedRowRender: row => <p>{row.name} details</p> }} />);
    const trigger = screen.getByRole('button', { name: 'Раскрыть строку 1' });
    expect(trigger.querySelector('[data-ui="icon"] svg')).toBeTruthy();
    fireEvent.click(trigger);
    expect(screen.getByText('Anna details').closest('td')?.dataset.slot).toBe('detail-cell');
    view.rerender(<Table {...props} expandable={{ expandedRowRender: row => row.name, expandIcon: () => <span>Custom icon</span> }} />);
    expect(screen.getByRole('button', { name: 'Свернуть строку 1' }).textContent).toContain('Custom icon');
  });
  it('preserves dynamic row and cell props through the ready facade', () => {
    render(<Table pagination={false} dataSource={[{ key: 1, name: 'Анна' }]}
      onRow={record => ({ title: `row:${record.key}` })}
      columns={[{ key: 'name', title: 'Имя', dataIndex: 'name', onCell: () => ({ className: 'custom-cell', colSpan: 2 }),
        onHeaderCell: () => ({ title: 'custom-header' }) }]} />);
    const cell = screen.getByRole('cell', { name: 'Анна' });
    expect(cell.className).toContain('custom-cell');
    expect(cell.getAttribute('colspan')).toBe('2');
    expect(cell.closest('tr')?.title).toBe('row:1');
    expect(screen.getByRole('columnheader', { name: 'Имя' }).title).toBe('custom-header');
  });
  it('renders data-driven columns through the ready component', () => {
    render(<Table
      aria-label="Команда"
      rowKey="id"
      columns={[{ key: 'name', title: 'Имя', dataIndex: 'name' }]}
      dataSource={[{ id: 7, name: 'Мария' }]}
    />);

    expect(screen.getByRole('columnheader', { name: 'Имя' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Мария' })).toBeTruthy();
  });

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
