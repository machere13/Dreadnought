import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from '@dreadnought/ui/react';
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
