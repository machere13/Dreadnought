import type { CSSProperties } from 'react';
import { TreemapAdapter, type TreemapAdapterProps } from '@dreadnought/react/unstyled';
import { treemapPresentation as appearance } from '#presentation/Visualization/Treemap/index.ts';
import { breadcrumbPresentation as breadcrumb } from '#presentation/Navigation/Breadcrumb/breadcrumbPresentation.ts';
import { tablePresentation } from '#presentation/DataDisplay/Table/tablePresentation.ts';
import { tooltipPresentation } from '#presentation/Overlays/Tooltip/tooltipPresentation.ts';
import { markPresentation } from '#presentation/DataDisplay/Mark/markPresentation.ts';
import { buttonPresentation } from '#presentation/Controls/Button/buttonPresentation.ts';

export type TreemapProps = TreemapAdapterProps;
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ');
const tone = (index: number): CSSProperties =>
  ({
    '--dreadnought-treemap-active': `var(--dreadnought-treemap-color-${(index % 6) + 1})`,
  }) as CSSProperties;

export function Treemap({ className, slotProps = {}, ...props }: TreemapProps) {
  return (
    <TreemapAdapter
      {...props}
      className={classes(appearance.root, className)}
      slotProps={{
        ...slotProps,
        plot: { ...slotProps.plot, className: classes(appearance.plot, slotProps.plot?.className) },
        tile: (item) => {
          const slot = slotProps.tile?.(item);
          return {
            ...slot,
            className: classes(appearance.tile, slot?.className),
            style: { ...tone(item.categoryIndex), ...slot?.style },
          };
        },
        breadcrumb: {
          ...slotProps.breadcrumb,
          className: classes(breadcrumb.root, slotProps.breadcrumb?.className),
        },
        breadcrumbClassNames: {
          list: classes(breadcrumb.list, slotProps.breadcrumbClassNames?.list),
          item: classes(breadcrumb.item, slotProps.breadcrumbClassNames?.item),
          link: classes(breadcrumb.link, slotProps.breadcrumbClassNames?.link),
          current: classes(breadcrumb.current, slotProps.breadcrumbClassNames?.current),
        },
        navigationButton: {
          ...slotProps.navigationButton,
          className: classes(
            buttonPresentation.root,
            buttonPresentation.variants.ghosted,
            buttonPresentation.sizes.compact,
            appearance.navigationButton,
            slotProps.navigationButton?.className,
          ),
        },
        tooltip: (item) => {
          const slot = slotProps.tooltip?.(item);
          return {
            ...slot,
            className: classes(tooltipPresentation.root, appearance.tooltip, slot?.className),
            style: { ...tone(item.categoryIndex), ...slot?.style },
          };
        },
        tooltipTable: {
          ...slotProps.tooltipTable,
          className: classes(appearance.tooltipTable, slotProps.tooltipTable?.className),
        },
        tooltipMark: {
          ...slotProps.tooltipMark,
          className: classes(
            markPresentation.root,
            appearance.mark,
            slotProps.tooltipMark?.className,
          ),
        },
        tableContainer: {
          ...slotProps.tableContainer,
          className: classes(appearance.tableContainer, slotProps.tableContainer?.className),
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
