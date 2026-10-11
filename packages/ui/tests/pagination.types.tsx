import { createRef } from 'react';
import { Pagination, Table, Input, type PaginationProps } from '@dreadnought/ui/react';
import { usePagination } from '@dreadnought/react/logic';

const props: PaginationProps = { total: 50, simple: true, ref: createRef<HTMLElement>() };
const example = (
  <Pagination
    {...props}
    defaultPageSize={20}
    showSizeChanger
    pageSizeOptions={[10, 20, 50]}
    showQuickJumper
    showTotal={(total, [start, end]) => `${start}–${end} / ${total}`}
    slotProps={{ renderQuickJumper: (inputProps) => <Input {...inputProps} /> }}
    onChange={(page, size) => {
      void [page, size];
    }}
  />
);
void example;
function LogicExample() {
  const pagination = usePagination({ total: 50, defaultPageSize: 20 });
  pagination.changePageSize(10);
  return null;
}
const table = (
  <Table
    columns={[{ key: 'name', title: 'Name', dataIndex: 'name' }]}
    dataSource={[{ key: 1, name: 'Anna' }]}
    pagination={{
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: [5, 10],
      showTotal: true,
    }}
  />
);
void [LogicExample, table];
