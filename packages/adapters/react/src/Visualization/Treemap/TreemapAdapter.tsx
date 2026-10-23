import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { buildTreemapLayout } from '@dreadnought/core';
import { BreadcrumbAdapter } from '../../Navigation/Breadcrumb/BreadcrumbAdapter.tsx';
import { ButtonAdapter } from '../../Controls/Button/ButtonAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { TreemapPlot } from './TreemapPlot.tsx';
import { TreemapDataTable, treemapLabels } from './TreemapStatistics.tsx';
import type { TreemapAdapterProps } from './treemap.types.ts';

const percent = (ratio: number) => `${Number((ratio * 100).toFixed(1))}%`;

export function TreemapAdapter({
  data,
  label,
  description,
  onRootChange,
  formatValue = String,
  formatPercent = percent,
  pageSize = 20,
  labels: overrides = {},
  slotProps = {},
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
  const id = useId();
  const elements = useRef(new Map<string, HTMLElement>());
  const location = useRef<HTMLParagraphElement>(null);
  const pendingFocus = useRef<{ rootId: string; itemId?: string } | null>(null);
  useEffect(() => {
    if (pendingFocus.current?.rootId !== layout.root.id) return;
    const preferred = pendingFocus.current.itemId;
    const target = preferred
      ? elements.current.get(preferred)
      : elements.current.values().next().value;
    (target ?? location.current)?.focus();
    pendingFocus.current = null;
  }, [layout]);
  function navigate(rootId: string) {
    if (rootId === layout.root.id) return;
    const ancestor = layout.path.findIndex((node) => node.id === rootId);
    pendingFocus.current = {
      rootId,
      itemId: ancestor >= 0 ? layout.path[ancestor + 1]?.id : undefined,
    };
    setView({ data, rootId, revision: current.revision });
    onRootChange?.(rootId);
  }
  const statistics = { layout, labels, formatValue, formatPercent, slotProps };
  const button = native(slotProps.navigationButton);
  return (
    <figure
      {...native(rest, ['role'])}
      data-ui="treemap"
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
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
      <p ref={location} tabIndex={-1} data-ui="treemap-location" aria-live="polite">
        {layout.root.label}: {formatValue(layout.root.value)}
      </p>
      {layout.root.value === 0 ? (
        <p>{labels.empty}</p>
      ) : (
        <TreemapPlot
          key={`${current.revision}:${layout.root.id}`}
          {...statistics}
          elements={elements}
          navigate={navigate}
        />
      )}
      <TreemapDataTable {...statistics} label={label} pageSize={pageSize} navigate={navigate} />
    </figure>
  );
}
