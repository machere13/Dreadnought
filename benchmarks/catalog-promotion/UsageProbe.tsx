import { useState } from 'react';
import { Badge, Button, Card, Input, Table, Tabs } from '@dreadnought/ui/react';

export function UsageProbe() {
  const [section, setSection] = useState('overview');
  const [period, setPeriod] = useState('current');

  return (
    <Card>
      <h2>Проверка компонентов</h2>
      <Badge appearance="ghosted">Пример</Badge>
      <Tabs value={section} onValueChange={setSection}>
        <Tabs.List aria-label="Разделы">
          <Tabs.Tab value="overview">Обзор</Tabs.Tab>
          <Tabs.Tab value="details">Подробности</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview">Обзор примера</Tabs.Panel>
        <Tabs.Panel value="details">Подробности примера</Tabs.Panel>
      </Tabs>
      <Tabs value={period} onValueChange={setPeriod}>
        <Tabs.List aria-label="Период">
          <Tabs.Tab value="current">Текущий</Tabs.Tab>
          <Tabs.Tab value="previous">Предыдущий</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="current">Текущий период</Tabs.Panel>
        <Tabs.Panel value="previous">Предыдущий период</Tabs.Panel>
      </Tabs>
      <form>
        <label>
          Имя
          <Input name="name" type="text" required />
        </label>
        <Button type="submit">Отправить</Button>
      </form>
      <Table
        rowKey="id"
        pagination={false}
        dataSource={[{ id: 1, name: 'Анна' }]}
        columns={[
          { key: 'id', title: 'Номер', dataIndex: 'id' },
          {
            key: 'name',
            title: 'Имя',
            dataIndex: 'name',
            render: (_value, record) => <strong>{record.name}</strong>,
          },
        ]}
      />
    </Card>
  );
}
