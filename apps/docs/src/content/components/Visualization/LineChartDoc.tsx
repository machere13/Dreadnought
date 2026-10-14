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
  description:
    'Показывает изменение числового показателя по времени или другой числовой шкале X. Каждая серия — отдельная линия; исходные значения доступны в таблице.',
  adapterDescription:
    'LineChartAdapter строит SVG, связывает наведение и клавиатуру с Tooltip и оставляет разметку без темы.',
  logicDescription:
    'buildLineLayout готовит полные данные; sampleLineLayout сокращает геометрию по ширине экрана, getLinePointAtX двоичным поиском находит точный исходный X. Расчёты независимы от React, DOM и SVG.',
  footnote: (
    <>
      X уникален внутри серии; точки должны попадать в xDomain/yDomain. Передавайте данные
      неизменяемыми. Без ResizeObserver задайте width и height вместе; иначе доступна таблица.
      Большие наборы сокращаются только для рисования, не для Tooltip и таблицы; стоимость всё равно
      зависит от объёма и числа серий. Brush, временная шкала и сглаживание не поддерживаются.
    </>
  ),
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
        'Два ползунка zoom выбирают границы по исходным точкам и ограничивают видимый диапазон X, не удаляя записи. В таблице pageSize={4} делит 12 дней на три страницы. Для этого примера явно заданы width={560} и height={280}; на узком экране внешний контейнер прокручивается. Это небольшой учебный набор, не тест производительности.',
      demo: <LineRangeDemo />,
      code: rangeCode,
    },
  ],
};

export function LineChartPage() {
  return <ComponentPage component="linechart" doc={lineChartDoc} />;
}
