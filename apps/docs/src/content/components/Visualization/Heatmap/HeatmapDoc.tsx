import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { HeatmapBasicDemo } from './HeatmapBasicDemo.tsx';
import basicCode from './HeatmapBasicDemo.tsx?raw';
import { HeatmapDivergingDemo } from './HeatmapDivergingDemo.tsx';
import divergingCode from './HeatmapDivergingDemo.tsx?raw';
import { HeatmapMissingDemo } from './HeatmapMissingDemo.tsx';
import missingCode from './HeatmapMissingDemo.tsx?raw';
import { HeatmapWideDemo } from './HeatmapWideDemo.tsx';
import wideCode from './HeatmapWideDemo.tsx?raw';
import { HeatmapCompositionDemo } from './HeatmapCompositionDemo.tsx';
import compositionCode from './HeatmapCompositionDemo.tsx?raw';

export const heatmapDoc: ComponentDoc = {
  ...getCatalogDoc('heatmap'),
  title: 'Heatmap',
  description: 'Тепловая карта: значения на пересечении двух категорий показаны цветом.',
  usage:
    'Для нагрузки по часам, активности команд и матриц показателей. Позволяет находить скопления и пробелы. Для точного сравнения нескольких категорий удобнее BarChart, для связи числовых координат — ScatterChart.',
  primaryProps: ['columns', 'rows', 'data', 'label', 'domain', 'colorScale'],
  adapterDescription:
    'HeatmapAdapter связывает матрицу с Tooltip, навигацией по двум осям и таблицей данных без темы.',
  logicDescription:
    'buildHeatmapLayout проверяет категории и значения, заполняет пропуски и вычисляет интенсивность 0–1 без React и DOM.',
  notes: [
    <>
      Композиция: Heatmap.Plot, Legend, Table, Pagination и Empty можно переставлять и опускать.
      useHeatmap внутри корня даёт layout, hasValues, page, подписи и форматирование.
      children=undefined оставляет стандартный набор, null убирает части.
    </>,
    <>
      Plot.children меняет декоративное содержимое ячейки, tooltipContent — подсказку. Оба callback
      получают cell, active, labels, formatValue, showValues и defaultContent. Внешний span
      сохраняет фон, координаты, ref, фокус, доступное название и обработчики; рисунок не содержит
      интерактивных элементов. null из tooltipContent отключает подсказку.
    </>,
    <>
      Table и Pagination используют общую page из контекста. Листается только таблица: полный набор
      ячеек, фокус и общая шкала не сбрасываются. Legend.children позволяет заменить содержимое
      шкалы, получая domain, labels, formatValue и defaultContent.
    </>,
    <>
      columns и rows задают порядок категорий. Каждая запись data содержит column, row и value.
      Повтор одной пары координат — ошибка; агрегируйте такие записи заранее.
    </>,
    <>
      Ноль — измеренное значение. null и отсутствующая запись — нет данных: пунктирная ячейка с
      тире. Пропуски не влияют на диапазон шкалы.
    </>,
    <>
      Без domain шкала строится по минимуму и максимуму данных. Для сравнения нескольких карт или
      обновлений задайте одинаковый domain. Значения за его пределами отклоняются, а не обрезаются.
    </>,
    <>
      Расходящаяся шкала diverging имеет светлую середину диапазона. Чтобы она соответствовала нулю,
      задайте симметричный domain, например [-20, 20]. При одинаковых значениях без domain все
      ячейки и легенда получают средний цвет.
    </>,
    <>
      Tab входит в матрицу один раз. Стрелки двигают фокус по строкам и столбцам без зацикливания;
      Home/End — в начало и конец строки. Escape закрывает Tooltip. На сенсорном экране нажмите
      ячейку.
    </>,
    <>
      На узком экране прокручивается сама матрица. Сфокусированная ячейка автоматически становится
      видимой. showValues скрывает только текст ячеек, но не подписи для скринридера, Tooltip или
      таблицу.
    </>,
    <>
      Матрица содержит rows × columns ячеек, включая пропуски. pageSize ограничивает только таблицу.
      Виртуализации и автоматической агрегации нет: большие наборы группируйте до передачи
      компоненту.
    </>,
  ],
  examples: [
    {
      id: 'heatmap-basic',
      title: 'Нагрузка команды по дням',
      description:
        'Чем светлее ячейка, тем больше закрытых задач. Наведите указатель или перейдите к ячейке с клавиатуры: Tooltip покажет команду, день и число задач.',
      demo: <HeatmapBasicDemo />,
      code: basicCode,
    },
    {
      id: 'heatmap-diverging',
      title: 'Выше и ниже плана',
      description:
        'Два цвета разделяют отрицательные и положительные отклонения. Диапазон [-20, 20] фиксирует ноль в светлой середине шкалы.',
      demo: <HeatmapDivergingDemo />,
      code: divergingCode,
    },
    {
      id: 'heatmap-missing',
      title: 'Ноль — не отсутствие данных',
      description:
        'Утром измерен 0, днём — 7, вечером нет измерения. Очистите данные: категории сохранятся, все ячейки станут пропусками, а шкала исчезнет.',
      demo: <HeatmapMissingDemo />,
      code: missingCode,
    },
    {
      id: 'heatmap-wide',
      title: '24 часа без сжатия ячеек',
      description:
        'Прокрутите матрицу или перейдите стрелками к последнему часу. Значения спрятаны в ячейках, но доступны в Tooltip и таблице; перелистывание таблицы не меняет график.',
      demo: <HeatmapWideDemo />,
      code: wideCode,
    },
    {
      id: 'composition',
      title: 'Свой рисунок ячеек и управление таблицей',
      description:
        'Размер круга дополняет цвет: ноль — маленький круг, пропуск — тире. Кнопка и нижняя пагинация листают общую таблицу, но все 12 ячеек остаются в матрице. Tab входит в неё один раз; стрелки и Home/End перемещают фокус, Escape закрывает Tooltip. Код ниже соответствует примеру.',
      demo: <HeatmapCompositionDemo />,
      code: compositionCode,
    },
  ],
};

export function HeatmapPage() {
  return <ComponentPage component="heatmap" doc={heatmapDoc} />;
}
