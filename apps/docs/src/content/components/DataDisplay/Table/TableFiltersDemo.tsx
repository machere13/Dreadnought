import { Button, Input, Table } from '@dreadnought/ui/react';
import type { TableColumn } from '@dreadnought/ui/react';

const people = [
  { key: 1, name: 'Анна', city: 'Москва', age: 29 },
  { key: 2, name: 'Марк', city: 'Казань', age: 32 },
  { key: 3, name: 'Нина', city: 'Москва', age: 25 },
  { key: 4, name: 'Лев', city: 'Санкт-Петербург', age: 27 },
];
const columns: TableColumn<(typeof people)[number]>[] = [
  { key: 'name', title: 'Участник', dataIndex: 'name' },
  {
    key: 'city',
    title: 'Город',
    dataIndex: 'city',
    filterSearch: true,
    filters: ['Москва', 'Казань', 'Санкт-Петербург'].map((city) => ({ text: city, value: city })),
    onFilter: (value, row) => row.city === value,
  },
  {
    key: 'age',
    title: 'Возраст',
    dataIndex: 'age',
    onFilter: (value, row) => row.age >= Number(value),
    filterDropdown: ({ selectedKeys, setSelectedKeys, confirm, clearFilters }) => (
      <>
        <Input
          type="number"
          aria-label="Минимальный возраст"
          min={0}
          value={String(selectedKeys[0] ?? '')}
          onChange={(event) => setSelectedKeys(event.target.value ? [event.target.value] : [])}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) confirm();
          }}
        />
        <div style={{ display: 'flex', gap: 'var(--dreadnought-spacing-x1)' }}>
          <Button size="compact" variant="secondary" onClick={() => clearFilters()}>
            Сбросить
          </Button>
          <Button size="compact" onClick={() => confirm()}>
            Применить
          </Button>
        </div>
      </>
    ),
  },
];

export function TableFiltersDemo() {
  return (
    <div>
      <Table
        aria-label="Расширенные фильтры"
        bordered
        columns={columns}
        dataSource={people}
        pagination={false}
      />
    </div>
  );
}
