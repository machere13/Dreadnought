import { useState } from 'react';
import { RadarChartAdapter } from '@dreadnought/react/unstyled';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
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
    <RadarChartAdapter label="Сравнение вариантов" description="Нажмите на серию, чтобы скрыть или вернуть её. Таблица всегда показывает все исходные значения."
      metrics={metrics} series={series} visibleSeries={visible} onVisibleSeriesChange={setVisible} className={styles.radarDemo}
      slotProps={{ plotContainer: { className: styles.radarViewport }, plot: { className: styles.radarPlot }, grid: { className: styles.radarGrid },
        axis: () => ({ className: styles.radarAxis }), axisLabel: () => ({ className: styles.radarAxisLabel }),
        series: item => ({ className: item.id === 'A' ? styles.radarSeriesA : styles.radarSeriesB }),
        legend: { className: styles.demoRow }, legendButton: () => ({ className: styles.coreDemoButton }), table: { className: styles.radarTable } }} />
  </div>;
}
export const radarChartDoc: ComponentDoc = {
  ...getCatalogDoc('radarchart'), title: 'RadarChartAdapter',
  description: 'Сравнение серий по явным диапазонам показателей. Адаптер второго слоя создаёт SVG, легенду и полную таблицу данных без готовой темы.',
  adapterDescription: 'slotProps передаёт классы и нативные свойства частям. Геометрией и доступной разметкой владеет адаптер; оформление этого демо принадлежит сайту документации.',
  logicDescription: 'buildRadarLayout из core вычисляет оси и точки независимо от React. Используйте модель для собственной разметки или другого фреймворка.',
  footnote: <>Готовый RadarChart и UI-тема ещё не выпущены. Задавайте width и height вместе либо оставьте оба: ResizeObserver измерит контейнер, высота будет 80% ширины. Без ResizeObserver данные остаются доступны, для SVG нужны фиксированные размеры. Длинные SVG-подписи могут пересекаться — полные названия и значения сохранены в таблице.</>,
  demo: <RadarDemo />,
};
