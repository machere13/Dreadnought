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
  description:
    'Сравнивает несколько объектов по набору показателей. Каждый показатель — ось со своим диапазоном, каждый объект — серия. Для точного сравнения чисел используйте таблицу под графиком.',
  adapterDescription:
    'RadarChartAdapter второго слоя оставляет ту же разметку и поведение без оформления. slotProps передаёт классы и нативные свойства частям.',
  logicDescription:
    'buildRadarLayout из core вычисляет оси и точки независимо от React. Используйте модель для собственной разметки или другого фреймворка.',
  footnote: (
    <>
      Нужно не менее трёх metrics; ключи values соответствуют их id. Задавайте width и height вместе
      либо оставьте оба для ResizeObserver. Без него доступна таблица, для SVG нужны размеры.
      Длинные подписи могут пересекаться. Разные шкалы нормализуются по своим domain: площадь
      многоугольника не является итоговым баллом.
    </>
  ),
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
        'Выберите 3, 4, 5 или 6 осей. Форма определяется количеством элементов metrics, а не отдельным типом графика. Пример выбирает показатели и собирает соответствующие values; поддержка не ограничена треугольником. Размер задан 560 × 320, на узком экране внешний контейнер прокручивается.',
      demo: <RadarAxesDemo />,
      code: axesCode,
    },
    {
      id: 'radar-reverse',
      title: 'Меньше — лучше: задержка сервиса',
      description:
        'Качество и покрытие растут к краю графика. Для задержки domain=[0, 200] и reverse=true разворачивают направление: 60 мс лучше 100 мс и расположено дальше от центра. Tooltip и таблица всё равно показывают исходные 60 и 100, не проценты нормализации. Наведение или Tab на вершину открывает Tooltip, Escape закрывает его.',
      demo: <RadarReverseDemo />,
      code: reverseCode,
    },
  ],
};

export function RadarChartPage() {
  return <ComponentPage component="radarchart" doc={radarChartDoc} />;
}
