import { Table } from '@dreadnought/ui/react';

export function TableSortDemo() {
  return (
    <Table
      aria-label="Множественная сортировка"
      bordered
      pagination={false}
      dataSource={[
        { key: 1, team: 'Разработка', name: 'Марк' },
        { key: 2, team: 'Дизайн', name: 'Нина' },
        { key: 3, team: 'Разработка', name: 'Анна' },
        { key: 4, team: 'Дизайн', name: 'Лев' },
      ]}
      columns={[
        {
          key: 'team',
          title: 'Команда',
          dataIndex: 'team',
          sorter: { compare: (a, b) => a.team.localeCompare(b.team, 'ru'), multiple: 2 },
        },
        {
          key: 'name',
          title: 'Участник',
          dataIndex: 'name',
          sorter: { compare: (a, b) => a.name.localeCompare(b.name, 'ru'), multiple: 1 },
        },
      ]}
    />
  );
}
