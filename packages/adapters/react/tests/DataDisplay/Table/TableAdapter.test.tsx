import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TableAdapter } from '../../../src/DataDisplay/Table/index.ts';

afterEach(cleanup);

describe('TableAdapter', () => {
  it('leaves Escape from a nested popup to that popup', () => {
    render(
      <TableAdapter
        columns={[
          { key: 'role', title: 'Роль', filters: [{ text: 'Дизайнер', value: 'designer' }] },
        ]}
        dataSource={[]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Фильтр Роль' }));
    const child = document.createElement('div');
    child.setAttribute('popover', 'auto');
    const button = document.createElement('button');
    child.append(button);
    screen.getByRole('dialog', { name: 'Фильтр Роль' }).append(child);
    expect(fireEvent.keyDown(button, { key: 'Escape' })).toBe(true);
    expect(screen.getByRole('checkbox', { name: 'Дизайнер' })).toBeTruthy();
  });
  it('dismisses a filter with Escape and restores focus without applying its draft', () => {
    render(
      <TableAdapter
        rowKey="id"
        columns={[
          {
            key: 'role',
            title: 'Роль',
            dataIndex: 'role',
            filters: [{ text: 'Дизайнер', value: 'designer' }],
            onFilter: (value, row) => row.role === value,
          },
        ]}
        dataSource={[
          { id: 1, role: 'designer' },
          { id: 2, role: 'developer' },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Фильтр Роль' });
    fireEvent.click(trigger);
    const choice = screen.getByRole('checkbox', { name: 'Дизайнер' });
    fireEvent.click(choice);
    choice.focus();
    fireEvent.keyDown(choice, { key: 'Escape' });
    expect(screen.queryByRole('checkbox', { name: 'Дизайнер' })).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(screen.getAllByRole('cell')).toHaveLength(2);
  });

  it('dismisses a filter outside without stealing focus', () => {
    render(
      <>
        <button>Outside</button>
        <TableAdapter
          columns={[
            { key: 'role', title: 'Роль', filters: [{ text: 'Дизайнер', value: 'designer' }] },
          ]}
          dataSource={[]}
        />
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Фильтр Роль' }));
    const outside = screen.getByRole('button', { name: 'Outside' });
    outside.focus();
    fireEvent.pointerDown(outside);
    expect(screen.queryByRole('checkbox', { name: 'Дизайнер' })).toBeNull();
    expect(document.activeElement).toBe(outside);
  });

  it.each(['Применить', 'Сбросить'])('restores filter trigger focus after %s', (label) => {
    render(
      <TableAdapter
        columns={[
          { key: 'role', title: 'Роль', filters: [{ text: 'Дизайнер', value: 'designer' }] },
        ]}
        dataSource={[]}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Фильтр Роль' });
    fireEvent.click(trigger);
    const action = screen.getByRole('button', { name: label });
    action.focus();
    fireEvent.click(action);
    expect(document.activeElement).toBe(trigger);
  });
  it('reports requested sorting while a controlled column waits for new props', () => {
    const changes: Array<{ order: string | null; rows: number[] }> = [];
    const dataSource = [
      { id: 1, age: 42 },
      { id: 2, age: 18 },
    ];
    const columns = (order: 'ascend' | null) => [
      {
        key: 'age',
        title: 'Возраст',
        dataIndex: 'age' as const,
        sorter: (a: (typeof dataSource)[number], b: (typeof dataSource)[number]) => a.age - b.age,
        sortOrder: order,
      },
    ];
    const onChange = (
      _page: unknown,
      _filters: unknown,
      sorter: { order: 'ascend' | 'descend' | null },
      extra: { currentDataSource: readonly (typeof dataSource)[number][] },
    ) => changes.push({ order: sorter.order, rows: extra.currentDataSource.map((row) => row.id) });
    const view = render(
      <TableAdapter
        rowKey="id"
        columns={columns(null)}
        dataSource={dataSource}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Сортировать Возраст' }));
    expect(changes).toEqual([{ order: 'ascend', rows: [2, 1] }]);
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['42', '18']);
    view.rerender(
      <TableAdapter
        rowKey="id"
        columns={columns('ascend')}
        dataSource={dataSource}
        onChange={onChange}
      />,
    );
    expect(screen.getAllByRole('cell').map((cell) => cell.textContent)).toEqual(['18', '42']);
  });

  it('reports a controlled filter without applying it until props change', () => {
    const changes: Array<{ filters: readonly (string | number)[]; rows: number[] }> = [];
    const dataSource = [
      { id: 1, role: 'designer' },
      { id: 2, role: 'developer' },
    ];
    const columns = (values: readonly string[]) => [
      {
        key: 'role',
        title: 'Роль',
        dataIndex: 'role' as const,
        filters: [{ text: 'Дизайнер', value: 'designer' }],
        onFilter: (value: string | number, row: (typeof dataSource)[number]) => row.role === value,
        filteredValue: values,
      },
    ];
    const onChange = (
      _page: unknown,
      filters: Record<string, readonly (string | number)[]>,
      _sorter: unknown,
      extra: { currentDataSource: readonly (typeof dataSource)[number][] },
    ) =>
      changes.push({
        filters: filters.role ?? [],
        rows: extra.currentDataSource.map((row) => row.id),
      });
    const view = render(
      <TableAdapter
        rowKey="id"
        columns={columns([])}
        dataSource={dataSource}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Фильтр Роль' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Дизайнер' }));
    fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
    expect(changes).toEqual([{ filters: ['designer'], rows: [1] }]);
    expect(screen.getAllByRole('cell')).toHaveLength(2);
    view.rerender(
      <TableAdapter
        rowKey="id"
        columns={columns(['designer'])}
        dataSource={dataSource}
        onChange={onChange}
      />,
    );
    expect(screen.getAllByRole('cell')).toHaveLength(1);
  });

  it('reports a controlled page without moving until current changes', () => {
    const changes: number[] = [];
    const dataSource = [
      { id: 1, name: 'Анна' },
      { id: 2, name: 'Марк' },
    ];
    const onChange = (page: { current: number }) => changes.push(page.current);
    const view = render(
      <TableAdapter
        rowKey="id"
        columns={[{ key: 'name', title: 'Имя', dataIndex: 'name' }]}
        dataSource={dataSource}
        pagination={{ current: 1, pageSize: 1 }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
    expect(changes).toEqual([2]);
    expect(screen.getByRole('cell', { name: 'Анна' })).toBeTruthy();
    view.rerender(
      <TableAdapter
        rowKey="id"
        columns={[{ key: 'name', title: 'Имя', dataIndex: 'name' }]}
        dataSource={dataSource}
        pagination={{ current: 2, pageSize: 1 }}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole('cell', { name: 'Марк' })).toBeTruthy();
  });

  it('cycles an interactive sortable column through ascending, descending and original order', () => {
    render(
      <TableAdapter
        aria-label="Возраст"
        rowKey="id"
        columns={[
          { key: 'age', title: 'Возраст', dataIndex: 'age', sorter: (a, b) => a.age - b.age },
        ]}
        dataSource={[
          { id: 1, age: 42 },
          { id: 2, age: 18 },
        ]}
      />,
    );

    const ages = () => screen.getAllByRole('cell').map((cell) => cell.textContent);
    const header = screen.getByRole('columnheader', { name: /Возраст/ });
    const sort = screen.getByRole('button', { name: 'Сортировать Возраст' });
    expect(ages()).toEqual(['42', '18']);
    fireEvent.click(sort);
    expect(ages()).toEqual(['18', '42']);
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    fireEvent.click(sort);
    expect(ages()).toEqual(['42', '18']);
    expect(header.getAttribute('aria-sort')).toBe('descending');
    fireEvent.click(sort);
    expect(ages()).toEqual(['42', '18']);
    expect(header.getAttribute('aria-sort')).toBe('none');
  });

  it('filters rows and restores them when the filter is cleared', () => {
    render(
      <TableAdapter
        aria-label="Команда"
        rowKey="id"
        columns={[
          {
            key: 'role',
            title: 'Роль',
            dataIndex: 'role',
            filters: [{ text: 'Дизайнер', value: 'designer' }],
            onFilter: (value, row) => row.role === (value === 'designer' ? 'Дизайнер' : ''),
          },
        ]}
        dataSource={[
          { id: 1, role: 'Дизайнер' },
          { id: 2, role: 'Разработчик' },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Фильтр Роль' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Дизайнер' }));
    fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
    expect(screen.getAllByRole('cell')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Фильтр Роль' }));
    fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }));
    expect(screen.getAllByRole('cell')).toHaveLength(2);
  });

  it('paginates records and selects rows across pages', () => {
    const changes: unknown[] = [];
    render(
      <TableAdapter
        aria-label="Команда"
        rowKey="id"
        columns={[{ key: 'name', title: 'Имя', dataIndex: 'name' }]}
        dataSource={[
          { id: 1, name: 'Анна' },
          { id: 2, name: 'Марк' },
          { id: 3, name: 'Нина' },
        ]}
        pagination={{ pageSize: 2 }}
        rowSelection={{ onChange: (keys) => changes.push(keys) }}
      />,
    );
    expect(screen.queryByText('Нина')).toBeNull();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Выбрать строку 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
    expect(screen.getByText('Нина')).toBeTruthy();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Выбрать строку 3' }));
    expect(changes).toEqual([[1], [1, 3]]);
  });

  it('exposes sticky header and cumulative offsets for fixed columns', () => {
    render(
      <TableAdapter
        aria-label="Широкая таблица"
        rowKey="id"
        sticky
        scroll={{ x: 700, y: 300 }}
        columns={[
          { key: 'name', title: 'Имя', dataIndex: 'name', width: 120, fixed: 'left' },
          { key: 'age', title: 'Возраст', dataIndex: 'age', width: 80, fixed: 'left' },
          { key: 'city', title: 'Город', dataIndex: 'city', width: 160, fixed: 'right' },
        ]}
        dataSource={[{ id: 1, name: 'Анна', age: 25, city: 'Москва' }]}
      />,
    );
    const table = screen.getByRole('table');
    expect(table.getAttribute('data-sticky')).toBe('true');
    expect(table.parentElement?.getAttribute('data-slot')).toBe('scroll-container');
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]?.getAttribute('data-fixed')).toBe('left');
    expect(headers[1]?.style.left).toBe('120px');
    expect(headers[2]?.getAttribute('data-fixed')).toBe('right');
  });

  it('keeps the selection column before a fixed left column', () => {
    render(
      <TableAdapter
        aria-label="Команда"
        rowKey="id"
        rowSelection={{}}
        scroll={{ x: 500 }}
        columns={[{ key: 'name', title: 'Имя', dataIndex: 'name', width: 120, fixed: 'left' }]}
        dataSource={[{ id: 1, name: 'Анна' }]}
      />,
    );
    expect(
      screen.getByRole('columnheader', { name: 'Выбор строк' }).getAttribute('data-fixed'),
    ).toBe('left');
    expect(screen.getByRole('columnheader', { name: 'Имя' }).style.left).toBe('0px');
  });

  it('renders a configurable empty state', () => {
    render(
      <TableAdapter
        aria-label="Пустая таблица"
        columns={[{ key: 'name', title: 'Имя' }]}
        dataSource={[]}
        locale={{ emptyText: 'Пока никого' }}
      />,
    );
    expect(screen.getByRole('cell', { name: 'Пока никого' })).toBeTruthy();
  });

  it('renders columns and records from a data source', () => {
    render(
      <TableAdapter
        aria-label="Пользователи"
        rowKey="id"
        columns={[
          { key: 'name', title: 'Имя', dataIndex: 'name' },
          {
            key: 'role',
            title: 'Роль',
            dataIndex: 'role',
            render: (value) => <strong>{String(value)}</strong>,
          },
        ]}
        dataSource={[{ id: 1, name: 'Анна', role: 'Редактор' }]}
      />,
    );

    expect(screen.getByRole('table', { name: 'Пользователи' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Имя' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Анна' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Редактор' }).querySelector('strong')).toBeTruthy();
  });

  it('preserves native table semantics, refs and consumer classes', () => {
    const ref = createRef<HTMLTableElement>();
    render(
      <TableAdapter ref={ref} className="custom-table" aria-label="Свойства">
        <TableAdapter.Head>
          <TableAdapter.Row>
            <TableAdapter.HeaderCell scope="col">Имя</TableAdapter.HeaderCell>
          </TableAdapter.Row>
        </TableAdapter.Head>
        <TableAdapter.Body>
          <TableAdapter.Row>
            <TableAdapter.HeaderCell scope="row">size</TableAdapter.HeaderCell>
            <TableAdapter.Cell>compact</TableAdapter.Cell>
          </TableAdapter.Row>
        </TableAdapter.Body>
      </TableAdapter>,
    );

    expect(screen.getByRole('table', { name: 'Свойства' })).toBe(ref.current);
    expect(ref.current?.className).toBe('custom-table');
    expect(screen.getByRole('columnheader', { name: 'Имя' })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'size' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'compact' })).toBeTruthy();
  });
});
