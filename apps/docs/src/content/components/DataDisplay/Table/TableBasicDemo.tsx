import { Table } from '@dreadnought/ui/react';

export function TableBasicDemo() {
  return (
    <Table
      aria-label="Пример таблицы"
      rowKey="id"
      dataSource={[
        { id: 1, name: 'Борис', role: 'Разработчик' },
        { id: 2, name: 'Анна', role: 'Дизайнер' },
      ]}
      columns={[
        {
          key: 'name',
          title: 'Имя',
          dataIndex: 'name',
          sorter: (a, b) => a.name.localeCompare(b.name, 'ru'),
        },
        { key: 'role', title: 'Роль', dataIndex: 'role' },
      ]}
      pagination={false}
      bordered
    />
  );
}
