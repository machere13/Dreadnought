import { useState } from 'react';
import { Pagination } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

function PaginationDemo() {
  const [current, setCurrent] = useState(3);
  return <div className={`${styles.demo} ${styles.fieldDemo}`}>
    <Pagination total={200} current={current} onChange={setCurrent} />
    <Pagination total={200} simple defaultCurrent={3} />
  </div>;
}

export const paginationDoc: ComponentDoc = {
  ...getCatalogDoc('pagination'), title: 'Pagination',
  description: 'Переключает страницы любого списка. Данными и загрузкой управляет приложение.',
  adapterDescription: 'Доступный nav и нативные кнопки без темы; полный и простой режимы.',
  logicDescription: <>Core возвращает ограниченное окно номеров, offset/end и доступные переходы. usePagination добавляет владение состоянием React.</>,
  demo: <PaginationDemo />,
  footnote: <>onChange получает страницу и pageSize. current делает компонент управляемым; defaultCurrent задаёт начальную страницу. В Table смена pageSize сбрасывает страницу на первую; самостоятельная Pagination сохраняет допустимую страницу. Некорректные числа вызывают RangeError.</>,
};
