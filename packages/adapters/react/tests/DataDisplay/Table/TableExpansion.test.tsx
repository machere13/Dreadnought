import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';

afterEach(cleanup);
const rows = [
  { key: 'a', name: 'A' },
  { key: 'b', name: 'B' },
];
const columns = [{ key: 'name', title: 'Name', dataIndex: 'name' as const }];
const details = (row: (typeof rows)[number]) => (
  <input aria-label={`Details ${row.name}`} defaultValue={row.name} />
);

it('connects an accessible trigger to a spanning detail row and publishes toggles', () => {
  const onExpand = vi.fn();
  const onExpandedRowsChange = vi.fn();
  render(
    <TableAdapter
      columns={columns}
      dataSource={rows}
      rowSelection={{}}
      expandable={{ expandedRowRender: details, onExpand, onExpandedRowsChange }}
    />,
  );
  const trigger = screen.getByRole('button', { name: 'Раскрыть строку a' });
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(screen.queryByRole('textbox')).toBeNull();
  fireEvent.click(trigger);
  const input = screen.getByRole('textbox', { name: 'Details A' });
  const cell = input.closest('td')!;
  expect(cell.colSpan).toBe(3);
  expect(input.closest('tr')!.id).toBe(trigger.getAttribute('aria-controls'));
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(trigger);
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(onExpand.mock.calls).toEqual([
    [true, rows[0]],
    [false, rows[0]],
  ]);
  expect(onExpandedRowsChange.mock.calls).toEqual([[['a']], [[]]]);
});

it('waits for the owner to accept controlled expansion and restores focus on collapse', () => {
  const onExpandedRowsChange = vi.fn();
  const props = { columns, dataSource: rows };
  const view = render(
    <TableAdapter
      {...props}
      expandable={{ expandedRowRender: details, expandedRowKeys: [], onExpandedRowsChange }}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Раскрыть строку a' }));
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(onExpandedRowsChange).toHaveBeenCalledWith(['a']);
  view.rerender(
    <TableAdapter {...props} expandable={{ expandedRowRender: details, expandedRowKeys: ['a'] }} />,
  );
  screen.getByRole('textbox').focus();
  view.rerender(
    <TableAdapter {...props} expandable={{ expandedRowRender: details, expandedRowKeys: [] }} />,
  );
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Раскрыть строку a' }));
});

it('does not steal focus outside the detail when the owner collapses it', () => {
  const view = render(
    <>
      <button>Outside</button>
      <TableAdapter
        columns={columns}
        dataSource={rows}
        expandable={{ expandedRowRender: details, expandedRowKeys: ['a'] }}
      />
    </>,
  );
  const outside = screen.getByRole('button', { name: 'Outside' });
  outside.focus();
  view.rerender(
    <>
      <button>Outside</button>
      <TableAdapter
        columns={columns}
        dataSource={rows}
        expandable={{ expandedRowRender: details, expandedRowKeys: [] }}
      />
    </>,
  );
  expect(document.activeElement).toBe(outside);
});

it('preserves expansion by record key across sorting and pagination', () => {
  render(
    <TableAdapter
      columns={[{ ...columns[0]!, sorter: (a, b) => b.name.localeCompare(a.name) }]}
      dataSource={rows}
      pagination={{ pageSize: 1 }}
      expandable={{ expandedRowRender: details, defaultExpandedRowKeys: ['a'] }}
    />,
  );
  expect(screen.getByRole('textbox', { name: 'Details A' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать Name' }));
  expect(screen.queryByRole('textbox')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
  expect(screen.getByRole('textbox', { name: 'Details A' })).toBeTruthy();
});

it('does not expand ineligible records even if their keys are supplied', () => {
  render(
    <TableAdapter
      columns={columns}
      dataSource={rows}
      expandable={{
        expandedRowRender: details,
        defaultExpandedRowKeys: ['b'],
        rowExpandable: (row) => row.key === 'a',
      }}
    />,
  );
  expect(screen.queryByRole('button', { name: /строку b/ })).toBeNull();
  expect(screen.queryByRole('textbox')).toBeNull();
});

it('includes the expansion column in the empty row span', () => {
  render(
    <TableAdapter columns={columns} dataSource={[]} expandable={{ expandedRowRender: details }} />,
  );
  expect(screen.getByText('Нет данных').getAttribute('colspan')).toBe('2');
});

it('rejects missing or duplicate keys for expandable tables', () => {
  expect(() =>
    render(
      <TableAdapter
        columns={columns}
        dataSource={[{ name: 'A' }]}
        expandable={{ expandedRowRender: () => 'Detail' }}
      />,
    ),
  ).toThrow(/rowKey/);
  expect(() =>
    render(
      <TableAdapter
        columns={columns}
        dataSource={[rows[0]!, rows[0]!]}
        expandable={{ expandedRowRender: details }}
      />,
    ),
  ).toThrow(/unique/);
});

it('opens and closes from the keyboard without submitting a containing form', async () => {
  const submit = vi.fn((event) => event.preventDefault());
  const user = userEvent.setup();
  render(
    <form onSubmit={submit}>
      <TableAdapter
        columns={columns}
        dataSource={rows}
        expandable={{ expandedRowRender: details }}
      />
    </form>,
  );
  const trigger = screen.getByRole('button', { name: 'Раскрыть строку a' });
  trigger.focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('textbox', { name: 'Details A' })).toBeTruthy();
  await user.keyboard(' ');
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(submit).not.toHaveBeenCalled();
});

it('restores detail focus in the owning iframe document', () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const documentInFrame = frame.contentDocument!;
  const view = render(
    <TableAdapter
      columns={columns}
      dataSource={rows}
      expandable={{ expandedRowRender: details, expandedRowKeys: ['a'] }}
    />,
    { container: documentInFrame.body },
  );
  documentInFrame.querySelector('input')!.focus();
  view.rerender(
    <TableAdapter
      columns={columns}
      dataSource={rows}
      expandable={{ expandedRowRender: details, expandedRowKeys: [] }}
    />,
  );
  expect(documentInFrame.activeElement?.getAttribute('aria-label')).toBe('Раскрыть строку a');
  view.unmount();
  frame.remove();
});
