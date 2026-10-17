import { Table } from '@dreadnought/ui/react';

const records = Array.from({ length: 12 }, (_, key) => ({ key, name: `Запись ${key + 1}` }));

export function PaginationTableDemo() {
  return (
    <Table
      bordered
      columns={[{ key: 'name', title: 'Имя', dataIndex: 'name' }]}
      dataSource={records}
      pagination={{
        defaultPageSize: 5,
        pageSizeOptions: [5, 10, 20],
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: true,
      }}
    />
  );
}
