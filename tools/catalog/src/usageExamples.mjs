// Agent-facing examples, type-checked during catalog generation. No screen logic.
export const usageExamples = {
  Input: `import { Input } from '@dreadnought/ui/react';
const example = <Input type="text" aria-label="Имя" name="name" required />;`,
  Tabs: `import { useState } from 'react';
import { Tabs } from '@dreadnought/ui/react';
export function Example() {
  const [value, setValue] = useState('first');
  return <Tabs value={value} onValueChange={setValue}>
    <Tabs.List aria-label="Разделы">
      <Tabs.Tab value="first">Первый</Tabs.Tab>
      <Tabs.Tab value="second">Второй</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="first">Первый раздел</Tabs.Panel>
    <Tabs.Panel value="second">Второй раздел</Tabs.Panel>
  </Tabs>;
}`,
  Table: `import { Table } from '@dreadnought/ui/react';
const example = <Table rowKey="id" pagination={false}
  locale={{ emptyText: 'Нет данных' }}
  dataSource={[{ id: 1, name: 'Анна' }]}
  columns={[{ key: 'name', title: 'Имя', dataIndex: 'name',
    render: (_value, record) => <strong>{record.name}</strong> }]} />;`,
};
