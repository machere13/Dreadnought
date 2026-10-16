import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { TableBasicDemo } from './TableBasicDemo.tsx';
import basicCode from './TableBasicDemo.tsx?raw';
import { TableSelectionDemo } from './TableSelectionDemo.tsx';
import selectionCode from './TableSelectionDemo.tsx?raw';
import { TableFiltersDemo } from './TableFiltersDemo.tsx';
import filtersCode from './TableFiltersDemo.tsx?raw';
import { TableSortDemo } from './TableSortDemo.tsx';
import sortCode from './TableSortDemo.tsx?raw';
import { TableSummaryDemo } from './TableSummaryDemo.tsx';
import summaryCode from './TableSummaryDemo.tsx?raw';
import { TableExpandDemo } from './TableExpandDemo.tsx';
import expandCode from './TableExpandDemo.tsx?raw';
import { TableLayoutDemo } from './TableLayoutDemo.tsx';
import layoutCode from './TableLayoutDemo.tsx?raw';
import { TableSpanDemo } from './TableSpanDemo.tsx';
import spanCode from './TableSpanDemo.tsx?raw';
import { TableManualDemo } from './TableManualDemo.tsx';
import manualCode from './TableManualDemo.tsx?raw';

export const tableDoc: ComponentDoc = {
  ...getCatalogDoc('table'),
  title: 'Table',
  usage:
    'Для сравнения записей по одинаковым полям, сортировки и выбора строк. Для свободного содержимого без колонок используйте Card.',
  primaryProps: [
    'dataSource',
    'columns',
    'rowKey',
    'pagination',
    'rowSelection',
    'onChange',
    'loading',
    'scroll',
    'sticky',
  ],
  description: 'Таблица данных с сортировкой, фильтрацией, выбором и деталями строк.',
  adapterDescription: 'Адаптер сохраняет семантику и поведение таблицы без оформления.',
  logicDescription:
    'Ядро рассчитывает шапку, сортирует и фильтрует строки независимо от фреймворка.',
  notes: [
    'Для выбора и раскрытия строк нужен уникальный rowKey или record.key.',
    'Обработчики строк и ячеек получают индекс текущей страницы и возвращают нативные свойства.',
    'Для закреплённых колонок задавайте width; ручные объединения ячеек не должны пересекать закреплённые области.',
  ],
  examples: [
    {
      id: 'basic',
      title: 'Таблица и простая сортировка',
      description:
        'Две строки и две колонки. Нажмите «Имя», чтобы отсортировать участников; повторные нажатия меняют направление и сбрасывают сортировку. Данные обрабатываются локально, пагинация отключена.',
      demo: <TableBasicDemo />,
      code: basicCode,
    },
    {
      id: 'selection',
      title: 'Выбор строк',
      description:
        'Анна уже выбрана. Отметьте других участников или нажмите чекбокс в шапке. Наведите на выбранную и обычную строки: их состояния различаются. На узком экране колонка «Участник» остаётся закреплённой при прокрутке.',
      demo: <TableSelectionDemo />,
      code: selectionCode,
    },
    {
      id: 'filters',
      title: 'Фильтры',
      description:
        'Откройте фильтр «Город», выберите Москву и подтвердите выбор. В фильтре «Возраст» введите 30 и нажмите «Применить»: останется Марк. Ввод и выбор не применяют фильтр до подтверждения; «Сбросить» очищает его.',
      demo: <TableFiltersDemo />,
      code: filtersCode,
    },
    {
      id: 'sort',
      title: 'Сортировка по нескольким колонкам',
      description:
        'Нажмите «Команда», затем «Участник»: сначала строки группируются по команде, затем сортируются по имени. Приоритет задаёт multiple: большее число важнее. Третье нажатие сбрасывает сортировку только этой колонки.',
      demo: <TableSortDemo />,
      code: sortCode,
    },
    {
      id: 'summary',
      title: 'Пагинация и итог страницы',
      description:
        'На странице две записи. Перейдите на следующую: итог изменится с 360 до 80 часов. summary получает только строки текущей страницы; без пагинации — все подходящие строки.',
      demo: <TableSummaryDemo />,
      code: summaryCode,
    },
    {
      id: 'expand',
      title: 'Детали строки',
      description:
        'У Анны уже раскрыт город. Закройте её детали или откройте строку Марка кнопкой в первой колонке. Ключ строки связывает раскрытие с записью.',
      demo: <TableExpandDemo />,
      code: expandCode,
    },
    {
      id: 'layout',
      title: 'Группы колонок и закрепление',
      description:
        'Прокрутите таблицу вниз: шапка останется видимой. На узком экране прокрутите вправо: колонка «Участник» останется слева. Кнопка скрывает город и перестраивает группы шапки; наведите на сокращённую почту, чтобы прочитать её полностью.',
      demo: <TableLayoutDemo />,
      code: layoutCode,
    },
    {
      id: 'span',
      title: 'Объединение ячеек',
      description:
        'Первые два участника относятся к дизайну — их команда отображается одной ячейкой. rowSpan: 2 объединяет строки, rowSpan: 0 скрывает повтор. При изменении порядка данных эти значения нужно пересчитать.',
      demo: <TableSpanDemo />,
      code: spanCode,
    },
    {
      id: 'manual',
      title: 'Серверная пагинация и загрузка',
      description:
        'Измените страницу или сортировку: после имитации запроса в 700 мс появятся новые строки. processing="manual" не обрабатывает страницу повторно. Настоящие запросы, ошибки и отмену устаревших ответов реализует приложение.',
      demo: <TableManualDemo />,
      code: manualCode,
    },
  ],
};

export function TablePage() {
  return <ComponentPage component="table" doc={tableDoc} />;
}
