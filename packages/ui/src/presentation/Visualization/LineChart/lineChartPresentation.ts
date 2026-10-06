import styles from './LineChart.module.css';
import { getChartSeriesIndex } from '../shared/getChartSeriesIndex.ts';

export const lineChartPresentation = {
  root: 'dreadnought-text-line-chart ' + styles.root,
  plotContainer: styles.plotContainer, plot: styles.plot, grid: styles.grid,
  axisLabel: styles.axisLabel, series: styles.series, point: styles.point,
  tooltipTable: styles.tooltipTable, tooltipMark: styles.tooltipMark,
  legend: styles.legend, legendButton: styles.legendButton, table: styles.table,
  pagination: styles.pagination, pageInput: styles.pageInput, rangeControls: styles.rangeControls, rangeInput: styles.rangeInput,
  seriesStyles: [styles.series1, styles.series2, styles.series3, styles.series4, styles.series5, styles.series6],
} as const;
export function getLineSeriesClass(id: string) {
  return lineChartPresentation.seriesStyles[getChartSeriesIndex(id, lineChartPresentation.seriesStyles.length)];
}
