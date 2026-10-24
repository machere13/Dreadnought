import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { PieBasicDemo } from './PieBasicDemo.tsx';
import basicCode from './PieBasicDemo.tsx?raw';
import { PieDonutDemo } from './PieDonutDemo.tsx';
import donutCode from './PieDonutDemo.tsx?raw';
import { PieEmptyDemo } from './PieEmptyDemo.tsx';
import emptyCode from './PieEmptyDemo.tsx?raw';
import { PieCompositionDemo } from './PieCompositionDemo.tsx';
import compositionCode from './PieCompositionDemo.tsx?raw';

export const pieChartDoc: ComponentDoc = {
  ...getCatalogDoc('piechart'),
  title: 'PieChart',
  description: 'Круговая и кольцевая диаграмма долей одного целого.',
  usage:
    'Когда нужно показать состав суммы из нескольких категорий. Для сравнения близких значений или большого числа категорий используйте BarChart или Table.',
  primaryProps: ['data', 'innerRadius', 'label', 'visibleItems', 'onVisibleItemsChange'],
  adapterDescription:
    'PieChartAdapter предоставляет SVG, легенду, Tooltip и исходную таблицу без темы. slotProps настраивает части.',
  logicDescription:
    'buildPieLayout вычисляет доли и углы секторов без React и SVG. Входной innerRadius — доля внешнего радиуса, выходной — абсолютный радиус.',
  notes: [
    <>
      Без children выводятся Plot, Empty, Legend и Table. Свои children заменяют набор и порядок частей,
      null оставляет подпись. usePieChart возвращает data, source полного набора, layout видимых
      категорий, visible/toggle, labels и slotProps. Неизвестные ID игнорируются. Части и хук
      работают внутри ближайшего PieChart[Adapter]. Empty выводит пустое состояние отдельно от Plot; пагинации у
      PieChart нет.
    </>,
    <>
      Plot.children получает slice, path, radius, innerRadius (абсолютный), active, defaultContent;
      координаты нормализованы к радиусу 100. tooltipContent получает slice, layout, defaultContent.
      null/undefined/false скрывают подсказку. Legend.children меняет содержимое кнопки через item,
      visible, defaultContent. Декоративный SVG скрыт от скринридера и указателя; исходный path
      поверх него сохраняет ref, область наведения, фокус и имя. Не выходите рисунком за эту область
      и не вкладывайте интерактивные элементы. Своя Table должна сохранять исходные значения,
      включая скрытые и нулевые. Данные передавайте неизменяемыми.
    </>,
    <>
      У каждой категории уникальный id и конечное неотрицательное value. Нулевые значения остаются в
      таблице и легенде, но не создают сектор.
    </>,
    <>
      Круг — innerRadius=0, кольцо — например 0.6. Допустимые значения от 0 включительно до 1 не
      включительно.
    </>,
    <>
      Доли в подсказке считаются среди видимых категорий. Скрытие не удаляет исходные данные из
      таблицы.
    </>,
    <>
      Tab переводит фокус на сектор, стрелки и Home/End перемещают его, Escape закрывает Tooltip.
    </>,
    <>
      Без width и height график адаптируется к контейнеру через ResizeObserver. Для фиксированного
      размера задайте оба свойства.
    </>,
    <>
      До шести категорий получают разные цвета; дальше палитра повторяется. Скрытие и перестановка
      сохраняют цвета, изменение набора ID может их перераспределить. Автоматического объединения
      категорий нет.
    </>,
  ],
  examples: [
    {
      id: 'pie-basic',
      title: 'Круг: доли источников посещений',
      description:
        'Четыре источника дают 1 000 посещений. Наведите на сектор или перейдите к нему с клавиатуры: подсказка покажет название, число и процент. Кнопка в легенде скрывает категорию.',
      demo: <PieBasicDemo />,
      code: basicCode,
    },
    {
      id: 'pie-donut',
      title: 'Кольцо и управляемая легенда',
      description:
        'innerRadius={0.6} оставляет отверстие. Видимые категории хранятся в состоянии приложения; кнопка возвращает все категории. Скройте две категории — оставшаяся займёт весь круг, её доля станет 100%.',
      demo: <PieDonutDemo />,
      code: donutCode,
    },
    {
      id: 'pie-empty',
      title: 'Нулевые данные и единственный сектор',
      description:
        'При нулевой сумме диаграмма показывает сообщение вместо выдуманных долей. Добавьте заказы: единственная категория займёт всё кольцо. Обнуление возвращает пустое состояние.',
      demo: <PieEmptyDemo />,
      code: emptyCode,
    },
    {
      id: 'pie-composition',
      title: 'Свой рисунок и состав частей',
      description:
        'Секторы дополнены штриховкой, легенда получила свои подписи, Tooltip — пояснение. Скройте категории: сумма над графиком и доли обновятся вместе. Кнопка возвращает категории, таблица сохраняет все исходные числа. Стрелки циклически переходят между видимыми секторами.',
      demo: <PieCompositionDemo />,
      code: compositionCode,
    },
  ],
};

export function PieChartPage() {
  return <ComponentPage component="piechart" doc={pieChartDoc} />;
}
