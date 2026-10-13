import { Table } from '@dreadnought/ui/react';

export function TableExpandDemo() {
  return (
    <Table
      aria-label="Раскрываемые строки"
      bordered
      rowKey="id"
      pagination={false}
      dataSource={[
        { id: 1, name: 'Анна', city: 'Москва' },
        { id: 2, name: 'Марк', city: 'Казань' },
      ]}
      columns={[{ key: 'name', title: 'Участник', dataIndex: 'name' }]}
      expandable={{
        defaultExpandedRowKeys: [1],
        expandedRowRender: (record) => <p>Город: {record.city}</p>,
      }}
    />
  );
}
