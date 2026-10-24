import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { BarComparisonDemo } from './BarComparisonDemo.tsx';
import comparisonCode from './BarComparisonDemo.tsx?raw';
import { BarHorizontalDemo } from './BarHorizontalDemo.tsx';
import horizontalCode from './BarHorizontalDemo.tsx?raw';
import { BarBalanceDemo } from './BarBalanceDemo.tsx';
import balanceCode from './BarBalanceDemo.tsx?raw';
import { BarCompositionDemo } from './BarCompositionDemo.tsx';
import compositionCode from './BarCompositionDemo.tsx?raw';
export const barChartDoc: ComponentDoc = {
  ...getCatalogDoc('barchart'),
  title: 'BarChart',
  usage:
    'Для сравнения величин по категориям, например плана и факта. Для изменения показателя по времени используйте LineChart; точные числа доступны в таблице графика.',
  primaryProps: [
    'categories',
    'series',
    'orientation',
    'domain',
    'minCategorySize',
    'pageSize',
    'label',
  ],
  description: 'Сравнение значений категорий вертикальными или горизонтальными столбцами.',
  adapterDescription:
    'BarChartAdapter строит SVG, связывает столбцы с Tooltip и клавиатурой, показывает легенду и полную таблицу без темы.',
  logicDescription:
    'buildBarLayout вычисляет координаты столбцов, нулевую ось и отметки шкалы. Расчёт не зависит от React, DOM или SVG.',
  notes: [
    <>
      Без children выводится готовый график. Свои children задают порядок и набор частей:
      BarChart[Adapter].Plot, .Legend, .Table, .Pagination, .Empty. null оставляет подпись. Все
      части и useBarChart работают внутри своего корня. Хук возвращает source полного ряда,
      categories, series, visible/toggle, page с rows/page/count/change, параметры шкалы, подписи,
      форматирование и slotProps. Неизвестные ID и некорректные страницы игнорируются.
    </>,
    <>
      Plot.children заменяет SVG-содержимое столбца: bar в координатах области, series, category,
      active и defaultContent. Фокус, прокрутка, клавиатура, доступное имя и Tooltip остаются на
      внешней обёртке. tooltipContent получает bar, category, rows, formatValue, defaultContent;
      null/undefined/false скрывают подсказку. Legend.children меняет содержимое готовой кнопки:
      series, visible, defaultContent. Не вкладывайте интерактивные элементы в рисунок или кнопку;
      сохраняйте заметное выделение фокуса и нулевые значения. При замене Table оставьте доступное
      представление исходных чисел, включая скрытые серии.
    </>,
    <>
      Пагинация листает только таблицу; график прокручивается и виртуализируется отдельно. Размеры
      задаются на корне.
    </>,
    <>domain должен включать ноль и все значения.</>,
    <>Ключи values соответствуют id категорий; данные передавайте неизменяемыми.</>,
    <>
      При нехватке места категории прокручиваются, minCategorySize задаёт минимальное пространство
      на серию.
    </>,
    <>Без ResizeObserver задайте width и height вместе; иначе доступна таблица.</>,
    <>Stacked, zoom и brush не поддерживаются.</>,
  ],
  examples: [
    {
      id: 'bar-comparison',
      title: 'Сравнение плана и факта',
      description:
        'В каждом месяце два столбца стоят рядом. categories задаёт названия, values связывает числа с id месяцев. Легенда скрывает серию, но не удаляет её из таблицы. Tooltip сравнивает видимые значения одного месяца.',
      demo: <BarComparisonDemo />,
      code: comparisonCode,
    },
    {
      id: 'bar-horizontal',
      title: 'Горизонтальные столбцы',
      description:
        'orientation="horizontal" удобен для сравнения направлений с текстовыми названиями. В примере значения — часы. Tab выбирает столбец, Up/Down переходят между ними, Escape закрывает Tooltip. Размер явно задан 560 × 280; внешний контейнер прокручивается на узком экране.',
      demo: <BarHorizontalDemo />,
      code: horizontalCode,
    },
    {
      id: 'bar-balance',
      title: 'Отрицательное значение, ноль и пропуск',
      description:
        'Понедельник: +12 единиц, вторник: −8, среда: 0, четверг: null. Отрицательный столбец идёт от нулевой оси в обратную сторону, ноль остаётся отметкой на оси, null не создаёт столбец. Таблица различает 0 и прочерк. Диапазон [-10, 20] включает ноль и все числа.',
      demo: <BarBalanceDemo />,
      code: balanceCode,
    },
    {
      id: 'bar-composition',
      title: 'Свой рисунок столбцов и порядок частей',
      description:
        'Столбцы скруглены, ноль остаётся линией. Подписи кнопок легенды заменены, Tooltip дополнен. Кнопка «Следующие строки» и нижняя пагинация листают одну таблицу; график остаётся полным. ←/→ и Home/End работают как у стандартных столбцов.',
      demo: <BarCompositionDemo />,
      code: compositionCode,
    },
  ],
};

export function BarChartPage() {
  return <ComponentPage component="barchart" doc={barChartDoc} />;
}
