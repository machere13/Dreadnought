import { createRef } from 'react';
import { Table, type TableColumn } from '@dreadnought/ui/react';
type Person = { id: number; name: string };
const columns: readonly TableColumn<Person>[] = [{ key: 'name', title: 'Name', dataIndex: 'name',
  onCell: (record, index) => ({ ref: createRef<HTMLTableCellElement>(), rowSpan: index === 0 ? 2 : 0, title: record.name }),
  onHeaderCell: (column, index) => ({ title: `${column.key}:${index}`, colSpan: 2 }),
}];
const example = <Table<Person> columns={columns} dataSource={[{ id: 1, name: 'Anna' }]} rowKey="id"
  onRow={(record, index) => ({ ref: createRef<HTMLTableRowElement>(), title: `${record.id}:${index}` })}
  onHeaderRow={(columns, index) => ({ title: `${columns.length}:${index}` })} />;
void example;
