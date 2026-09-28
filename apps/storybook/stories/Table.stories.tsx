import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from '@dreadnought/ui/react';

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
    rowSelection={{}}
    columns={[
      { key: 'name', title: 'Имя', dataIndex: 'name', width: 180, fixed: 'left' },
      { key: 'role', title: 'Роль', dataIndex: 'role', width: 190, filters: [{ text: 'Дизайнер', value: 'Дизайнер' }, { text: 'Разработчик', value: 'Разработчик' }], onFilter: (value, row) => row.role === value },
      { key: 'age', title: 'Возраст', dataIndex: 'age', width: 130, sorter: (a, b) => a.age - b.age },
      { key: 'city', title: 'Город', dataIndex: 'city', width: 220, fixed: 'right' },
    ]}
    dataSource={people}
  />,
};
