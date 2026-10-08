import styles from './RadarChart.module.css';
import { getChartSeriesIndex } from '../shared/getChartSeriesIndex.ts';

export const radarChartPresentation = {
  root: 'dreadnought-text-radar-chart ' + styles.root,
  plotContainer: styles.plotContainer,
  plot: styles.plot,
  grid: styles.grid,
  axis: styles.axis,
  axisLabel: styles.axisLabel,
  series: styles.series,
  point: styles.point,
  tooltipTable: styles.tooltipTable,
  tooltipMark: styles.tooltipMark,
  legend: styles.legend,
  legendButton: styles.legendButton,
  table: styles.table,
  seriesStyles: [
    styles.series1,
    styles.series2,
    styles.series3,
    styles.series4,
    styles.series5,
    styles.series6,
  ],
} as const;

export function getRadarSeriesClass(id: string) {
  return radarChartPresentation.seriesStyles[
    getChartSeriesIndex(id, radarChartPresentation.seriesStyles.length)
  ];
}
