import { LineChart } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

const series = [
  { id: 'a', label: 'Вариант A', data: [{ x: 0, y: 20 }, { x: 2, y: 45 }, { x: 4, y: 35 }, { x: 6, y: 70 }, { x: 8, y: 60 }, { x: 10, y: 85 }] },
  { id: 'b', label: 'Вариант B', data: [{ x: 0, y: 40 }, { x: 2, y: 30 }, { x: 4, y: 65 }, { x: 6, y: 50 }, { x: 8, y: 80 }, { x: 10, y: 70 }] },
];
export const lineChartDoc: ComponentDoc = {
  ...getCatalogDoc('linechart'), title: 'LineChart',
  description: 'Линейный график с числовыми шкалами, несколькими сериями и явными диапазонами.',
  adapterDescription: 'LineChartAdapter строит SVG, связывает наведение и клавиатуру с Tooltip и оставляет разметку без темы.',
  logicDescription: 'buildLineLayout вычисляет шкалы, точки и разрывы; getClosestLinePoint ищет ближайшую точку. Обе функции независимы от React, DOM и SVG.',
  footnote: <>null по Y разрывает линию. X уникален внутри серии. Tooltip показывает видимые серии с таким же X, без интерполяции пропусков. Стрелки влево/вправо и Home/End перемещают фокус; Escape закрывает подсказку. Цвета и рисунки линий привязаны к ID. Для настройки одного графика используйте --dreadnought-line-chart-* и slotProps. Без ResizeObserver задайте width/height; таблица остаётся доступна в любом случае. Zoom, brush и автоматическое сокращение больших данных пока не входят в компонент.</>,
  demo: <div className={styles.demo}><LineChart label="Измерения" description="Наведите между точками или выберите точку через Tab. Легенда скрывает серии, но не удаляет их из таблицы."
    series={series} xDomain={[0, 10]} yDomain={[0, 100]} xLabel="Время" yLabel="Значение" /></div>,
};
