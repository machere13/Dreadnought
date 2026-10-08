import { createRef } from 'react';
import { Table, type TableColumn, type TableExpandable } from '@dreadnought/ui/react';
type Person = { id: number; name: string };
const columns: readonly TableColumn<Person>[] = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    onCell: (record, index) => ({
      ref: createRef<HTMLTableCellElement>(),
      rowSpan: index === 0 ? 2 : 0,
      title: record.name,
    }),
    onHeaderCell: (column, index) => ({ title: `${column.key}:${index}`, colSpan: 2 }),
  },
];
const expandable: TableExpandable<Person> = {
  expandedRowRender: (record) => record.name,
  expandedRowKeys: [1],
  rowExpandable: (record) => record.id > 0,
  onExpand: (open, record) => {
    void open;
    void record.id;
  },
  onExpandedRowsChange: (keys) => {
    void keys;
  },
  expandIcon: (expanded) => (expanded ? 'Close' : 'Open'),
};
const example = (
  <Table<Person>
    expandable={expandable}
    columns={columns}
    dataSource={[{ id: 1, name: 'Anna' }]}
    rowKey="id"
    onRow={(record, index) => ({
      ref: createRef<HTMLTableRowElement>(),
      title: `${record.id}:${index}`,
    })}
    onHeaderRow={(columns, index) => ({ title: `${columns.length}:${index}` })}
    summary={(rows) => (
      <Table.Row>
        <Table.Cell colSpan={2}>{rows.map((row) => row.name).join(', ')}</Table.Cell>
      </Table.Row>
    )}
  />
);
void example;
void (
  <Table<Person>
    dataSource={[{ id: 1, name: 'Anna' }]}
    columns={[
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        filterSearch: (input, option) => option.text.includes(input),
        filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters, close }) => (
          <button
            onClick={() => {
              setSelectedKeys(['Anna']);
              confirm({ closeDropdown: false });
              clearFilters({ confirm: false, closeDropdown: false });
              close();
            }}
          >
            {selectedKeys.join(',')}
          </button>
        ),
        onFilter: (value, record) => record.name === value,
      },
    ]}
    slotProps={{
      filter: {
        renderSearch: (props) => <input {...props} />,
        renderButton: (props) => <button {...props} />,
        icon: 'Filter',
      },
    }}
  />
);
void (
  <Table<Person>
    processing="manual"
    loading
    dataSource={[{ id: 3, name: 'Anna' }]}
    rowKey="id"
    pagination={{ current: 2, pageSize: 2, total: 10 }}
    slotProps={{ loader: { label: 'Loading', indicator: '…', showLabel: true } }}
    columns={[
      { key: 'name', title: 'Name', sorter: true },
      { key: 'id', title: 'ID', sorter: { multiple: 2 } },
    ]}
  />
);
const grouped: readonly TableColumn<Person>[] = [
  {
    key: 'person',
    title: 'Person',
    children: [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        key: 'id',
        title: 'ID',
        dataIndex: 'id',
        hidden: false,
        align: 'right',
        ellipsis: true,
        onCell: (person) => ({ title: String(person.id) }),
      },
    ],
  },
];
void (
  <Table<Person>
    columns={grouped}
    dataSource={[{ id: 1, name: 'Anna' }]}
    rowKey="id"
    slotProps={{ tooltip: { openDelay: 0, placement: 'bottom' } }}
  />
);
void (
  <Table<Person>
    columns={[
      {
        key: 'name',
        title: 'Name',
        sorter: { compare: (a, b) => a.name.localeCompare(b.name), multiple: 2 },
      },
      { key: 'id', title: 'ID', sorter: { compare: (a, b) => a.id - b.id, multiple: 1 } },
    ]}
    dataSource={[{ id: 1, name: 'Anna' }]}
    onChange={(_page, _filters, sorter, extra) => {
      const key: string | undefined = sorter.columnKey;
      const orders: readonly ('ascend' | 'descend' | null)[] = extra.sorters.map(
        (item) => item.order,
      );
      void key;
      void orders;
    }}
  />
);
