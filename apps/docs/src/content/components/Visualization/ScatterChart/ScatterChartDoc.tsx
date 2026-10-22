import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { ScatterBasicDemo } from './ScatterBasicDemo.tsx';
import basicCode from './ScatterBasicDemo.tsx?raw';
import { ScatterBubbleDemo } from './ScatterBubbleDemo.tsx';
import bubbleCode from './ScatterBubbleDemo.tsx?raw';
import { ScatterEmptyDemo } from './ScatterEmptyDemo.tsx';
import emptyCode from './ScatterEmptyDemo.tsx?raw';

export const scatterChartDoc: ComponentDoc = {
  ...getCatalogDoc('scatterchart'),
  title: 'ScatterChart',
  description: 'Точечная и пузырьковая диаграмма для сравнения числовых показателей.',
  usage:
    'Когда важна связь между двумя величинами, распределение наблюдений или выбросы. Размер пузырька добавляет третий показатель. Для последовательности во времени лучше LineChart, для сравнения категорий — BarChart.',
  primaryProps: ['series', 'xDomain', 'yDomain', 'label', 'maxBubbleRadius', 'visibleSeries'],
  adapterDescription:
    'ScatterChartAdapter предоставляет SVG, легенду, Tooltip, клавиатурную навигацию и таблицу без темы.',
  logicDescription:
    'buildScatterLayout рассчитывает координаты, отметки осей и радиусы без React и DOM. Площадь пузырька пропорциональна size.',
  notes: [
    <>
      Без size наблюдение становится обычной точкой. С size — пузырьком; нулевой размер остаётся
      только в таблице. Размеры сравниваются по всем сериям и не меняются при их скрытии.
    </>,
    <>
      Укажите конечные диапазоны xDomain и yDomain с min меньше max. Все координаты должны попадать
      в них. Отрицательные координаты допустимы, отрицательный size — нет.
    </>,
    <>
      ID серии уникален, ID наблюдения уникален внутри серии. Совпадающие координаты разрешены.
      Перекрытые точки можно просмотреть с клавиатуры или в таблице.
    </>,
    <>
      Tab переводит фокус на точку; стрелки и Home/End перемещают его в порядке данных. Escape
      закрывает Tooltip. Легенда скрывает серию, но не строки таблицы.
    </>,
    <>
      Без width и height размер определяется контейнером. Для фиксированного размера нужны оба
      свойства. Радиусы пропорционально уменьшаются, если не помещаются в область графика.
    </>,
    <>
      До шести серий получают разные цвета. Скрытие и перестановка сохраняют их; изменение набора ID
      может перераспределить палитру. Названия в Tooltip и таблице позволяют различать серии без
      опоры только на цвет.
    </>,
    <>
      pageSize ограничивает строки таблицы, а не точки графика. SVG рисует все наблюдения без
      прореживания. Для очень больших наборов сначала ограничьте или агрегируйте данные в
      приложении; это не Canvas-рендерер.
    </>,
  ],
  examples: [
    {
      id: 'scatter-basic',
      title: 'Точки: бюджет и заказы',
      description:
        'Сравните шесть кампаний двух каналов. По горизонтали бюджет, по вертикали заказы. Наведение или фокус показывает точные значения; легенда переключает каналы.',
      demo: <ScatterBasicDemo />,
      code: basicCode,
    },
    {
      id: 'scatter-bubble',
      title: 'Пузырьки: добавляем выручку',
      description:
        'Поле size задаёт выручку. У кампании B выручка в четыре раза больше, чем у A, поэтому площадь в четыре раза больше, а радиус — в два. Скройте серию: оставшиеся пузырьки не увеличатся. Кнопка вернёт обе серии.',
      demo: <ScatterBubbleDemo />,
      code: bubbleCode,
    },
    {
      id: 'scatter-empty',
      title: 'Пустые данные и нулевой размер',
      description:
        'Добавьте результаты: появится один пузырёк. Кампания без выручки останется в таблице со значением 0, но без видимого пузырька. Очистка возвращает пустое состояние.',
      demo: <ScatterEmptyDemo />,
      code: emptyCode,
    },
  ],
};

export function ScatterChartPage() {
  return <ComponentPage component="scatterchart" doc={scatterChartDoc} />;
}
