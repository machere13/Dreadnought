import { useState } from 'react';
import { Button, Table } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import styles from '../../../../shared/Documentation.module.css';
import { TableManualDemo } from './TableManualDemo.tsx';
import { TableFiltersDemo } from './TableFiltersDemo.tsx';
function TableDemo() {
  const [hideCity, setHideCity] = useState(false);
  return <div className={`${styles.demo} ${styles.demoStack}`}>
    <TableManualDemo />
    <p><code>processing="local"</code> — обработка полного набора данных внутри таблицы. <code>processing="manual"</code> — показ переданной страницы без локальных фильтров, сортировки и обрезки. Для пагинации укажите <code>pagination.total</code>; без пагинации передайте <code>pagination=false</code>. Серверные колонки используют <code>sorter: true</code> или <code>sorter: {'{ multiple: 2 }'}</code>. <code>onChange</code> сообщает запрос, а <code>extra.currentDataSource</code> и <code>summary</code> получают переданные строки. <code>loading</code> использует Loader и не удаляет таблицу или фокус; параметры Loader доступны в <code>slotProps.loader</code>. Выбранные ключи сохраняются между страницами, но <code>rowSelection.onChange</code> возвращает записи только из доступной страницы.</p>
    <p>Для выбора строк нужен уникальный <code>rowKey</code> или <code>record.key</code>: строка либо конечное число.</p>
    <TableFiltersDemo />
    <p>Фильтрация запрашивает страницу 1, сортировка сохраняет страницу. Причина изменения — <code>extra.action</code>.</p>
    <Button variant="secondary" size="compact" onClick={() => setHideCity(!hideCity)}>{hideCity ? 'Показать город' : 'Скрыть город'}</Button>
    <Table<{ key: number; name: string; email: string; city: string }> aria-label="Многоуровневая шапка" bordered sticky scroll={{ x: 700, y: 320 }} pagination={false}
      dataSource={[{ key: 1, name: 'Анна', email: 'anna.very.long.email.address.for.documentation@example.com', city: 'Москва' }, { key: 2, name: 'Марк', email: 'mark@example.com', city: 'Казань' }]}
      columns={[
        { key: 'name', title: 'Участник', dataIndex: 'name', width: 160, fixed: 'left' },
        { key: 'contacts', title: 'Контакты', children: [
          { key: 'email', title: 'Почта', dataIndex: 'email', width: 260, ellipsis: true },
          { key: 'address', title: 'Адрес', children: [{ key: 'city', title: 'Город', dataIndex: 'city', width: 180, align: 'center', hidden: hideCity }] },
        ] },
      ]} />
    <p><code>scroll</code> создаёт контейнер прокрутки, <code>fixed</code> закрепляет колонку. Ширина измеряется автоматически; <code>width</code> задаёт минимум. Для объединённых или скрытых заголовков задайте ширину явно.</p>
    <Table
      aria-label="Пример таблицы"
      rowKey="id"
      dataSource={[{ id: 1, name: 'Борис', role: 'Разработчик' }, { id: 2, name: 'Анна', role: 'Дизайнер' }]}
      columns={[
        { key: 'name', title: 'Имя', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
        { key: 'role', title: 'Роль', dataIndex: 'role' },
      ]}
      pagination={false}
      bordered
    />
    <p>Для нескольких колонок задайте <code>sorter: {'{ compare, multiple }'}</code>: большее <code>multiple</code> означает более высокий приоритет, равные приоритеты следуют порядку колонок. Нажмите «Команда», затем «Участник»: имя уточняет порядок внутри команды. Третье нажатие сбрасывает только выбранную колонку. Обычная функция <code>sorter</code> переключает таблицу обратно на одиночную сортировку. <code>sortOrder</code> управляет состоянием, <code>defaultSortOrder</code> задаёт начальное значение. Управляемая одиночная сортировка имеет приоритет над цепочкой. Третий аргумент <code>onChange</code> остаётся объектом выбранной колонки; полный порядок доступен в <code>extra.sorters</code>, при фильтре и пагинации — тоже.</p>
    <Table<{ key: number; team: string; name: string }> aria-label="Множественная сортировка" bordered pagination={false}
      dataSource={[{ key: 1, team: 'Разработка', name: 'Марк' }, { key: 2, team: 'Дизайн', name: 'Нина' }, { key: 3, team: 'Разработка', name: 'Анна' }, { key: 4, team: 'Дизайн', name: 'Лев' }]}
      columns={[
        { key: 'team', title: 'Команда', dataIndex: 'team', sorter: { compare: (a, b) => a.team.localeCompare(b.team), multiple: 2 } },
        { key: 'name', title: 'Участник', dataIndex: 'name', sorter: { compare: (a, b) => a.name.localeCompare(b.name), multiple: 1 } },
      ]} />
    <p><code>summary(rows)</code> получает строки текущей страницы после фильтрации и сортировки; без пагинации — все подходящие строки. Используйте <code>Table.Row</code> и <code>Table.Cell</code>; <code>tfoot</code> создаётся автоматически. Формулы и <code>colSpan</code> задаёт приложение, <code>null</code> скрывает итог. Итоги прокручиваются с таблицей; закрепление колонок на ручные ячейки не переносится.</p>
    <Table<{ key: number; item: string; amount: number }> aria-label="Итоги страницы" bordered pagination={{ pageSize: 2 }}
      dataSource={[{ key: 1, item: 'Дизайн', amount: 120 }, { key: 2, item: 'Разработка', amount: 240 }, { key: 3, item: 'Тестирование', amount: 80 }]}
      columns={[{ key: 'item', title: 'Работа', dataIndex: 'item' }, { key: 'amount', title: 'Часы', dataIndex: 'amount', align: 'right', sorter: (a, b) => a.amount - b.amount }]}
      summary={rows => <Table.Row><Table.HeaderCell scope="row">Итого на странице</Table.HeaderCell>
        <Table.Cell style={{ textAlign: 'right' }}>{rows.reduce((sum, row) => sum + row.amount, 0)}</Table.Cell>
      </Table.Row>} />
    <Table<{ id: number; name: string; city: string }> aria-label="Раскрываемые строки" bordered rowKey="id" pagination={false}
      dataSource={[{ id: 1, name: 'Анна', city: 'Москва' }, { id: 2, name: 'Марк', city: 'Казань' }]}
      columns={[{ key: 'name', title: 'Участник', dataIndex: 'name' }]}
      expandable={{ defaultExpandedRowKeys: [1], expandedRowRender: record => <p>Город: {record.city}</p> }} />
    <p><code>rowSpan/colSpan=0</code> скрывает ячейку. Остальные значения объединяют её. Приложение пересчитывает spans при изменении порядка строк; не объединяйте ячейки через границу закреплённых областей.</p>
    <Table<{ id: number; team: string; name: string }> aria-label="Объединённые ячейки" rowKey="id" pagination={false} bordered
      dataSource={[{ id: 1, team: 'Дизайн', name: 'Анна' }, { id: 2, team: 'Дизайн', name: 'Нина' }, { id: 3, team: 'Разработка', name: 'Марк' }]}
      onRow={record => ({ title: `Участник: ${record.name}` })}
      columns={[
        { key: 'team', title: 'Команда', dataIndex: 'team', onCell: (_record, index) => ({ rowSpan: index === 0 ? 2 : index === 1 ? 0 : 1 }) },
        { key: 'name', title: 'Участник', dataIndex: 'name', onHeaderCell: () => ({ title: 'Имя участника' }) },
      ]} />
  </div>;
}

const tableDoc: ComponentDoc = {
  ...getCatalogDoc('table'),
    title: 'Table',
    description: 'Структурированные данные с группами колонок, сортировкой, фильтрами, выбором и раскрытием строк, пагинацией и закреплением шапки.',
    adapterDescription: 'Адаптер сохраняет семантику и поведение таблицы, но позволяет оформить её самостоятельно.',
    logicDescription: 'Ядро рассчитывает уровни и объединения шапки, сортирует и фильтрует строки — независимо от фреймворка.',
    footnote: <>Обработчики строк и ячеек возвращают нативные свойства, события и ref. Индекс строки относится к текущей странице. Содержимое задавайте через <code>render/title</code>; геометрия и <code>aria-sort</code> сохраняются.</>,
    demo: <TableDemo />,
  };

export function TablePage() {
  return <ComponentPage component="table" doc={tableDoc} />;
}
