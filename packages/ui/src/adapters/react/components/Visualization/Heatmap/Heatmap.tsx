import { HeatmapAdapter, type HeatmapAdapterProps } from '@dreadnought/react/unstyled';
import {
  heatmapPresentation as appearance,
  getHeatmapCellStyle,
} from '#presentation/Visualization/Heatmap/heatmapPresentation.ts';
import type { HeatmapColorScale } from '#presentation/Visualization/Heatmap/heatmapPresentation.ts';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';
import { markPresentation } from '#presentation/DataDisplay/Mark/markPresentation.ts';
import { buttonPresentation } from '#presentation/Controls/Button/buttonPresentation.ts';

export type HeatmapProps = HeatmapAdapterProps & { colorScale?: HeatmapColorScale };
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');

export function Heatmap({
  colorScale = 'sequential',
  className,
  slotProps = {},
  ...props
}: HeatmapProps) {
  if (colorScale !== 'sequential' && colorScale !== 'diverging') {
    throw new TypeError('Heatmap colorScale must be sequential or diverging');
  }
  return (
    <HeatmapAdapter
      {...props}
      data-color-scale={colorScale}
      className={classes(appearance.root, className)}
      slotProps={{
        ...slotProps,
        viewport: {
          ...slotProps.viewport,
          className: classes(appearance.viewport, slotProps.viewport?.className),
        },
        grid: { ...slotProps.grid, className: classes(appearance.grid, slotProps.grid?.className) },
        axisLabel: {
          ...slotProps.axisLabel,
          className: classes(appearance.axisLabel, slotProps.axisLabel?.className),
        },
        cell: (cell) => {
          const slot = slotProps.cell?.(cell);
          return {
            ...slot,
            className: classes(appearance.cell, slot?.className),
            style: { ...getHeatmapCellStyle(cell.intensity, colorScale), ...slot?.style },
          };
        },
        tooltip: {
          ...slotProps.tooltip,
          className: classes(tooltipPresentation.root, slotProps.tooltip?.className),
        },
        tooltipTable: {
          ...slotProps.tooltipTable,
          className: classes(appearance.tooltipTable, slotProps.tooltipTable?.className),
        },
        tooltipMark: (cell) => {
          const slot = slotProps.tooltipMark?.(cell);
          const style = getHeatmapCellStyle(cell.intensity, colorScale);
          return {
            ...slot,
            className: classes(markPresentation.root, slot?.className),
            style: {
              '--dreadnought-mark-color': (style as Record<string, string>)['--heatmap-cell-bg'],
              ...slot?.style,
            },
          };
        },
        legend: {
          ...slotProps.legend,
          className: classes(appearance.legend, slotProps.legend?.className),
        },
        scale: {
          ...slotProps.scale,
          className: classes(appearance.scale, slotProps.scale?.className),
        },
        table: {
          ...slotProps.table,
          className: classes(
            'dreadnought-text-table',
            tablePresentation.root,
            appearance.table,
            slotProps.table?.className,
          ),
        },
        tableContainer: {
          ...slotProps.tableContainer,
          className: classes(appearance.tableContainer, slotProps.tableContainer?.className),
        },
        pagination: {
          ...slotProps.pagination,
          className: classes(appearance.pagination, slotProps.pagination?.className),
        },
        paginationButton: {
          ...slotProps.paginationButton,
          className: classes(
            buttonPresentation.root,
            buttonPresentation.variants.secondary,
            buttonPresentation.sizes.compact,
            slotProps.paginationButton?.className,
          ),
        },
        pageInput: {
          ...slotProps.pageInput,
          className: classes(appearance.pageInput, slotProps.pageInput?.className),
        },
      }}
    />
  );
}
