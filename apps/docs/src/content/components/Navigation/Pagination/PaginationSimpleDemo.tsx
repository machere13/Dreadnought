import { useState } from 'react';
import { Pagination } from '@dreadnought/ui/react';

const records = Array.from({ length: 12 }, (_, index) => `Запись ${index + 1}`);
const pageSize = 5;

export function PaginationSimpleDemo() {
  const [current, setCurrent] = useState(1);
  const offset = (current - 1) * pageSize;
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ol aria-label="Записи простого режима" start={offset + 1}>
        {records.slice(offset, offset + pageSize).map((record) => (
          <li key={record}>{record}</li>
        ))}
      </ol>
      <Pagination
        simple
        total={records.length}
        current={current}
        pageSize={pageSize}
        onChange={setCurrent}
      />
    </div>
  );
}
