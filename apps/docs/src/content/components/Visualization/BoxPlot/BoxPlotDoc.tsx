import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { BoxPlotBasicDemo } from './BoxPlotBasicDemo.tsx';
import basicCode from './BoxPlotBasicDemo.tsx?raw';
import { BoxPlotOutliersDemo } from './BoxPlotOutliersDemo.tsx';
import outliersCode from './BoxPlotOutliersDemo.tsx?raw';
import { BoxPlotStatesDemo } from './BoxPlotStatesDemo.tsx';
import statesCode from './BoxPlotStatesDemo.tsx?raw';
import { BoxPlotGroupsDemo } from './BoxPlotGroupsDemo.tsx';
import groupsCode from './BoxPlotGroupsDemo.tsx?raw';
import { BoxPlotCompositionDemo } from './BoxPlotCompositionDemo.tsx';
import compositionCode from './BoxPlotCompositionDemo.tsx?raw';

export const boxPlotDoc: ComponentDoc = {
  ...getCatalogDoc('boxplot'),
  title: 'BoxPlot',
  description: 'Медиана, разброс и выбросы в нескольких выборках.',
  usage:
    'Сравнивайте время ответа, сроки выполнения или измерения. Полоса внутри бокса — медиана, сам бокс — средние 50% данных, усы — крайние значения без выбросов, отдельные точки — выбросы. Для формы распределения одной выборки используйте Histogram.',
  primaryProps: ['data', 'label', 'domain', 'valueLabel', 'formatValue', 'pageSize'],
  adapterDescription:
    'BoxPlotAdapter связывает статистику с SVG, Tooltip, Mark, навигацией коллекций и таблицей. Работает без темы и без измерения DOM.',
  logicDescription:
    'buildBoxPlotLayout вычисляет статистики и нормализованные координаты без React и DOM; возвращает общую шкалу и сгруппированные выбросы.',
  notes: [
    <>
      Свои children задают состав и порядок Plot, Axis, Table, Pagination и Empty. Без children
      выводится готовый набор; null оставляет подпись. useBoxPlot возвращает layout всех групп, page
      с текущими группами, labels, formatValue и slotProps. Общая шкала не меняется при
      перелистывании. Части и хук требуют ближайший BoxPlot или BoxPlotAdapter. Plot.children
      получает group, active, labels, formatValue и defaultContent рисунка; tooltipContent — те же
      поля с defaultContent подсказки. null/undefined/false отключают Tooltip. Свой рисунок
      декоративен: исходный span сохраняет ref, фокус, доступное имя и события. Не добавляйте
      интерактивных потомков. При замене таблицы сохраняйте точные статистики и выбросы, включая
      число совпадений.
    </>,
    <>
      Квартили Q1/Q3 и медиана рассчитываются линейной интерполяцией type 7: позиция p × (n − 1).
      Метод указан явно, потому что разные статистические пакеты могут давать разные квартили на
      маленьких выборках.{' '}
      <a href="https://search.r-project.org/R/refmans/stats/html/quantile.html">
        Описание метода в R
      </a>
      .
    </>,
    <>
      IQR = Q3 − Q1. Усы доходят до крайних наблюдений внутри [Q1 − 1.5 IQR; Q3 + 1.5 IQR], а не до
      самих границ. Остальные наблюдения — выбросы; это не означает ошибку измерения.{' '}
      <a href="https://itl.nist.gov/div898/handbook/prc/section1/prc16.htm">
        Правило выбросов NIST
      </a>
      .
    </>,
    <>
      Совпадающие выбросы занимают одну точку. В Tooltip и таблице записано точное значение и число
      совпадений, например «60 °C × 2». Никакие наблюдения не удаляются.
    </>,
    <>
      domain задаёт общую шкалу для всех групп и страниц. Без него берутся минимум и максимум всех
      данных. Для постоянной выборки диапазон расширяется на max(|value| × 0.01, 0.5). Значения вне
      явного domain, NaN и Infinity отклоняются.
    </>,
    <>
      Пустая группа остаётся с надписью «Нет данных», не рисует ноль и не участвует в диапазоне. Для
      одного значения и одинаковых чисел бокс схлопывается в линию медианы.
    </>,
    <>
      Tab входит в график один раз. Стрелки вверх/вниз и Home/End перемещают фокус между непустыми
      группами текущей страницы, Escape закрывает Tooltip. На сенсорном экране нажмите бокс. Таблица
      прокручивается внутри контейнера.
    </>,
    <>
      pageSize ограничивает одновременно график и таблицу, но статистики и шкала рассчитываются по
      всем данным. Сортировка каждой выборки O(n log n), память O(n); передавайте неизменяемые
      массивы. Уникальные выбросы рисуются без прореживания: для десятков тысяч выбросов в одной
      группе рассмотрите Histogram.
    </>,
  ],
  examples: [
    {
      id: 'boxplot-basic',
      title: 'Сравнить скорость сервисов',
      description:
        'У поиска медиана 120 мс и отдельный медленный ответ 320 мс. У каталога медиана 180 мс и более широкий разброс. Наведите указатель или нажмите Tab, чтобы прочитать точные статистики.',
      demo: <BoxPlotBasicDemo />,
      code: basicCode,
    },
    {
      id: 'boxplot-outliers',
      title: 'Выбросы с обеих сторон',
      description:
        'Большинство измерений около 20 °C. Точки −20 °C и 60 °C лежат за усами. Значение 60 °C встретилось дважды — в подсказке и таблице это отмечено множителем.',
      demo: <BoxPlotOutliersDemo />,
      code: outliersCode,
    },
    {
      id: 'boxplot-states',
      title: 'Одинаковые, одиночные и пустые данные',
      description:
        'Первые две группы показывают медиану 5 без искусственного разброса. Третья группа не имеет измерений. Кнопка очищает и возвращает весь набор.',
      demo: <BoxPlotStatesDemo />,
      code: statesCode,
    },
    {
      id: 'boxplot-groups',
      title: 'Много групп на общей шкале',
      description:
        '12 000 чисел сводятся к статистикам 12 команд. Перелистывайте по три группы: график и таблица меняются вместе, шкала 0–100 остаётся прежней.',
      demo: <BoxPlotGroupsDemo />,
      code: groupsCode,
    },
    {
      id: 'boxplot-composition',
      title: 'Свой рисунок и состав частей',
      description:
        'Боксы со скруглением используют готовые квартили, усы и выбросы. Шкала перенесена выше рисунка. Кнопка перелистывает график и таблицу вместе; общая шкала остаётся прежней.',
      demo: <BoxPlotCompositionDemo />,
      code: compositionCode,
    },
  ],
};

export function BoxPlotPage() {
  return <ComponentPage component="boxplot" doc={boxPlotDoc} />;
}
