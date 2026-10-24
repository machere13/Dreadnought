import { useRef, useState } from 'react';
import { getCollectionNavigation, type SankeyLayout } from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { SankeyItemView } from './SankeyItemView.tsx';
import { SankeyTooltip, type SankeyStatisticsProps } from './SankeyStatistics.tsx';
import type { SankeyPlotProps } from './sankey.types.ts';

export function SankeyPlot({
  layout,
  children,
  tooltipContent,
  ...statistics
}: SankeyStatisticsProps & SankeyPlotProps & { layout: SankeyLayout }) {
  const { slotProps } = statistics;
  const [tabStop, setTabStop] = useState<string>();
  const [open, setOpen] = useState<string | null>(null);
  const interaction = useRef<string | null>(null);
  const elements = useRef(new Map<string, HTMLSpanElement>());
  const items = [...layout.nodes, ...layout.links];
  const candidates = items.map((item) => ({ value: `${item.kind}:${item.id}` }));
  const tabId = candidates.some((item) => item.value === tabStop) ? tabStop : candidates[0]?.value;
  return (
    <div {...native(slotProps.plot)} data-ui="sankey-scroll">
      <div
        style={{
          position: 'relative',
          width: layout.width,
          height: layout.height,
          margin: '8px auto',
        }}
      >
        {items.map((item) => {
          const key = `${item.kind}:${item.id}`;
          const context = {
            item,
            active: open === key,
            labels: statistics.labels,
            formatValue: statistics.formatValue,
          };
          const defaultContent = <SankeyTooltip item={item} {...statistics} />;
          const content = tooltipContent
            ? tooltipContent({ ...context, defaultContent })
            : defaultContent;
          const hasContent = content !== null && content !== undefined && content !== false;
          return (
            <SankeyItemView
              key={key}
              item={item}
              drawing={
                children &&
                ((geometry) =>
                  children({ ...context, active: context.active && hasContent, ...geometry }))
              }
              itemKey={key}
              layoutWidth={layout.width}
              tabIndex={key === tabId ? 0 : -1}
              statistics={statistics}
              elements={elements}
              activate={() => {
                interaction.current = key;
              }}
              focus={() => setTabStop(key)}
              navigate={(keyName) => {
                const next = getCollectionNavigation(candidates, key, keyName, {
                  orientation: 'horizontal',
                  loop: false,
                });
                if (next === undefined) return false;
                elements.current.get(next)?.focus();
                return true;
              }}
              tooltip={{
                ...native(slotProps.tooltip, ['ref']),
                content,
                open: open === key && hasContent,
                onOpenChange: (next) => {
                  if (next && interaction.current !== key) return;
                  setOpen((current) => (next ? key : current === key ? null : current));
                },
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
