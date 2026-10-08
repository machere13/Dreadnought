import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';

afterEach(cleanup);

it('recalculates visible headers and cells when a column is hidden', () => {
  const data = [{ key: 1, name: 'Anna', city: 'Moscow' }];
  const columns = (hidden: boolean) => [
    {
      key: 'person',
      title: 'Person',
      children: [
        { key: 'name', title: 'Name', dataIndex: 'name' as const },
        { key: 'city', title: 'City', dataIndex: 'city' as const, hidden },
      ],
    },
  ];
  const view = render(
    <TableAdapter columns={columns(false)} dataSource={data} pagination={false} />,
  );
  view.rerender(<TableAdapter columns={columns(true)} dataSource={data} pagination={false} />);
  expect(screen.queryByRole('columnheader', { name: 'City' })).toBeNull();
  expect(screen.queryByRole('cell', { name: 'Moscow' })).toBeNull();
  expect(screen.getByRole('columnheader', { name: 'Person' }).getAttribute('colspan')).toBe('1');
});

it('does not sort or filter by hidden columns', () => {
  render(
    <TableAdapter
      columns={[
        { key: 'name', title: 'Name', dataIndex: 'name' },
        {
          key: 'order',
          title: 'Order',
          hidden: true,
          defaultSortOrder: 'ascend',
          sorter: (a, b) => a.name.localeCompare(b.name),
          defaultFilteredValue: ['A'],
          onFilter: (value, row) => row.name === value,
        },
      ]}
      dataSource={[
        { key: 1, name: 'B' },
        { key: 2, name: 'A' },
      ]}
      pagination={false}
    />,
  );
  expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['B', 'A']);
});

it('aligns headers and body cells while preserving native cell styles', () => {
  render(
    <TableAdapter
      columns={[
        {
          key: 'price',
          title: 'Price',
          dataIndex: 'price',
          align: 'right',
          onCell: () => ({ style: { color: 'red' } }),
        },
      ]}
      dataSource={[{ key: 1, price: 123 }]}
    />,
  );
  expect(screen.getByRole('columnheader', { name: 'Price' }).style.textAlign).toBe('right');
  expect(screen.getByRole('cell', { name: '123' }).style.textAlign).toBe('right');
  expect(screen.getByRole('cell', { name: '123' }).style.color).toBe('red');
});

it('opens the shared tooltip on keyboard focus for ellipsized plain text', () => {
  render(
    <TableAdapter
      slotProps={{ tooltip: { openDelay: 0, closeDelay: 0, className: 'custom-tip' } }}
      columns={[{ key: 'name', title: 'Name', dataIndex: 'name', ellipsis: true, width: 100 }]}
      dataSource={[{ key: 1, name: 'Long full text' }]}
    />,
  );
  const trigger = screen.getByText('Long full text');
  expect(trigger.dataset.slot).toBe('ellipsis');
  expect(trigger.tabIndex).toBe(0);
  fireEvent.focus(trigger);
  const tooltip = screen.getByRole('tooltip');
  expect(tooltip.textContent).toBe('Long full text');
  expect(tooltip.className).toBe('custom-tip');
  expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('keeps interactive render content intact without duplicating it in a tooltip', () => {
  render(
    <TableAdapter
      columns={[
        { key: 'name', title: 'Name', ellipsis: true, render: () => <button>Edit</button> },
      ]}
      dataSource={[{ key: 1 }]}
    />,
  );
  expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(1);
  expect(
    screen.getByRole('button', { name: 'Edit' }).closest('[data-slot="ellipsis"]'),
  ).toBeTruthy();
});

it('updates fixed offsets and expansion spans after hiding a fixed column', () => {
  const data = [{ key: 1, name: 'Anna', city: 'Moscow' }];
  const columns = (hidden: boolean) => [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name' as const,
      fixed: 'left' as const,
      width: 120,
      hidden,
    },
    { key: 'city', title: 'City', dataIndex: 'city' as const, fixed: 'left' as const, width: 100 },
  ];
  const props = {
    dataSource: data,
    pagination: false as const,
    expandable: { defaultExpandedRowKeys: [1], expandedRowRender: () => 'Details' },
  };
  const view = render(<TableAdapter {...props} columns={columns(false)} />);
  expect(screen.getByRole('columnheader', { name: 'City' }).style.left).toBe('120px');
  view.rerender(<TableAdapter {...props} columns={columns(true)} />);
  expect(screen.getByRole('columnheader', { name: 'City' }).style.left).toBe('0px');
  expect(screen.getByRole('cell', { name: 'Details' }).getAttribute('colspan')).toBe('2');
  view.rerender(<TableAdapter {...props} columns={columns(false)} />);
  expect(screen.getByRole('columnheader', { name: 'City' }).style.left).toBe('120px');
});
