import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { LineComparisonDemo } from './LineComparisonDemo.tsx';
import comparisonCode from './LineComparisonDemo.tsx?raw';
import { LineMissingDemo } from './LineMissingDemo.tsx';
import missingCode from './LineMissingDemo.tsx?raw';
import { LineRangeDemo } from './LineRangeDemo.tsx';
import rangeCode from './LineRangeDemo.tsx?raw';
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
    <>X уникален внутри серии; точки должны попадать в xDomain/yDomain.</>,
    <>Передавайте данные неизменяемыми.</>,
    <>Без ResizeObserver задайте width и height вместе; иначе доступна таблица.</>,
    <>
      Большие наборы сокращаются только для рисования, не для Tooltip и таблицы; стоимость всё равно
      зависит от объёма и числа серий.
    </>,
    <>Brush, временная шкала и сглаживание не поддерживаются.</>,
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
  ],
};

export function LineChartPage() {
  return <ComponentPage component="linechart" doc={lineChartDoc} />;
}
