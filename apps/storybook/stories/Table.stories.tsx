import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Table } from '@dreadnought/ui/react';
import { TableAdapter } from '@dreadnought/react/unstyled';
import { useState } from 'react';

const meta = {
  title: 'DataDisplay/Table',
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Table {...args} aria-label="Свойства кнопки">
    <Table.Head><Table.Row><Table.HeaderCell scope="col">Свойство</Table.HeaderCell><Table.HeaderCell scope="col">Тип</Table.HeaderCell><Table.HeaderCell scope="col">По умолчанию</Table.HeaderCell></Table.Row></Table.Head>
    <Table.Body>
      <Table.Row><Table.HeaderCell scope="row">variant</Table.HeaderCell><Table.Cell>primary | secondary</Table.Cell><Table.Cell>primary</Table.Cell></Table.Row>
      <Table.Row><Table.HeaderCell scope="row">disabled</Table.HeaderCell><Table.Cell>boolean</Table.Cell><Table.Cell>false</Table.Cell></Table.Row>
    </Table.Body>
  </Table>,
};

export const Bordered: Story = {
  ...Default,
  args: { bordered: true },
};

export const Compact: Story = {
  ...Default,
  args: { size: 'small' },
};

export const DataSource: Story = {
  render: () => <Table
    aria-label="Команда"
    rowKey="id"
    columns={[
      { key: 'name', title: 'Имя', dataIndex: 'name' },
      { key: 'role', title: 'Роль', dataIndex: 'role' },
      { key: 'status', title: 'Статус', dataIndex: 'status' },
    ]}
    dataSource={[
      { id: 1, name: 'Анна', role: 'Дизайнер', status: 'Активна' },
      { id: 2, name: 'Марк', role: 'Разработчик', status: 'Активен' },
      { id: 3, name: 'Нина', role: 'Редактор', status: 'В отпуске' },
    ]}
  />,
};

const people = [
  { id: 1, name: 'Анна', role: 'Дизайнер', age: 29, city: 'Москва' },
  { id: 2, name: 'Марк', role: 'Разработчик', age: 32, city: 'Казань' },
  { id: 3, name: 'Нина', role: 'Дизайнер', age: 25, city: 'Санкт-Петербург' },
  { id: 4, name: 'Лев', role: 'Разработчик', age: 27, city: 'Москва' },
  { id: 5, name: 'Ира', role: 'Редактор', age: 34, city: 'Екатеринбург' },
];

export const Interactive: Story = {
  render: () => <Table<(typeof people)[number]>
    aria-label="Команда"
    rowKey="id"
    bordered
    sticky
    scroll={{ x: 800, y: 220 }}
    pagination={{ pageSize: 3 }}
    rowSelection={{ defaultSelectedRowKeys: [1], getCheckboxProps: row => ({ disabled: row.id === 5 }) }}
    columns={[
      { key: 'name', title: 'Имя', dataIndex: 'name', width: 180, fixed: 'left' },
      { key: 'role', title: 'Роль', dataIndex: 'role', width: 190, filters: [{ text: 'Дизайнер', value: 'Дизайнер' }, { text: 'Разработчик', value: 'Разработчик' }], onFilter: (value, row) => row.role === value },
      { key: 'age', title: 'Возраст', dataIndex: 'age', width: 130, sorter: (a, b) => a.age - b.age },
      { key: 'city', title: 'Город', dataIndex: 'city', width: 220, fixed: 'right' },
    ]}
    dataSource={people}
  />,
};

export const RadioSelection: Story = {
  render: () => <>{['Первая команда', 'Вторая команда'].map(name => <section key={name}>
    <h3>{name}</h3>
    <Table aria-label={name} rowKey="id" dataSource={people} rowSelection={{ type: 'radio' }} pagination={false}
      columns={[
        { key: 'name', title: 'Имя', dataIndex: 'name' },
        { key: 'role', title: 'Роль', dataIndex: 'role', filterMultiple: false,
          filters: [{ text: 'Дизайнер', value: 'Дизайнер' }, { text: 'Разработчик', value: 'Разработчик' }],
          onFilter: (value, row) => row.role === value },
      ]} />
  </section>)}</>,
};

function StickyWidthsExample() {
  const [narrow, setNarrow] = useState(false);
  const columns = [
    { key: 'name', title: 'Имя', dataIndex: 'name' as const, fixed: 'left' as const },
    { key: 'role', title: 'Роль', dataIndex: 'role' as const, fixed: 'left' as const },
    { key: 'age', title: 'Возраст', dataIndex: 'age' as const, width: 80 },
    { key: 'city', title: 'Город', dataIndex: 'city' as const, fixed: 'right' as const },
  ];
  return <>
    <button onClick={() => setNarrow(!narrow)}>Изменить ширину контейнера</button>
    <section style={{ width: narrow ? 640 : 900, maxWidth: '100%' }}>
      <h3>Закреплённые колонки без заданной ширины</h3>
      <Table aria-label="Измеряемая таблица" rowKey="id" columns={columns} dataSource={people}
        rowSelection={{}} sticky scroll={{ x: 700, y: 160 }} pagination={{ pageSize: 4 }} />
      <h3>Адаптер без оформления</h3>
      <TableAdapter aria-label="Неоформленная таблица" rowKey="id" columns={columns} dataSource={people}
        rowSelection={{}} sticky scroll={{ x: 700, y: 160 }} pagination={{ pageSize: 4 }} />
    </section>
  </>;
}

export const StickyWidths: Story = { render: () => <StickyWidthsExample /> };
export const MergedCells: Story = { render: () => <Table<{ id: number; team: string; name: string }> aria-label="Участники команд" bordered pagination={false}
  rowKey="id" dataSource={[{ id: 1, team: 'Дизайн', name: 'Анна' }, { id: 2, team: 'Дизайн', name: 'Нина' }, { id: 3, team: 'Разработка', name: 'Марк' }]}
  onRow={record => ({ title: `Участник: ${record.name}` })}
  columns={[
    { key: 'team', title: 'Команда', dataIndex: 'team', onCell: (_record, index) => ({ rowSpan: index === 0 ? 2 : index === 1 ? 0 : 1 }) },
    { key: 'name', title: 'Участник', dataIndex: 'name', onHeaderCell: () => ({ title: 'Имя участника' }) },
  ]} /> };

export const ExpandableRows: Story = { render: () => <Table<(typeof people)[number]> aria-label="Подробности участников"
  rowKey="id" dataSource={people} rowSelection={{}} sticky scroll={{ x: 700, y: 320 }} pagination={{ pageSize: 3 }}
  columns={[{ key: 'name', title: 'Имя', dataIndex: 'name', fixed: 'left', width: 180 },
    { key: 'role', title: 'Роль', dataIndex: 'role', width: 260 }]}
  expandable={{ defaultExpandedRowKeys: [1], rowExpandable: record => record.id !== 5,
    expandedRowRender: record => <p>{record.name}: {record.age} лет, {record.city}</p> }} /> };

export const GroupedHeaders: Story = { render: () => <Table<(typeof people)[number]> aria-label="Группы колонок"
  bordered sticky scroll={{ x: 900, y: 260 }} rowKey="id" dataSource={people} pagination={false} rowSelection={{}}
  expandable={{ expandedRowRender: record => <p>{record.name} — {record.role}</p> }}
  columns={[
    { key: 'person', title: 'Участник', fixed: 'left', children: [
      { key: 'name', title: 'Имя', dataIndex: 'name', width: 160 },
      { key: 'age', title: 'Возраст', dataIndex: 'age', width: 100, sorter: (a, b) => a.age - b.age },
    ] },
    { key: 'work', title: 'Работа', children: [
      { key: 'role', title: 'Роль', dataIndex: 'role', width: 240 },
      { key: 'location', title: 'Местоположение', children: [{ key: 'city', title: 'Город', dataIndex: 'city', width: 260 }] },
    ] },
  ]} /> };

function ColumnDisplayExample() {
  const [hidden, setHidden] = useState(false);
  return <>
    <Button size="compact" variant="secondary" onClick={() => setHidden(!hidden)}>{hidden ? 'Показать город' : 'Скрыть город'}</Button>
    <Table<(typeof people)[number]> aria-label="Отображение колонок" bordered pagination={false} dataSource={people}
      columns={[
        { key: 'person', title: 'Участник', children: [
          { key: 'name', title: 'Имя', dataIndex: 'name', width: 120 },
          { key: 'age', title: 'Возраст', dataIndex: 'age', width: 100, align: 'right' },
        ] },
        { key: 'role', title: 'Роль', dataIndex: 'role', width: 160, align: 'center' },
        { key: 'address', title: 'Адрес', children: [{ key: 'city', title: 'Город', dataIndex: 'city', width: 140, ellipsis: true, hidden }] },
      ]} />
  </>;
}
export const ColumnDisplay: Story = { render: () => <ColumnDisplayExample /> };

export const Summary: Story = { render: () => <Table<(typeof people)[number]> aria-label="Итоги страницы" bordered
  rowKey="id" dataSource={people} pagination={{ pageSize: 2 }}
  columns={[{ key: 'name', title: 'Участник', dataIndex: 'name' }, { key: 'age', title: 'Возраст', dataIndex: 'age', align: 'right', sorter: (a, b) => a.age - b.age }]}
  summary={rows => <Table.Row><Table.HeaderCell scope="row">Средний возраст на странице</Table.HeaderCell>
    <Table.Cell style={{ textAlign: 'right' }}>{rows.length ? (rows.reduce((sum, row) => sum + row.age, 0) / rows.length).toFixed(1) : '—'}</Table.Cell>
  </Table.Row>} /> };

export const MultipleSorters: Story = { render: () => <Table<(typeof people)[number]> aria-label="Множественная сортировка" bordered
  rowKey="id" dataSource={people} pagination={false}
  columns={[
    { key: 'role', title: 'Роль', dataIndex: 'role', defaultSortOrder: 'ascend', sorter: { compare: (a, b) => a.role.localeCompare(b.role), multiple: 2 } },
    { key: 'age', title: 'Возраст', dataIndex: 'age', defaultSortOrder: 'ascend', sorter: { compare: (a, b) => a.age - b.age, multiple: 1 } },
    { key: 'name', title: 'Имя', dataIndex: 'name' },
  ]} /> };

function ManualPageExample() {
  const [current, setCurrent] = useState(2);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<'ascend' | 'descend' | null>(null);
  const sorted = order ? [...people].sort((a, b) => (a.age - b.age) * (order === 'ascend' ? 1 : -1)) : people;
  return <>
    <Button variant="secondary" size="compact" onClick={() => setLoading(!loading)}>Переключить загрузку</Button>
    <p>Приложение передаёт только текущую страницу. Сортировка и обрезка в этом примере выполняются снаружи таблицы.</p>
    <Table processing="manual" aria-label="Серверная страница" bordered loading={loading}
      rowKey="id" dataSource={sorted.slice((current - 1) * 2, current * 2)}
      columns={[{ key: 'name', title: 'Участник', dataIndex: 'name' }, { key: 'age', title: 'Возраст', dataIndex: 'age', sorter: true }]}
      pagination={{ current, pageSize: 2, total: people.length }}
      onChange={(page, _filters, sorter) => { setCurrent(page.current); setOrder(sorter.order); }} />
  </>;
}
export const ManualPage: Story = { render: () => <ManualPageExample /> };
