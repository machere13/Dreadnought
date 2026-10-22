import type { CSSProperties } from 'react';
import styles from './Heatmap.module.css';

export const heatmapPresentation = styles;
export type HeatmapColorScale = 'sequential' | 'diverging';

export function getHeatmapCellStyle(
  intensity: number | null,
  scale: HeatmapColorScale,
): CSSProperties {
  let background = 'var(--dreadnought-heatmap-missing-bg)';
  let foreground = 'var(--dreadnought-heatmap-text)';
  if (intensity !== null) {
    const diverging = scale === 'diverging';
    const start = diverging ? (intensity <= 0.5 ? 'negative' : 'middle') : 'low';
    const end = diverging ? (intensity <= 0.5 ? 'middle' : 'positive') : 'high';
    const fraction = diverging ? (intensity <= 0.5 ? intensity * 2 : intensity * 2 - 1) : intensity;
    background = `color-mix(in srgb, var(--dreadnought-heatmap-${start}), var(--dreadnought-heatmap-${end}) ${fraction * 100}%)`;
    foreground =
      diverging || intensity >= 0.42
        ? 'var(--dreadnought-heatmap-text-on-light)'
        : 'var(--dreadnought-heatmap-text-on-dark)';
  }
  return { '--heatmap-cell-bg': background, '--heatmap-cell-text': foreground } as CSSProperties;
}
