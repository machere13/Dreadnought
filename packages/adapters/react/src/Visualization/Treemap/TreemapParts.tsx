import { BreadcrumbAdapter } from '../../Navigation/Breadcrumb/BreadcrumbAdapter.tsx';
import { ButtonAdapter } from '../../Controls/Button/ButtonAdapter.tsx';
import { ChartPagination } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { useTreemapContext } from './TreemapContext.tsx';
import { TreemapPlot } from './TreemapPlot.tsx';
import { TreemapDataTable } from './TreemapStatistics.tsx';
import type { TreemapPlotProps } from './treemap.types.ts';

export function TreemapBreadcrumbAdapter() {
  const { layout, labels, slotProps, navigate } = useTreemapContext();
  const button = native(slotProps.navigationButton);
  return (
    <BreadcrumbAdapter
      {...native(slotProps.breadcrumb)}
      aria-label={labels.breadcrumb}
      slotClassNames={slotProps.breadcrumbClassNames}
      items={layout.path.map((node, index) => ({
        label:
          index === layout.path.length - 1 ? (
            node.label
          ) : (
            <ButtonAdapter
              {...button}
              type="button"
              onClick={(event) => {
                button.onClick?.(event);
                if (!event.defaultPrevented) navigate(node.id);
              }}
            >
              {node.label}
            </ButtonAdapter>
          ),
      }))}
    />
  );
}
export function TreemapLocationAdapter() {
  const { layout, formatValue, location } = useTreemapContext();
  return (
    <p ref={location} tabIndex={-1} data-ui="treemap-location" aria-live="polite">
      {layout.root.label}: {formatValue(layout.root.value)}
    </p>
  );
}
export function TreemapPlotAdapter(props: TreemapPlotProps) {
  const context = useTreemapContext();
  return context.layout.root.value === 0 ? null : (
    <TreemapPlot key={context.plotKey} {...context} {...props} />
  );
}
export function TreemapTableAdapter() {
  const { page, ...context } = useTreemapContext();
  return <TreemapDataTable {...context} rows={page.rows} />;
}
export function TreemapPaginationAdapter() {
  const { page, slotProps } = useTreemapContext();
  return <ChartPagination {...page} slotProps={slotProps} />;
}
export function TreemapEmptyAdapter() {
  const { layout, labels } = useTreemapContext();
  return layout.root.value === 0 ? <p>{labels.empty}</p> : null;
}
