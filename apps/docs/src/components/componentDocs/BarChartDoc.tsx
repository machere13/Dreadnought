import { BarChart } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';
import styles from '../DocsPage.module.css';

const categories = [{ id: 'jan', label: 'Январь' }, { id: 'feb', label: 'Февраль' }, { id: 'mar', label: 'Март' }];
const series = [{ id: 'a', label: 'Вариант A', values: { jan: 60, feb: 85, mar: 70 } },
  { id: 'b', label: 'Вариант B', values: { jan: 40, feb: 60, mar: 90 } }];
export const barChartDoc: ComponentDoc = {
  ...getCatalogDoc('barchart'), title: 'BarChart',
  description: 'Группированные столбцы для сравнения категорий и нескольких серий.',
  adapterDescription: 'BarChartAdapter строит SVG, связывает столбцы с Tooltip и клавиатурой, показывает легенду и полную таблицу без темы.',
  logicDescription: 'buildBarLayout вычисляет координаты столбцов, нулевую ось и отметки шкалы. Расчёт не зависит от React, DOM или SVG.',
  footnote: <>domain включает ноль. null и пропуск не создают столбец; ноль обозначается на оси. orientation переключает направление; серии располагаются рядом, не суммируются. Tab выбирает столбцы, стрелки вдоль категориальной оси и Home/End перемещают фокус, Escape закрывает Tooltip. Легенда скрывает серии, но сохраняет их в таблице. Цвет Mark совпадает со столбцом. Для настройки используйте --dreadnought-bar-chart-* и slotProps. Без ResizeObserver задайте width/height; таблица доступна и при SSR. Stacked, zoom и brush пока не входят в компонент.</>,
  demo: <div className={styles.demo}><BarChart label="Сравнение по месяцам" description="Наведите на столбец или выберите его через Tab. Подсказка сравнивает видимые серии одной категории."
    categories={categories} series={series} domain={[0, 100]} categoryLabel="Месяц" valueLabel="Значение" /></div>,
};
