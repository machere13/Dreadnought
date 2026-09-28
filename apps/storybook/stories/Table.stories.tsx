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
