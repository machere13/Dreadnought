import styles from './ScatterChart.module.css';
import { getChartSeriesIndex } from '../shared/getChartSeriesIndex.ts';

export const scatterChartPresentation = styles;
const colors = [
  styles.series1,
  styles.series2,
  styles.series3,
  styles.series4,
  styles.series5,
  styles.series6,
];
export function getScatterSeriesClasses(ids: readonly string[]) {
  const result = new Map<string, string>();
  const used = new Set<number>();
  for (const id of [...new Set(ids)].sort()) {
    let index = getChartSeriesIndex(id, colors.length);
    if (used.size < colors.length) {
      while (used.has(index)) index = (index + 1) % colors.length;
    }
    used.add(index);
    result.set(id, colors[index]);
  }
  return result;
}
