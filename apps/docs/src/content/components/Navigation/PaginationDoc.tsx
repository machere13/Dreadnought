import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { useState } from 'react';
import { Pagination, Table } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import styles from '../../../shared/Documentation.module.css';

function PaginationDemo() {
  const [current, setCurrent] = useState(3);
  const [pageSize, setPageSize] = useState(20);
  return (
    <div className={`${styles.demo} ${styles.fieldDemo}`}>
      <Pagination
        total={240}
        current={current}
        pageSize={pageSize}
        showSizeChanger
        showQuickJumper
        showTotal
        onChange={(page, size) => {
          setCurrent(page);
          setPageSize(size);
        }}
      />
      <Pagination total={200} simple defaultCurrent={3} />
      <Table
        columns={[{ key: 'name', title: 'Имя', dataIndex: 'name' }]}
        dataSource={Array.from({ length: 12 }, (_, key) => ({ key, name: `Запись ${key + 1}` }))}
        pagination={{
          defaultPageSize: 5,
          pageSizeOptions: [5, 10, 20],
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: true,
        }}
      />
    </div>
  );
}

export const paginationDoc: ComponentDoc = {
  ...getCatalogDoc('pagination'),
  title: 'Pagination',
  description: 'Переключает страницы любого списка. Данными и загрузкой управляет приложение.',
  adapterDescription: 'Доступный nav, кнопки, Select и Input без темы; полный и простой режимы.',
  logicDescription: (
    <>
      Core возвращает ограниченное окно номеров, offset/end и доступные переходы. usePagination
      добавляет владение состоянием React.
    </>
  ),
  demo: <PaginationDemo />,
  footnote: (
    <>
      onChange(page, pageSize) вызывается один раз на действие. current и pageSize управляются
      независимо; defaultCurrent и defaultPageSize задают начальные значения. Выбор нового размера
      запрашивает страницу 1. Быстрый переход применяется по Enter. Те же настройки доступны в
      Table.pagination.
    </>
  ),
};

export function PaginationPage() {
  return <ComponentPage component="pagination" doc={paginationDoc} />;
}
