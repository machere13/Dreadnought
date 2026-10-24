import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { WaterfallChartBasicDemo } from './WaterfallChartBasicDemo.tsx';
import basicCode from './WaterfallChartBasicDemo.tsx?raw';
import { WaterfallChartNegativeDemo } from './WaterfallChartNegativeDemo.tsx';
import negativeCode from './WaterfallChartNegativeDemo.tsx?raw';
import { WaterfallChartStatesDemo } from './WaterfallChartStatesDemo.tsx';
import statesCode from './WaterfallChartStatesDemo.tsx?raw';
import { WaterfallChartManyDemo } from './WaterfallChartManyDemo.tsx';
import manyCode from './WaterfallChartManyDemo.tsx?raw';

import { WaterfallChartCompositionDemo } from './WaterfallChartCompositionDemo.tsx';
import compositionCode from './WaterfallChartCompositionDemo.tsx?raw';

export const waterfallChartDoc: ComponentDoc = {
  ...getCatalogDoc('waterfallchart'),
  title: 'WaterfallChart',
  description: 'Как отдельные изменения складываются в итог.',
  usage:
    'Объясните изменение бюджета, остатков или показателя: что прибавилось, что убыло и сколько осталось. Для независимых категорий используйте BarChart, для тенденции во времени — LineChart.',
  primaryProps: ['data', 'label', 'domain', 'formatValue', 'pageSize'],
  adapterDescription:
    'WaterfallChartAdapter связывает расчёт с SVG, Tooltip, Mark, таблицей и клавиатурной навигацией коллекций. Не зависит от темы.',
  logicDescription:
    'buildWaterfallLayout вычисляет суммы до и после каждого шага, геометрию столбцов и общую шкалу без React и DOM.',
  notes: [
    <>
      Свои children задают состав и порядок Plot, Table, Pagination и Empty. Без children выводится
      готовый набор; null оставляет подпись. useWaterfallChart возвращает layout полного ряда, page
      текущих шагов, labels, formatValue и slotProps. Пагинация меняет график и таблицу вместе, но
      сохраняет общую шкалу и накопление. Соединители рисуются только между шагами одной страницы.
    </>,
    <>
      Plot.children и tooltipContent получают step, baseline, connector, active, labels, formatValue
      и defaultContent рисунка/подсказки. Координаты рисунка — нормализованный SVG 0…100,
      стандартный viewBox «0 -2 100 104». Свой рисунок декоративен, без интерактивных потомков;
      исходный span сохраняет ref, фокус, имя и события. null/undefined/false отключают Tooltip.
      Части и хук требуют ближайший WaterfallChart[Adapter]. При замене таблицы сохраните тип,
      точное значение, баланс до и после шага.
    </>,
    <>
      kind: start задаёт начальное значение и допустим только первым. change прибавляет value со
      знаком. total показывает накопленную сумму и не изменяет её — используйте его и для
      промежуточного, и для последнего итога. Без start расчёт начинается с нуля.
    </>,
    <>
      У total нет value: итог нельзя случайно посчитать дважды или передать противоречащую сумму.
      Порядок data сохраняется. Пустые ID и названия, повторные ID, неизвестный kind, NaN, Infinity
      и переполнение суммы отклоняются.
    </>,
    <>
      Столбец изменения соединяет предыдущее и новое значения, начало и итог идут от нуля. Рост и
      падение различаются цветом и знаком числа; тип шага также указан в таблице и Tooltip. Нулевое
      изменение — линия, а не искусственно увеличенный столбец.
    </>,
    <>
      domain задаёт общую шкалу, которая должна включать ноль и все накопленные значения. По
      умолчанию шкала вычисляется автоматически, для полностью нулевых данных используется [0, 1].
      Соединительные линии показывают баланс после шага, а не отдельное значение.
    </>,
    <>
      Tab входит в диаграмму один раз. ←/→ и Home/End перемещают фокус по текущей странице; Escape
      закрывает Tooltip. На узком экране шаги прокручиваются горизонтально и раскрываются при
      фокусе. Таблица прокручивается отдельно.
    </>,
    <>
      pageSize ограничивает одновременно диаграмму и таблицу. Накопление и шкала всегда считаются по
      полному data, между страницами соединительная линия не рисуется. Расчёт и память O(n); data и
      domain заменяйте, не меняйте на месте. Новые ссылки сбрасывают страницу и Tooltip.
    </>,
    <>
      formatValue форматирует число, но не меняет расчёт. У изменений компонент сам добавляет + или
      − и передаёт форматтеру модуль значения. Для шкалы, балансов и итогов форматтер получает число
      со знаком.
    </>,
  ],
  examples: [
    {
      id: 'basic',
      title: 'Понять, из чего получился остаток',
      description:
        '100 в начале, +40 от продаж, −25 на аренду — осталось 115. «После продаж» показывает промежуточные 140 и не прибавляет их ещё раз. Наведите на расход: Tooltip покажет 140 до шага и 115 после.',
      demo: <WaterfallChartBasicDemo />,
      code: basicCode,
    },
    {
      id: 'negative',
      title: 'Уйти в минус и вернуться',
      description:
        'После оплаты баланс падает с 50 до −30, поступление 60 возвращает его к 30. Промежуточная задолженность рисуется ниже нуля. Здесь явно задана шкала [−100, 150].',
      demo: <WaterfallChartNegativeDemo />,
      code: negativeCode,
    },
    {
      id: 'states',
      title: 'Отличить ноль от отсутствия данных',
      description:
        'У нулевых шагов нет высоты, но остаются подпись, фокус и Tooltip. Очистите данные: вместо диаграммы появится отдельное пустое состояние.',
      demo: <WaterfallChartStatesDemo />,
      code: statesCode,
    },
    {
      id: 'many',
      title: 'Перелистывать, не теряя накопление',
      description:
        '20 шагов по пять на странице. Вторая страница продолжает баланс первой, а не начинает с нуля. На последней итог — 145; шкала одинакова на всех страницах.',
      demo: <WaterfallChartManyDemo />,
      code: manyCode,
    },
    {
      id: 'composition',
      title: 'Свой рисунок и состав частей',
      description:
        'Бары со скруглением и свои подписи используют готовые координаты. Кнопка листает шаги и таблицу вместе. Итог всего ряда остаётся 115, на последней странице расход начинается с накопленных 140.',
      demo: <WaterfallChartCompositionDemo />,
      code: compositionCode,
    },
  ],
};
export function WaterfallChartPage() {
  return <ComponentPage component="waterfallchart" doc={waterfallChartDoc} />;
}
