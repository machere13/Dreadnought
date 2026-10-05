import styles from './RadarChart.module.css';

export const radarChartPresentation = {
  root: 'dreadnought-text-radar-chart ' + styles.root,
  plotContainer: styles.plotContainer,
  plot: styles.plot,
  grid: styles.grid,
  axis: styles.axis,
  axisLabel: styles.axisLabel,
  series: styles.series,
  point: styles.point,
  legend: styles.legend,
  legendButton: styles.legendButton,
  table: styles.table,
  seriesStyles: [styles.series1, styles.series2, styles.series3, styles.series4, styles.series5, styles.series6],
} as const;

export function getRadarSeriesClass(id: string) {
  let hash = 0;
  for (const character of id) hash = (Math.imul(hash, 31) + character.codePointAt(0)!) >>> 0;
  return radarChartPresentation.seriesStyles[hash % radarChartPresentation.seriesStyles.length];
}
