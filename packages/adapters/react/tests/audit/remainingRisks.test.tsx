import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import {
  BarChartAdapter,
  CodeBlockAdapter,
  LineChartAdapter,
  RadarChartAdapter,
  TableAdapter,
} from '../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each(['success', 'error'] as const)(
  'pending copy reports %s through the latest committed callback',
  async (outcome) => {
    let resolve!: () => void;
    let reject!: (error: unknown) => void;
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: () =>
          new Promise<void>((done, fail) => {
            resolve = done;
            reject = fail;
          }),
      },
    });
    const old = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(
      <StrictMode>
        <CodeBlockAdapter code="same" onCopy={old} onCopyError={old} />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole('button'));
    rerender(
      <StrictMode>
        <CodeBlockAdapter code="same" onCopy={latest} onCopyError={latest} />
      </StrictMode>,
    );
    const error = new Error('permission denied');
    await act(async () => {
      if (outcome === 'success') {
        resolve();
      } else {
        reject(error);
      }
    });
    expect(old).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledExactlyOnceWith(outcome === 'success' ? 'same' : error);
  },
);

function chart(
  kind: 'line' | 'bar' | 'radar',
  change: (next: string[]) => void,
  controlled = false,
) {
  const common = {
    label: 'Chart',
    width: 400,
    height: 300,
    onVisibleSeriesChange: change,
    ...(controlled ? { visibleSeries: ['a', 'b'] } : {}),
  };
  if (kind === 'line') {
    return (
      <LineChartAdapter
        {...common}
        xDomain={[0, 1]}
        yDomain={[0, 10]}
        series={[
          { id: 'a', label: 'A', data: [{ x: 0, y: 2 }] },
          { id: 'b', label: 'B', data: [{ x: 0, y: 3 }] },
        ]}
      />
    );
  }
  if (kind === 'bar') {
    return (
      <BarChartAdapter
        {...common}
        domain={[0, 10]}
        categories={[{ id: 'x', label: 'X' }]}
        series={[
          { id: 'a', label: 'A', values: { x: 2 } },
          { id: 'b', label: 'B', values: { x: 3 } },
        ]}
      />
    );
  }
  return (
    <RadarChartAdapter
      {...common}
      metrics={['x', 'y', 'z'].map((id) => ({ id, label: id, domain: [0, 10] as const }))}
      series={[
        { id: 'a', label: 'A', values: { x: 2, y: 2, z: 2 } },
        { id: 'b', label: 'B', values: { x: 3, y: 3, z: 3 } },
      ]}
    />
  );
}

it.each(['line', 'bar', 'radar'] as const)(
  '%s preserves both legend changes before commit',
  (kind) => {
    const changes: string[][] = [];
    render(
      <StrictMode>
        {chart(kind, (next) => {
          changes.push([...next]);
          next.length = 0;
        })}
      </StrictMode>,
    );
    const first = screen.getByRole('button', { name: 'A' }) as HTMLButtonElement;
    const second = screen.getByRole('button', { name: 'B' }) as HTMLButtonElement;
    act(() => {
      first.click();
      second.click();
    });
    expect(changes).toEqual([['b'], []]);
    expect(first.getAttribute('aria-pressed')).toBe('false');
    expect(second.getAttribute('aria-pressed')).toBe('false');
  },
);

it.each(['line', 'bar', 'radar'] as const)(
  '%s keeps rejected controlled visibility with batched changes',
  (kind) => {
    const changes = vi.fn();
    render(chart(kind, changes, true));
    const first = screen.getByRole('button', { name: 'A' }) as HTMLButtonElement;
    const second = screen.getByRole('button', { name: 'B' }) as HTMLButtonElement;
    act(() => {
      first.click();
      second.click();
    });
    expect(changes.mock.calls).toEqual([[['b']], [['a']]]);
    expect(first.getAttribute('aria-pressed')).toBe('true');
    expect(second.getAttribute('aria-pressed')).toBe('true');
  },
);

it('Table preserves both row selections before commit', () => {
  const changes = vi.fn();
  render(
    <StrictMode>
      <TableAdapter
        rowKey="id"
        dataSource={[{ id: 1 }, { id: 2 }]}
        columns={[{ key: 'id', dataIndex: 'id', title: 'ID' }]}
        rowSelection={{ onChange: changes }}
      />
    </StrictMode>,
  );
  const first = screen.getByRole('checkbox', { name: 'Выбрать строку 1' }) as HTMLInputElement;
  const second = screen.getByRole('checkbox', { name: 'Выбрать строку 2' }) as HTMLInputElement;
  act(() => {
    first.click();
    second.click();
  });
  expect(first.checked).toBe(true);
  expect(second.checked).toBe(true);
  expect(changes.mock.calls.map((call) => call[0])).toEqual([[1], [1, 2]]);
});

it('Table display and change payload use the same filter and sorting pipeline', () => {
  const changed = vi.fn();
  render(
    <TableAdapter
      rowKey="id"
      pagination={false}
      onChange={changed}
      dataSource={[
        { id: 1, age: 30, role: 'x' },
        { id: 2, age: 20, role: 'x' },
        { id: 3, age: 10, role: 'y' },
      ]}
      columns={[
        { key: 'age', title: 'Age', dataIndex: 'age', sorter: (a, b) => a.age - b.age },
        {
          key: 'role',
          title: 'Role',
          dataIndex: 'role',
          filters: [{ value: 'x', text: 'X' }],
          onFilter: (value, row) => row.role === value,
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать Age' }));
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Role' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'X' }));
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
  expect(
    screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getAllByRole('cell')[0].textContent),
  ).toEqual(['20', '30']);
  expect(
    changed.mock.calls.at(-1)![3].currentDataSource.map((row: { id: number }) => row.id),
  ).toEqual([2, 1]);
});

it('Table fallback preserves two composed filter applications before commit', () => {
  const changed = vi.fn();
  render(
    <TableAdapter
      rowKey="id"
      pagination={false}
      onChange={changed}
      dataSource={[
        { id: 1, role: 'x', team: 'a' },
        { id: 2, role: 'x', team: 'b' },
        { id: 3, role: 'y', team: 'a' },
      ]}
      columns={[
        { key: 'id', title: 'ID', dataIndex: 'id' },
        {
          key: 'role',
          title: 'Role',
          dataIndex: 'role',
          filters: [{ value: 'x', text: 'X' }],
          onFilter: (value, row) => row.role === value,
        },
        {
          key: 'team',
          title: 'Team',
          dataIndex: 'team',
          filters: [{ value: 'a', text: 'Team A' }],
          onFilter: (value, row) => row.team === value,
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Role' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'X' }));
  const first = within(screen.getByRole('dialog', { name: 'Фильтр Role' })).getByRole('button', {
    name: 'Применить',
  }) as HTMLButtonElement;
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Team' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Team A' }));
  const second = within(screen.getByRole('dialog', { name: 'Фильтр Team' })).getByRole('button', {
    name: 'Применить',
  }) as HTMLButtonElement;
  act(() => {
    first.click();
    second.click();
  });
  expect(screen.getAllByRole('row').slice(1)).toHaveLength(1);
  expect(changed.mock.calls.at(-1)![1]).toEqual({ role: ['x'], team: ['a'] });
  expect(
    changed.mock.calls.at(-1)![3].currentDataSource.map((row: { id: number }) => row.id),
  ).toEqual([1]);
});
