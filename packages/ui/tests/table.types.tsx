import { createRef } from 'react';
import { Table, type TableColumn, type TableExpandable } from '@dreadnought/ui/react';
type Person = { id: number; name: string };
const columns: readonly TableColumn<Person>[] = [{ key: 'name', title: 'Name', dataIndex: 'name',
  onCell: (record, index) => ({ ref: createRef<HTMLTableCellElement>(), rowSpan: index === 0 ? 2 : 0, title: record.name }),
  onHeaderCell: (column, index) => ({ title: `${column.key}:${index}`, colSpan: 2 }),
}];
const expandable: TableExpandable<Person> = { expandedRowRender: record => record.name, expandedRowKeys: [1],
  rowExpandable: record => record.id > 0, onExpand: (open, record) => { void open; void record.id; },
  onExpandedRowsChange: keys => { void keys; }, expandIcon: expanded => expanded ? 'Close' : 'Open' };
const example = <Table<Person> expandable={expandable} columns={columns} dataSource={[{ id: 1, name: 'Anna' }]} rowKey="id"
  onRow={(record, index) => ({ ref: createRef<HTMLTableRowElement>(), title: `${record.id}:${index}` })}
  onHeaderRow={(columns, index) => ({ title: `${columns.length}:${index}` })} />;
void example;
const grouped: readonly TableColumn<Person>[] = [{ key: 'person', title: 'Person', children: [
  { key: 'name', title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { key: 'id', title: 'ID', dataIndex: 'id', onCell: person => ({ title: String(person.id) }) },
] }];
void <Table<Person> columns={grouped} dataSource={[{ id: 1, name: 'Anna' }]} rowKey="id" />;
