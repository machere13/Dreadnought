import { Table } from '@dreadnought/ui/react';

export function TableSummaryDemo() {
  return (
    <Table
      aria-label="Итоги страницы"
      bordered
      pagination={{ pageSize: 2 }}
      dataSource={[
        { key: 1, item: 'Дизайн', amount: 120 },
        { key: 2, item: 'Разработка', amount: 240 },
        { key: 3, item: 'Тестирование', amount: 80 },
      ]}
      columns={[
        { key: 'item', title: 'Работа', dataIndex: 'item' },
        {
          key: 'amount',
          title: 'Часы',
          dataIndex: 'amount',
          align: 'right',
          sorter: (a, b) => a.amount - b.amount,
        },
      ]}
      summary={(rows) => (
        <Table.Row>
          <Table.HeaderCell scope="row">Итого на странице</Table.HeaderCell>
          <Table.Cell style={{ textAlign: 'right' }}>
            {rows.reduce((sum, row) => sum + row.amount, 0)}
          </Table.Cell>
        </Table.Row>
      )}
    />
  );
}
