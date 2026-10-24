import { useRef, useState } from 'react';
import { getCollectionNavigation } from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { FunnelStageView } from './FunnelStageView.tsx';
import { FunnelTooltip } from './FunnelStatistics.tsx';
import { useFunnelChart } from './FunnelChartContext.tsx';
import type { FunnelChartPlotProps } from './funnelChart.types.ts';

export function FunnelChartPlotAdapter({ children, tooltipContent }: FunnelChartPlotProps) {
  const { page, labels, formatValue, formatPercent, slotProps } = useFunnelChart();
  const [tabStop, setTabStop] = useState<string | null>(null);
  const [openStage, setOpenStage] = useState<string | null>(null);
  const interaction = useRef<string | null>(null);
  const elements = useRef(new Map<string, HTMLSpanElement>());
  const candidates = page.rows.map((stage) => ({ value: stage.id }));
  const tabId = candidates.some((item) => item.value === tabStop) ? tabStop : candidates[0]?.value;
  if (openStage !== null && !candidates.some((item) => item.value === openStage))
    setOpenStage(null);
  const statistics = { labels, formatValue, formatPercent, slotProps };
  return (
    <div {...native(slotProps.plot)} data-ui="funnel-plot">
      {page.rows.map((stage) => {
        const name = `${stage.label}: ${formatValue(stage.value)}`;
        const context = {
          stage,
          labels,
          formatValue,
          formatPercent,
          active: openStage === stage.id,
        };
        const defaultTooltip = <FunnelTooltip stage={stage} {...statistics} />;
        const content = tooltipContent
          ? tooltipContent({ ...context, defaultContent: defaultTooltip })
          : defaultTooltip;
        const hasContent = content !== null && content !== undefined && content !== false;
        return (
          <div key={stage.id}>
            <div data-ui="funnel-stage-label">
              <span>{stage.label}</span>
              <span>
                {formatValue(stage.value)} · {labels.fromFirst}:{' '}
                {stage.fromFirst === null ? '—' : formatPercent(stage.fromFirst)}
              </span>
            </div>
            <FunnelStageView
              stage={stage}
              active={context.active && hasContent}
              drawing={
                children &&
                ((defaultContent) =>
                  children({ ...context, active: context.active && hasContent, defaultContent }))
              }
              name={name}
              tabIndex={tabId === stage.id ? 0 : -1}
              slotProps={slotProps}
              elements={elements}
              activate={() => {
                interaction.current = stage.id;
              }}
              focus={() => setTabStop(stage.id)}
              navigate={(key) => {
                const next = getCollectionNavigation(candidates, stage.id, key, {
                  orientation: 'vertical',
                  loop: false,
                });
                if (next === undefined) return false;
                elements.current.get(next)?.focus();
                return true;
              }}
              tooltip={{
                ...native(slotProps.tooltip, ['ref']),
                content,
                open: openStage === stage.id && hasContent,
                onOpenChange: (open) => {
                  if (open && interaction.current !== stage.id) return;
                  setOpenStage((current) =>
                    open ? stage.id : current === stage.id ? null : current,
                  );
                },
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
