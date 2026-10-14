import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { PaginationListDemo } from './PaginationListDemo.tsx';
import listCode from './PaginationListDemo.tsx?raw';
import { PaginationSimpleDemo } from './PaginationSimpleDemo.tsx';
import simpleCode from './PaginationSimpleDemo.tsx?raw';
import { PaginationTableDemo } from './PaginationTableDemo.tsx';
import tableCode from './PaginationTableDemo.tsx?raw';

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
  examples: [
    {
      id: 'pagination-list',
      title: 'Страницы реального списка',
      description:
        'Переключите страницу: изменятся записи выше. Pagination сообщает current и pageSize, а приложение само выбирает часть массива через slice. Размер страницы выбирается в списке; быстрый переход применяется по Enter. Новый размер возвращает на страницу 1. Все 120 записей уже в памяти, сетевых запросов нет.',
      demo: <PaginationListDemo />,
      code: listCode,
    },
    {
      id: 'pagination-simple',
      title: 'Простой режим и последняя страница',
      description:
        'simple оставляет компактное управление без ряда номеров. Перейдите вперёд дважды: из 12 записей по 5 на странице в конце останутся только записи 11 и 12. Дальше перейти нельзя. Выбор отображаемых записей по-прежнему делает приложение.',
      demo: <PaginationSimpleDemo />,
      code: simpleCode,
    },
    {
      id: 'pagination-table',
      title: 'Пагинация внутри Table',
      description:
        'Передайте полный массив и настройки в Table.pagination: таблица сама выделит текущие строки. Здесь 12 записей по 5 на странице; переключайте их стрелками под таблицей. Отдельный Pagination рядом не нужен. Для серверной загрузки приложение должно отдельно управлять данными и общим количеством.',
      demo: <PaginationTableDemo />,
      code: tableCode,
    },
  ],
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
