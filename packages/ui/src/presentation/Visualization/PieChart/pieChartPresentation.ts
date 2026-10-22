import styles from './PieChart.module.css';
import { getChartSeriesIndex } from '../shared/getChartSeriesIndex.ts';

export const pieChartPresentation = styles;
const colors = [
  styles.color1,
  styles.color2,
  styles.color3,
  styles.color4,
  styles.color5,
  styles.color6,
];
export function getPieItemClasses(ids: readonly string[]) {
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
