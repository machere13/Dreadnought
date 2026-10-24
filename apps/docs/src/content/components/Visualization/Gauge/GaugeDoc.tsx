import { ComponentPage } from '../../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../../shared/types.ts';
import { GaugeBasicDemo } from './GaugeBasicDemo.tsx';
import basicCode from './GaugeBasicDemo.tsx?raw';
import { GaugeCircleDemo } from './GaugeCircleDemo.tsx';
import circleCode from './GaugeCircleDemo.tsx?raw';
import { GaugeRangeDemo } from './GaugeRangeDemo.tsx';
import rangeCode from './GaugeRangeDemo.tsx?raw';
import { GaugeStatesDemo } from './GaugeStatesDemo.tsx';
import statesCode from './GaugeStatesDemo.tsx?raw';
import { GaugeCompositionDemo } from './GaugeCompositionDemo.tsx';
import compositionCode from './GaugeCompositionDemo.tsx?raw';

export const gaugeDoc: ComponentDoc = {
  ...getCatalogDoc('gauge'),
  title: 'Gauge',
  description: 'Один показатель на шкале с понятными границами и состоянием.',
  usage:
    'Покажите загрузку, температуру, расход лимита или выполнение плана. Пороги помогают прочитать состояние показателя. Для сравнения категорий используйте BarChart, для изменения во времени — LineChart, для процесса выполнения — Progress.',
  primaryProps: ['value', 'min', 'max', 'thresholds', 'variant', 'formatValue'],
  adapterDescription:
    'GaugeAdapter рисует SVG и связывает фокус, наведение и нажатие с Tooltip. Список диапазонов использует Mark. Тема подключается отдельно.',
  logicDescription:
    'buildGaugeLayout рассчитывает долю диапазона, углы шкалы и порогов, направление стрелки и текущее состояние без React и DOM.',
  notes: [
    <>
      Композиция: Gauge.Plot заменяет рисунок и tooltipContent; Gauge.Legend меняет содержимое
      диапазонов. useGauge даёт рассчитанную layout, active, labels и formatValue внутри Gauge.
      children корня заменяет стандартные части; null убирает их.
    </>,
    <>
      Рисунок Plot декоративный, без кнопок и обработчиков: внешний span сохраняет фокус, ref,
      доступное название и Tooltip. Возврат null из tooltipContent отключает подсказку.
      defaultContent позволяет дополнить готовую разметку.
    </>,
    <>
      value — конечное число внутри min/max или null для отсутствующих данных. По умолчанию диапазон
      0–100; min должен быть меньше max. Числа вне диапазона, NaN и Infinity отклоняются. Ноль
      остаётся полноценным значением со стрелкой.
    </>,
    <>
      thresholds — упорядоченные диапазоны с уникальными id, названием label и верхней границей to.
      Первый начинается в min, каждый следующий — после предыдущего, последний заканчивается в max.
      Граница относится к следующему диапазону, сам max — к последнему.
    </>,
    <>
      semicircle показывает 180°, circle — 270° с разрывом 90°, чтобы начало и конец отличались. Без
      порогов дуга заполняется до текущего значения. С порогами видна вся шкала диапазонов, стрелка
      показывает положение, название под ней — состояние.
    </>,
    <>
      Tab переводит фокус на шкалу и открывает Tooltip. Escape закрывает подсказку; наведение и
      нажатие также показывают детали. При обновлении value фокус сохраняется, содержимое открытой
      подсказки обновляется. При null стрелки и подсказки нет.
    </>,
    <>
      formatValue добавляет единицы и форматирует все числа, включая границы диапазонов. Цвета
      доступны через --dreadnought-gauge-*. Названия диапазонов и текущее состояние дополняют цвет.
      labels переводит подписи Tooltip и пустое состояние.
    </>,
  ],
  examples: [
    {
      id: 'basic',
      title: 'Понять, когда показатель требует внимания',
      description:
        'Загрузка 72% находится между 60% и 80%. «Внимание» видно под шкалой и в списке диапазонов. Наведите или переведите фокус на шкалу, чтобы увидеть точное значение и границы.',
      demo: <GaugeBasicDemo />,
      code: basicCode,
    },
    {
      id: 'circle',
      title: 'Показать план в своих единицах',
      description:
        '138 из 200 задач — это 69% шкалы. variant="circle" меняет геометрию; сами данные остаются количеством задач, а не процентом.',
      demo: <GaugeCircleDemo />,
      code: circleCode,
    },
    {
      id: 'range',
      title: 'Задать отрицательный минимум',
      description:
        '−5 °C находится между −20 и 0. Стрелка использует весь диапазон −20…40, а не считает положение от нуля. Границы 0 и 25 переходят в следующий диапазон.',
      demo: <GaugeRangeDemo />,
      code: rangeCode,
    },
    {
      id: 'states',
      title: 'Отличить ноль от отсутствующего значения',
      description:
        'Изменяйте значение от 0 до 100. Кнопка «Убрать значение» передаёт null: стрелка исчезает, появляется «Нет данных». Верните ноль — стрелка снова покажет минимум.',
      demo: <GaugeStatesDemo />,
      code: statesCode,
    },
    {
      id: 'composition',
      title: 'Своя шкала с готовым поведением',
      description:
        'Дуга заменена линейной шкалой: 72% и «Внимание» берутся из общей модели. Tab открывает подробности, Escape закрывает. Подпись и список диапазонов читают тот же контекст; код ниже — работающий пример.',
      demo: <GaugeCompositionDemo />,
      code: compositionCode,
    },
  ],
};
export function GaugePage() {
  return <ComponentPage component="gauge" doc={gaugeDoc} />;
}
