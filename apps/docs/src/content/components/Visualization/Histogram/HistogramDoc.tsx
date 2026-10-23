import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { HistogramBasicDemo } from './HistogramBasicDemo.tsx';
import basicCode from './HistogramBasicDemo.tsx?raw';
import { HistogramIntervalsDemo } from './HistogramIntervalsDemo.tsx';
import intervalsCode from './HistogramIntervalsDemo.tsx?raw';
import { HistogramStatesDemo } from './HistogramStatesDemo.tsx';
import statesCode from './HistogramStatesDemo.tsx?raw';
import { HistogramLargeDemo } from './HistogramLargeDemo.tsx';
import largeCode from './HistogramLargeDemo.tsx?raw';

export const histogramDoc: ComponentDoc = {
  ...getCatalogDoc('histogram'),
  title: 'Histogram',
  description: 'Распределение числовых наблюдений по равным интервалам.',
  usage:
    'Для времени ответа, сумм заказов и результатов измерений. Передайте исходные числа: компонент сам посчитает наблюдения в каждом интервале. Для сравнения готовых категорий используйте BarChart.',
  primaryProps: ['data', 'bins', 'domain', 'label', 'categoryLabel', 'valueLabel'],
  adapterDescription:
    'HistogramAdapter превращает интервалы в столбцы и переиспользует BarChartAdapter: Tooltip, Mark, навигацию, прокрутку и таблицу.',
  logicDescription:
    'buildHistogram проверяет исходные числа и рассчитывает границы, количество и долю наблюдений без React и DOM.',
  notes: [
    <>
      bins — число равных интервалов от 1 до 1000. Без него используется ceil(log₂(n)) + 1, максимум
      100. domain задаёт общий диапазон: ширина интервала равна (max − min) / bins. Произвольные
      неравные интервалы и плотность распределения не поддерживаются.
    </>,
    <>
      Интервал [a; b) включает a, но не b. Последний [a; b] включает максимум. Внутренняя граница
      попадает только в следующий интервал. Пустые интервалы сохраняются с нулём.
    </>,
    <>
      Без domain берутся минимум и максимум выборки. Для одинаковых чисел диапазон расширяется на 1%
      модуля значения, но минимум на 0.5 с каждой стороны, в пределах конечных чисел. Для сравнения
      выборок задайте одинаковые domain и bins.
    </>,
    <>
      NaN, Infinity, null и значения вне domain отклоняются. Компонент не удаляет выбросы и не
      обрезает данные. Если границы сливаются из-за точности чисел, уменьшите bins или расширьте
      domain.
    </>,
    <>
      Высота — количество наблюдений, ось начинается с нуля. Tooltip и таблица показывают также долю
      всей выборки, округлённую до 0.1%. formatBoundary меняет подписи границ, но не группировку.
    </>,
    <>
      Стрелки влево/вправо и Home/End перемещают фокус между интервалами без зацикливания; Escape
      закрывает Tooltip. При нехватке ширины прокручивается график, не страница.
    </>,
    <>
      Расчёт занимает O(n log bins), память модели — O(bins). Исходные наблюдения не создают
      отдельные DOM-элементы. Передавайте неизменяемый массив: результат кешируется по ссылке data,
      bins и domain. pageSize ограничивает только таблицу интервалов.
    </>,
    <>
      Оформление и токены --dreadnought-bar-chart-* общие с BarChart. width и height задаются
      вместе; без них размер определяется по контейнеру. При SSR таблица доступна до появления
      графика.
    </>,
  ],
  examples: [
    {
      id: 'histogram-basic',
      title: 'Как быстро отвечает сервер',
      description:
        '16 запросов распределены по шести интервалам шириной 100 мс. Наведите указатель или сфокусируйте столбец: увидите количество и долю запросов.',
      demo: <HistogramBasicDemo />,
      code: basicCode,
    },
    {
      id: 'histogram-intervals',
      title: 'Больше интервалов — больше деталей',
      description:
        'Переключайте 2, 4 и 8 интервалов. Выборка и диапазон −20…20 °C остаются прежними; меняется только группировка.',
      demo: <HistogramIntervalsDemo />,
      code: intervalsCode,
    },
    {
      id: 'histogram-states',
      title: 'Одинаковые значения и пустая выборка',
      description:
        'Четыре измерения равны 5. Автодиапазон позволяет показать их без деления на ноль. Очистите выборку, чтобы увидеть пустое состояние.',
      demo: <HistogramStatesDemo />,
      code: statesCode,
    },
    {
      id: 'histogram-large',
      title: 'Большая выборка без 100 000 столбцов',
      description:
        'Компонент агрегирует 100 000 чисел в 20 интервалов. На узком экране график прокручивается; таблица показывает по пять интервалов на странице.',
      demo: <HistogramLargeDemo />,
      code: largeCode,
    },
  ],
};

export function HistogramPage() {
  return <ComponentPage component="histogram" doc={histogramDoc} />;
}
