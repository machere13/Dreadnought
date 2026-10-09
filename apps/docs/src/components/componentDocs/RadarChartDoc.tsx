import { useState } from 'react';
import { RadarChart } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

const metrics = [
  { id: 'quality', label: 'Качество', domain: [0, 100] as const },
  { id: 'coverage', label: 'Покрытие', domain: [0, 100] as const },
  { id: 'latency', label: 'Задержка, мс', domain: [0, 200] as const, reverse: true },
];
const series = [
  { id: 'A', label: 'Вариант A', values: { quality: 80, coverage: 70, latency: 60 } },
  { id: 'B', label: 'Вариант B', values: { quality: 60, coverage: 90, latency: 100 } },
];
function RadarDemo() {
  const [visible, setVisible] = useState(series.map(item => item.id));
  return <div className={styles.demo}>
    <RadarChart label="Сравнение вариантов" description="Наведите на точку или выберите её через Tab: подсказка покажет показатель и строки видимых серий — цветной маркер, название и исходное значение. Escape закрывает подсказку. Нажмите на серию в легенде, чтобы скрыть или вернуть её."
      metrics={metrics} series={series} visibleSeries={visible} onVisibleSeriesChange={setVisible} />
  </div>;
}
export const radarChartDoc: ComponentDoc = {
  ...getCatalogDoc('radarchart'), title: 'RadarChart',
  description: 'Сравнение серий по явным диапазонам показателей. Готовый компонент объединяет SVG, легенду и полную таблицу данных с оформлением через токены.',
  adapterDescription: 'RadarChartAdapter второго слоя оставляет ту же разметку и поведение без оформления. slotProps передаёт классы и нативные свойства частям.',
  logicDescription: 'buildRadarLayout из core вычисляет оси и точки независимо от React. Используйте модель для собственной разметки или другого фреймворка.',
  footnote: <>Задавайте width и height вместе либо оставьте оба: ResizeObserver измерит контейнер, высота будет 80% ширины. Без ResizeObserver данные остаются доступны, для SVG нужны фиксированные размеры. Длинные SVG-подписи могут пересекаться — полные названия и значения сохранены в таблице. Цвет и рисунок линии привязаны к ID; шесть сочетаний могут повторяться. Для отдельного графика переопределяйте --dreadnought-radar-chart-* в своей CSS-области. Это не изменяет другие графики.</>,
  demo: <RadarDemo />,
};
