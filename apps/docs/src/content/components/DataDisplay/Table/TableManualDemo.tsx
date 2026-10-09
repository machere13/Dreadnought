import { useEffect, useState } from 'react';
import { Table } from '@dreadnought/ui/react';
import type { TableColumn } from '@dreadnought/ui/react';

const records = Array.from({ length: 12 }, (_, index) => ({ key: index + 1, name: `Участник ${index + 1}` }));
const columns: TableColumn<typeof records[number]>[] = [{ key: 'name', title: 'Участник', dataIndex: 'name', sorter: true }];

export function TableManualDemo() {
  const [request, setRequest] = useState({ current: 1, order: null as 'ascend' | 'descend' | null });
  const [response, setResponse] = useState({ current: 1, rows: records.slice(0, 3) });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      const sorted = request.order ? [...records].sort((a, b) =>
        a.name.localeCompare(b.name, 'ru', { numeric: true }) * (request.order === 'ascend' ? 1 : -1)) : records;
      setResponse({ current: request.current, rows: sorted.slice((request.current - 1) * 3, request.current * 3) });
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [request]);
  return <section aria-labelledby="table-manual-title">
    <h3 id="table-manual-title">Серверная страница и загрузка</h3>
    <p>Здесь запрос имитируется с задержкой. Таблица получает только три строки и общий счётчик; повторно их не сортирует и не обрезает.</p>
    <Table aria-label="Серверная таблица" processing="manual" loading={loading} bordered
      columns={columns} dataSource={response.rows} pagination={{ current: response.current, pageSize: 3, total: records.length }}
      onChange={(page, _filters, sorter) => { setLoading(true); setRequest({ current: page.current, order: sorter.order }); }} />
    <p>При быстрой смене запроса предыдущий таймер отменяется. В настоящем приложении загрузкой, ошибками и отменой устаревших ответов управляет ваш код.</p>
  </section>;
}
