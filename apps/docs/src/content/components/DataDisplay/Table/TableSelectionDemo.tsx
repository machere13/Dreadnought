import { useState } from 'react';
import { Table } from '@dreadnought/ui/react';

const people = [
  { key: 1, name: 'Анна', city: 'Москва' },
  { key: 2, name: 'Марк', city: 'Казань' },
  { key: 3, name: 'Нина', city: 'Москва' },
];

export function TableSelectionDemo() {
  const [selected, setSelected] = useState<(string | number)[]>([1]);
  return (
    <div>
      <Table
        aria-label="Выбор участников"
        bordered
        pagination={false}
        scroll={{ x: 600 }}
        dataSource={people}
        columns={[
          { key: 'name', title: 'Участник', dataIndex: 'name', fixed: 'left', width: 200 },
          { key: 'city', title: 'Город', dataIndex: 'city', width: 400 },
        ]}
        rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
      />
      <p role="status">
        Выбраны:{' '}
        {people
          .filter((person) => selected.includes(person.key))
          .map((person) => person.name)
          .join(', ') || 'никого'}
      </p>
    </div>
  );
}
