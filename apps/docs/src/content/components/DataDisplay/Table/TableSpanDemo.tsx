import { Table } from '@dreadnought/ui/react';

type Member = { id: number; team: string; name: string };

export function TableSpanDemo() {
  return (
    <Table<Member>
      aria-label="Объединённые ячейки"
      rowKey="id"
      pagination={false}
      bordered
      dataSource={[
        { id: 1, team: 'Дизайн', name: 'Анна' },
        { id: 2, team: 'Дизайн', name: 'Нина' },
        { id: 3, team: 'Разработка', name: 'Марк' },
      ]}
      onRow={(record) => ({ title: `Участник: ${record.name}` })}
      columns={[
        {
          key: 'team',
          title: 'Команда',
          dataIndex: 'team',
          onCell: (_record, index) => ({ rowSpan: index === 0 ? 2 : index === 1 ? 0 : 1 }),
        },
        {
          key: 'name',
          title: 'Участник',
          dataIndex: 'name',
          onHeaderCell: () => ({ title: 'Имя участника' }),
        },
      ]}
    />
  );
}
