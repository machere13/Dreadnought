import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { PaginationListDemo } from './PaginationListDemo.tsx';
import listCode from './PaginationListDemo.tsx?raw';
import { PaginationSimpleDemo } from './PaginationSimpleDemo.tsx';
import simpleCode from './PaginationSimpleDemo.tsx?raw';
import { PaginationTableDemo } from './PaginationTableDemo.tsx';
import tableCode from './PaginationTableDemo.tsx?raw';

export const paginationDoc: ComponentDoc = {
  ...getCatalogDoc('pagination'),
  title: 'Pagination',
  usage:
    'Для просмотра длинного списка по страницам. Pagination сообщает выбранную страницу, а приложение выбирает или загружает её данные.',
  primaryProps: [
    'total',
    'current',
    'pageSize',
    'onChange',
    'showSizeChanger',
    'showQuickJumper',
    'simple',
  ],
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
        'Переключите страницу или измените её размер — список выше обновится. Быстрый переход применяется по Enter, новый размер возвращает на страницу 1. Все 120 записей находятся в памяти, без сетевых запросов.',
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
        'Переключайте страницы стрелками под таблицей: здесь 12 записей по 5 на странице. Table.pagination сам выбирает строки из полного массива; отдельный Pagination не нужен. Серверную загрузку реализует приложение.',
      demo: <PaginationTableDemo />,
      code: tableCode,
    },
  ],
  notes: [
    <>onChange(page, pageSize) вызывается один раз на действие.</>,
    <>
      current и pageSize управляются независимо; defaultCurrent и defaultPageSize задают начальные
      значения.
    </>,
    <>Выбор нового размера запрашивает страницу 1.</>,
    <>Быстрый переход применяется по Enter.</>,
    <>Те же настройки доступны в Table.pagination.</>,
  ],
};

export function PaginationPage() {
  return <ComponentPage component="pagination" doc={paginationDoc} />;
}
