import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { buildTreemapLayout } from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { useChartPage } from '../../shared/useChartPage.tsx';
import { attachRef } from '../../shared/attachRef.ts';
import { TreemapContext } from './TreemapContext.tsx';
import {
  TreemapPlotAdapter,
  TreemapBreadcrumbAdapter,
  TreemapLocationAdapter,
  TreemapTableAdapter,
  TreemapPaginationAdapter,
  TreemapEmptyAdapter,
} from './TreemapParts.tsx';
import { treemapLabels } from './TreemapStatistics.tsx';
import type { TreemapAdapterProps } from './treemap.types.ts';

const percent = (ratio: number) => `${Number((ratio * 100).toFixed(1))}%`;

function TreemapRootAdapter({
  data,
  label,
  description,
  onRootChange,
  formatValue = String,
  formatPercent = percent,
  pageSize = 20,
  labels: overrides = {},
  slotProps = {},
  children,
  ...rest
}: TreemapAdapterProps) {
  const [view, setView] = useState({ data, rootId: data.id, revision: 0 });
  const current =
    view.data === data ? view : { data, rootId: data.id, revision: view.revision + 1 };
  if (current !== view) setView(current);
  const layout = useMemo(
    () => buildTreemapLayout({ data, rootId: current.rootId }),
    [data, current.rootId],
  );
  const labels = { ...treemapLabels, ...overrides };
  if (
    [label, ...Object.values(labels)].some((value) => typeof value !== 'string' || !value.trim())
  ) {
    throw new TypeError('Treemap labels must be nonempty strings');
  }
  if (typeof formatValue !== 'function' || typeof formatPercent !== 'function')
    throw new TypeError('Treemap formatters must be functions');
  if (description !== undefined && typeof description !== 'string')
    throw new TypeError('Treemap description must be a string');
  const page = useChartPage(layout.items, pageSize);
  const id = useId();
  const figure = useRef<HTMLElement>(null);
  const elements = useRef(new Map<string, HTMLElement>());
  const location = useRef<HTMLParagraphElement>(null);
  const pendingFocus = useRef<{ rootId: string; itemId?: string } | null>(null);
  useEffect(() => {
    if (pendingFocus.current?.rootId !== layout.root.id) return;
    const preferred = pendingFocus.current.itemId;
    const target = preferred
      ? elements.current.get(preferred)
      : elements.current.values().next().value;
    (target ?? location.current ?? figure.current)?.focus();
    pendingFocus.current = null;
  }, [layout]);
  function navigate(rootId: string) {
    if (rootId === layout.root.id) return;
    if (
      !layout.path.some((node) => node.id === rootId) &&
      !layout.items.some((item) => item.group && item.id === rootId)
    )
      return;
    const ancestor = layout.path.findIndex((node) => node.id === rootId);
    pendingFocus.current = {
      rootId,
      itemId: ancestor >= 0 ? layout.path[ancestor + 1]?.id : undefined,
    };
    setView({ data, rootId, revision: current.revision });
    onRootChange?.(rootId);
  }
  const context = {
    layout,
    labels,
    formatValue,
    formatPercent,
    slotProps,
    label,
    page,
    navigate,
    elements,
    location,
    plotKey: `${current.revision}:${layout.root.id}`,
  };
  const rootSlot = native(rest, ['role']);
  return (
    <figure
      {...rootSlot}
      tabIndex={rootSlot.tabIndex ?? -1}
      ref={(element) => {
        figure.current = element;
        if (element)
          return attachRef(element, rootSlot.ref, () => {
            figure.current = null;
          });
      }}
      data-ui="treemap"
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      <TreemapContext.Provider value={context}>
        {children === undefined ? (
          <>
            <TreemapBreadcrumbAdapter />
            <TreemapLocationAdapter />
            <TreemapEmptyAdapter />
            <TreemapPlotAdapter />
            <TreemapTableAdapter />
            <TreemapPaginationAdapter />
          </>
        ) : (
          children
        )}
      </TreemapContext.Provider>
    </figure>
  );
}

export const TreemapAdapter = Object.assign(TreemapRootAdapter, {
  Plot: TreemapPlotAdapter,
  Breadcrumb: TreemapBreadcrumbAdapter,
  Location: TreemapLocationAdapter,
  Table: TreemapTableAdapter,
  Pagination: TreemapPaginationAdapter,
  Empty: TreemapEmptyAdapter,
});
