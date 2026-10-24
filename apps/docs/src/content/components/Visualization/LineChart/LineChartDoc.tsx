import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { LineComparisonDemo } from './LineComparisonDemo.tsx';
import comparisonCode from './LineComparisonDemo.tsx?raw';
import { LineMissingDemo } from './LineMissingDemo.tsx';
import missingCode from './LineMissingDemo.tsx?raw';
import { LineRangeDemo } from './LineRangeDemo.tsx';
import rangeCode from './LineRangeDemo.tsx?raw';
import { LineCompositionDemo } from './LineCompositionDemo.tsx';
import compositionCode from './LineCompositionDemo.tsx?raw';
export const lineChartDoc: ComponentDoc = {
  ...getCatalogDoc('linechart'),
  title: 'LineChart',
  usage:
    'Для изменения числового показателя по времени или другой числовой шкале. Для сравнения отдельных категорий используйте BarChart; точные числа доступны в таблице графика.',
  primaryProps: ['series', 'xDomain', 'yDomain', 'formatX', 'formatY', 'zoom', 'pageSize', 'label'],
  description: 'Линейный график изменения числовых показателей.',
  adapterDescription:
    'LineChartAdapter строит SVG, связывает наведение и клавиатуру с Tooltip и оставляет разметку без темы.',
  logicDescription:
    'buildLineLayout готовит полные данные; sampleLineLayout сокращает геометрию по ширине экрана, getLinePointAtX двоичным поиском находит точный исходный X. Расчёты независимы от React, DOM и SVG.',
  notes: [
    <>
      Без children выводится готовый график. Свои children задают порядок и набор частей:
      LineChart[Adapter].Plot, .Legend, .RangeControls, .Table, .Pagination, .Empty. null оставляет
      подпись. Все части и useLineChart работают внутри своего корня и используют одно состояние.
      Хук возвращает series, source полного ряда, xs, values, visible/toggle, активный xDomain,
      range с индексами start/end и change(start,end), page с rows/page/count/change, подписи,
      форматирование и slotProps. Некорректные индексы и неизвестные ID игнорируются.
    </>,
    <>
      Plot.children заменяет SVG-рисунок непрерывного сегмента: series, points в координатах
      области, defaultContent. Разрывы null остаются отдельными сегментами; маркеры, поиск и
      клавиатура сохраняются. tooltipContent получает point, rows, formatX/formatY и defaultContent;
      null/undefined/false скрывают подсказку. Legend.children меняет содержимое готовой кнопки,
      получает series, visible, defaultContent. Не добавляйте интерактивных потомков в рисунок или
      кнопку легенды. При замене Table сохраните доступные исходные значения.
    </>,
    <>
      Пагинация листает только таблицу. Диапазон управляет графиком отдельно; размеры задаются на
      корне.
    </>,
    <>X уникален внутри серии; точки должны попадать в xDomain/yDomain.</>,
    <>Передавайте данные неизменяемыми.</>,
    <>Без ResizeObserver задайте width и height вместе; иначе доступна таблица.</>,
    <>
      Большие наборы сокращаются только для рисования, не для Tooltip и таблицы; стоимость всё равно
      зависит от объёма и числа серий.
    </>,
    <>
      Готовые brush, временная шкала и сглаживание не поддерживаются; свой рисунок можно задать
      через Plot.
    </>,
  ],
  examples: [
    {
      id: 'line-comparison',
      title: 'План и факт по дням',
      description:
        'Две линии сравнивают число заказов за шесть дней. Нажмите «План» или «Факт» в легенде: линия скроется, но её значения останутся в таблице. Наведение или Tab на точку показывает Tooltip; Left/Right проходят точки, Escape закрывает подсказку. zoom={false} убирает ползунки.',
      demo: <LineComparisonDemo />,
      code: comparisonCode,
    },
    {
      id: 'line-missing',
      title: 'Пропуск измерения — не ноль',
      description:
        'В 2 часа y равен null. Линия прерывается, а таблица показывает прочерк, не 0 °C. formatX и formatY добавляют единицы к числовым значениям. Число по X — часы, не строковая дата.',
      demo: <LineMissingDemo />,
      code: missingCode,
    },
    {
      id: 'line-range',
      title: 'Диапазон и страницы исходных данных',
      description:
        'Перемещайте ползунки zoom: изменится видимый диапазон, исходные записи сохранятся. Таблица делит 12 дней на страницы по 4. График имеет фиксированный размер 560 × 280 и прокручивается на узком экране; это учебный набор, не тест производительности.',
      demo: <LineRangeDemo />,
      code: rangeCode,
    },
    {
      id: 'line-composition',
      title: 'Своя линия, легенда и кнопки диапазона',
      description:
        'Ступенчатый рисунок заменяет обычные отрезки, сохраняя маркеры, разрыв Факта и точные подсказки. Своя легенда использует готовые кнопки. Кнопки диапазона и ползунки управляют одним состоянием; пагинация листает только исходную таблицу.',
      demo: <LineCompositionDemo />,
      code: compositionCode,
    },
  ],
};

export function LineChartPage() {
  return <ComponentPage component="linechart" doc={lineChartDoc} />;
}
