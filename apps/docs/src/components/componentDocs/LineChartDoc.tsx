import { LineChart } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
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
  logicDescription: 'buildLineLayout готовит полные данные; sampleLineLayout сокращает геометрию по ширине экрана, getLinePointAtX двоичным поиском находит точный исходный X. Расчёты независимы от React, DOM и SVG.',
  footnote: <>null по Y разрывает линию. X уникален внутри серии. Большие наборы сокращаются только для рисования: сохраняются пики и впадины в каждом пиксельном столбце, разрывы не соединяются. Tooltip и таблица используют исходные значения. Два ползунка выбирают диапазон X; zoom=false их скрывает. Стрелки и Home/End проходят исходные точки выбранного диапазона; Escape закрывает подсказку. Таблица показывает pageSize строк на странице (50 по умолчанию). Данные передавайте неизменяемыми. Перерасчёт происходит при замене данных, размеров или диапазона, не при каждом наведении. Стоимость зависит и от числа серий; неограниченный объём не гарантируется. Для настройки используйте --dreadnought-line-chart-* и slotProps. Без ResizeObserver задайте width/height. Brush и сглаживание пока не входят в компонент.</>,
  demo: <div className={styles.demo}><LineChart label="Измерения" description="Наведите между точками или выберите точку через Tab. Легенда скрывает серии, но не удаляет их из таблицы."
    series={series} xDomain={[0, 10]} yDomain={[0, 100]} xLabel="Время" yLabel="Значение" /></div>,
};
