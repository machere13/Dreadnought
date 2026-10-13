import { useState } from 'react';
import { Button, Table } from '@dreadnought/ui/react';

const people = Array.from({ length: 12 }, (_, index) => ({
  key: index + 1,
  name: `Участник ${index + 1}`,
  email: `participant.${index + 1}.long.address@example.com`,
  city: index % 2 ? 'Казань' : 'Москва',
}));

export function TableLayoutDemo() {
  const [hideCity, setHideCity] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
      <div>
        <Button variant="secondary" size="compact" onClick={() => setHideCity(!hideCity)}>
          {hideCity ? 'Показать город' : 'Скрыть город'}
        </Button>
      </div>
      <Table
        aria-label="Многоуровневая шапка"
        bordered
        sticky
        scroll={{ x: 700, y: 240 }}
        pagination={false}
        dataSource={people}
        columns={[
          { key: 'name', title: 'Участник', dataIndex: 'name', width: 160, fixed: 'left' },
          {
            key: 'contacts',
            title: 'Контакты',
            children: [
              { key: 'email', title: 'Почта', dataIndex: 'email', width: 260, ellipsis: true },
              {
                key: 'address',
                title: 'Адрес',
                children: [
                  {
                    key: 'city',
                    title: 'Город',
                    dataIndex: 'city',
                    width: 180,
                    align: 'center',
                    hidden: hideCity,
                  },
                ],
              },
            ],
          },
        ]}
      />
    </div>
  );
}
