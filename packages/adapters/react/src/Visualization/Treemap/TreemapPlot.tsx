import { useRef, useState, type RefObject } from 'react';
import { getCollectionNavigation } from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { TreemapTile } from './TreemapTile.tsx';
import { TreemapTooltip, type TreemapStatisticsProps } from './TreemapStatistics.tsx';

export function TreemapPlot({
  elements,
  navigate,
  ...props
}: TreemapStatisticsProps & {
  elements: RefObject<Map<string, HTMLElement>>;
  navigate: (id: string) => void;
}) {
  const { layout, slotProps } = props;
  const [tabStop, setTabStop] = useState<string>();
  const [open, setOpen] = useState<string | null>(null);
  const interaction = useRef<string | undefined>(undefined);
  const items = layout.items.filter(
    (item) => item.rect && item.rect.width > 0 && item.rect.height > 0,
  );
  const candidates = items.map((item) => ({ value: item.id }));
  const tabId = candidates.some((item) => item.value === tabStop) ? tabStop : candidates[0]?.value;
  return (
    <div
      {...native(slotProps.plot)}
      data-ui="treemap-plot"
      style={{
        ...slotProps.plot?.style,
        position: 'relative',
        width: '100%',
        aspectRatio: `${layout.width} / ${layout.height}`,
      }}
    >
      {items.map((item) => (
        <TreemapTile
          key={item.id}
          item={item}
          {...props}
          width={layout.width}
          height={layout.height}
          tabIndex={item.id === tabId ? 0 : -1}
          elements={elements}
          activate={() => {
            interaction.current = item.id;
          }}
          focus={() => setTabStop(item.id)}
          drill={() => navigate(item.id)}
          navigate={(key) => {
            const next = getCollectionNavigation(candidates, item.id, key, {
              orientation: key === 'ArrowLeft' || key === 'ArrowRight' ? 'horizontal' : 'vertical',
              loop: false,
            });
            if (next === undefined) return false;
            elements.current.get(next)?.focus();
            return true;
          }}
          tooltip={{
            ...native(slotProps.tooltip?.(item), ['ref']),
            content: <TreemapTooltip item={item} {...props} />,
            open: open === item.id,
            onOpenChange: (next) => {
              if (next && interaction.current !== item.id) return;
              setOpen((current) => (next ? item.id : current === item.id ? null : current));
            },
          }}
        />
      ))}
    </div>
  );
}
