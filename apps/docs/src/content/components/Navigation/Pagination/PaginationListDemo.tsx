import { useState } from 'react';
import { Pagination } from '@dreadnought/ui/react';

const records = Array.from({ length: 120 }, (_, index) => `Запись ${index + 1}`);

export function PaginationListDemo() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const offset = (current - 1) * pageSize;
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <ol aria-label="Записи текущей страницы" start={offset + 1}>
        {records.slice(offset, offset + pageSize).map((record) => (
          <li key={record}>{record}</li>
        ))}
      </ol>
      <Pagination
        total={records.length}
        current={current}
        pageSize={pageSize}
        showSizeChanger
        pageSizeOptions={[5, 10, 20]}
        showQuickJumper
        showTotal
        onChange={(page, size) => {
          setCurrent(page);
          setPageSize(size);
        }}
      />
    </div>
  );
}
