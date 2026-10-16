import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from '../../../shared/types.ts';
import { RadarComparisonDemo } from './RadarComparisonDemo.tsx';
import comparisonCode from './RadarComparisonDemo.tsx?raw';
import { RadarAxesDemo } from './RadarAxesDemo.tsx';
import axesCode from './RadarAxesDemo.tsx?raw';
import { RadarReverseDemo } from './RadarReverseDemo.tsx';
import reverseCode from './RadarReverseDemo.tsx?raw';
export const radarChartDoc: ComponentDoc = {
  ...getCatalogDoc('radarchart'),
  title: 'RadarChart',
  usage:
    'Для сравнения профилей нескольких объектов по трём и более показателям. Для точного сравнения отдельных чисел используйте таблицу или BarChart.',
  primaryProps: ['metrics', 'series', 'visibleSeries', 'onVisibleSeriesChange', 'label'],
  description: 'Радарный график сравнения объектов по нескольким показателям.',
  adapterDescription:
    'RadarChartAdapter второго слоя оставляет ту же разметку и поведение без оформления. slotProps передаёт классы и нативные свойства частям.',
  logicDescription:
    'buildRadarLayout из core вычисляет оси и точки независимо от React. Используйте модель для собственной разметки или другого фреймворка.',
  notes: [
    <>Нужно не менее трёх metrics; ключи values соответствуют их id.</>,
    <>Задавайте width и height вместе либо оставьте оба для ResizeObserver.</>,
    <>Без него доступна таблица, для SVG нужны размеры.</>,
    <>Длинные подписи могут пересекаться.</>,
    <>
      Разные шкалы нормализуются по своим domain: площадь многоугольника не является итоговым
      баллом.
    </>,
  ],
  examples: [
    {
      id: 'radar-comparison',
      title: 'Сравнение версий и управляемая легенда',
      description:
        'Пять осей показывают условные оценки от 0 до 100 баллов. Нажмите версию в легенде, чтобы скрыть её: visibleSeries хранится в приложении, onVisibleSeriesChange обновляет его. Таблица сохраняет обе версии. «Показать все серии» возвращает их внешним изменением состояния.',
      demo: <RadarComparisonDemo />,
      code: comparisonCode,
    },
    {
      id: 'radar-axes',
      title: 'Треугольник, квадрат и другие формы',
      description:
        'Выберите от 3 до 6 осей — форма изменится вместе с набором показателей. Число сторон определяется metrics. Размер примера — 560 × 320; на узком экране контейнер прокручивается.',
      demo: <RadarAxesDemo />,
      code: axesCode,
    },
    {
      id: 'radar-reverse',
      title: 'Меньше — лучше: задержка сервиса',
      description:
        'Для задержки меньше — лучше: 60 мс расположены дальше от центра, чем 100 мс. Это задаёт reverse=true. Наведите курсор или перейдите Tab на вершину: Tooltip покажет исходное число; Escape закроет подсказку.',
      demo: <RadarReverseDemo />,
      code: reverseCode,
    },
  ],
};

export function RadarChartPage() {
  return <ComponentPage component="radarchart" doc={radarChartDoc} />;
}
