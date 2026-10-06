import styles from './BarChart.module.css';
import { getChartSeriesIndex } from '../shared/getChartSeriesIndex.ts';

export const barChartPresentation = {
  root: 'dreadnought-text-bar-chart ' + styles.root,
  plotContainer: styles.plotContainer, plot: styles.plot, grid: styles.grid,
  scrollContainer: styles.scrollContainer,
  axisLabel: styles.axisLabel, bar: styles.bar,
  tooltipTable: styles.tooltipTable, tooltipMark: styles.tooltipMark,
  legend: styles.legend, legendButton: styles.legendButton, table: styles.table,
  pagination: styles.pagination, pageInput: styles.pageInput,
  seriesStyles: [styles.series1, styles.series2, styles.series3, styles.series4, styles.series5, styles.series6],
} as const;
export function getBarSeriesClass(id: string) {
  return barChartPresentation.seriesStyles[getChartSeriesIndex(id, barChartPresentation.seriesStyles.length)];
}
