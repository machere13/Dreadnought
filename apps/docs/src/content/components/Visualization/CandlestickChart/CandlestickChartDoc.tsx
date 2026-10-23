import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { CandlestickChartBasicDemo } from './CandlestickChartBasicDemo.tsx';
import basicCode from './CandlestickChartBasicDemo.tsx?raw';
import { CandlestickChartScaleDemo } from './CandlestickChartScaleDemo.tsx';
import scaleCode from './CandlestickChartScaleDemo.tsx?raw';
import { CandlestickChartStatesDemo } from './CandlestickChartStatesDemo.tsx';
import statesCode from './CandlestickChartStatesDemo.tsx?raw';
import { CandlestickChartManyDemo } from './CandlestickChartManyDemo.tsx';
import manyCode from './CandlestickChartManyDemo.tsx?raw';
import { CandlestickChartCompositionDemo } from './CandlestickChartCompositionDemo.tsx';
import compositionCode from './CandlestickChartCompositionDemo.tsx?raw';

export const candlestickChartDoc: ComponentDoc = {
  ...getCatalogDoc('candlestickchart'),
  title: 'CandlestickChart',
  description: 'Открытие, закрытие, минимум и максимум за каждый период.',
  usage:
    'Покажите котировки, курсы или другой ряд из четырёх OHLC-значений. Свечи помогают увидеть движение внутри периода. Если на период приходится одно число, используйте LineChart; для распределения наблюдений — BoxPlot.',
  primaryProps: ['data', 'label', 'domain', 'formatValue', 'pageSize'],
  adapterDescription:
    'CandlestickChartAdapter связывает расчёт с SVG, Tooltip, Mark, таблицей, пагинацией и навигацией коллекций. Не зависит от темы.',
  logicDescription:
    'buildCandlestickLayout проверяет OHLC, рассчитывает общую шкалу, тело и тени свечей, определяет рост, падение и отсутствие изменения без React и DOM.',
  notes: [
    <>
      Без children график собирает Plot, Table и Pagination автоматически. Передайте свои части,
      чтобы менять порядок или заменять их; children=null оставляет только подпись. В обоих слоях
      доступны CandlestickChart[Adapter].Plot, .Table, .Pagination и useCandlestickChart: layout —
      полный ряд и шкала, candles — текущая страница, page.change — переход.
    </>,
    <>
      Plot принимает height (положительное конечное число, по умолчанию 240), children для рисунка
      периода и tooltipContent для содержимого подсказки. Оба callback получают candle, height,
      labels, formatValue и defaultContent. null/undefined/false из tooltipContent отключают
      подсказку. Фокус, доступное OHLC-описание и события остаются на внешней обёртке: не добавляйте
      интерактивные элементы внутрь рисунка. Части и хук работают только внутри своего графика. Если
      заменяете Table, сохраните доступное представление всех четырёх цен.
    </>,
    <>
      Каждый элемент data содержит уникальный id, название периода label и числа open, high, low,
      close. Требуется low ≤ open/close ≤ high; значения должны быть конечными. Порядок сохраняется:
      передавайте уже отсортированный ряд.
    </>,
    <>
      Тело соединяет открытие и закрытие, тонкая линия — минимум и максимум. Рост показан полым
      телом, падение — заполненным, равенство open/close — горизонтальной линией (doji). Числа и
      текст движения доступны в Tooltip и таблице независимо от цвета.
    </>,
    <>
      Автоматическая шкала включает все low/high полного ряда и не обязана начинаться с нуля. domain
      задаёт общие границы и не может обрезать данные. Если все цены совпадают, шкала расширяется на
      1% с каждой стороны, не менее чем на 1, в пределах конечных чисел.
    </>,
    <>
      pageSize ограничивает одновременно свечи и строки таблицы, по умолчанию 12. Масштаб всегда
      общий для всех страниц. На узком экране свечи и таблица прокручиваются отдельно; переход
      фокуса раскрывает свечу целиком.
    </>,
    <>
      Tab входит в свечи один раз. ←/→ и Home/End перемещают фокус по текущей странице, Escape
      закрывает Tooltip. Наведение и нажатие также показывают подробности. Подпись под периодом —
      цена закрытия.
    </>,
    <>
      Расчёт и память O(n) по полному data, в DOM не более pageSize свечей и строк. Периоды не
      отбрасываются и не усредняются. Новые ссылки data/domain сбрасывают страницу и Tooltip;
      изменяйте массивы заменой, а не на месте.
    </>,
  ],
  examples: [
    {
      id: 'basic',
      title: 'Прочитать рост, падение и отсутствие изменения',
      description:
        'Понедельник закрылся выше открытия, вторник — ниже, среда — на той же цене. Наведите на свечу: Tooltip покажет все четыре числа и направление движения. Те же данные есть в таблице.',
      demo: <CandlestickChartBasicDemo />,
      code: basicCode,
    },
    {
      id: 'scale',
      title: 'Сравнить ряды на одной шкале',
      description:
        'Здесь явно задан domain=[80,140]. Положение свечей можно сравнить с другим графиком на такой же шкале; автоматически приближать каждый ряд компонент не будет.',
      demo: <CandlestickChartScaleDemo />,
      code: scaleCode,
    },
    {
      id: 'states',
      title: 'Отличить нулевые цены от пустого ряда',
      description:
        'Одна свеча с четырьмя нулями остаётся доступной линией. Очистите данные: вместо свечей появится «Нет данных».',
      demo: <CandlestickChartStatesDemo />,
      code: statesCode,
    },
    {
      id: 'many',
      title: 'Просматривать 10 000 периодов частями',
      description:
        'На странице 20 свечей и 20 строк. Перейдите на страницу 500: появятся периоды 9981–10000, а шкала останется прежней. ←/→ и Home/End помогают просматривать свечи при горизонтальной прокрутке.',
      demo: <CandlestickChartManyDemo />,
      code: manyCode,
    },
    {
      id: 'composition',
      title: 'Заменить свечи OHLC-барами и собрать свою таблицу',
      description:
        'Вертикаль показывает минимум и максимум, левая риска — открытие, правая — закрытие. Рисунок и таблица заменены, Tooltip дополнен. Клавиатура, форматирование, общая шкала и пагинация остались готовыми. Кнопка над таблицей и нижняя пагинация управляют одной страницей.',
      demo: <CandlestickChartCompositionDemo />,
      code: compositionCode,
    },
  ],
};
export function CandlestickChartPage() {
  return <ComponentPage component="candlestickchart" doc={candlestickChartDoc} />;
}
