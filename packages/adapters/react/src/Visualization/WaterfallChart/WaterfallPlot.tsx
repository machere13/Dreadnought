import { useRef, useState } from 'react';
import {
  getCollectionNavigation,
  type WaterfallLayout,
  type WaterfallStep,
} from '@dreadnought/core';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { WaterfallStepView } from './WaterfallStepView.tsx';
import {
  WaterfallTooltip,
  waterfallValue,
  type WaterfallStatisticsProps,
} from './WaterfallStatistics.tsx';
import type { WaterfallChartPlotProps } from './waterfallChart.types.ts';

export function WaterfallPlot({
  layout,
  steps,
  children,
  tooltipContent,
  ...statistics
}: WaterfallStatisticsProps &
  WaterfallChartPlotProps & { layout: WaterfallLayout; steps: WaterfallStep[] }) {
  const { slotProps, formatValue } = statistics;
  const [tabStop, setTabStop] = useState<string>();
  const [open, setOpen] = useState<string | null>(null);
  const interaction = useRef<string | null>(null);
  const elements = useRef(new Map<string, HTMLSpanElement>());
  const candidates = steps.map((step) => ({ value: step.id }));
  const tabId = candidates.some((item) => item.value === tabStop) ? tabStop : candidates[0]?.value;
  return (
    <div {...native(slotProps.plot)} data-ui="waterfall-plot">
      <div data-ui="waterfall-axis" aria-hidden="true">
        {layout.ticks.map((tick, index) => (
          <span key={index} style={{ top: `${((tick.position + 2) / 104) * 100}%` }}>
            {formatValue(tick.value)}
          </span>
        ))}
      </div>
      <div data-ui="waterfall-scroll">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${steps.length}, minmax(6rem, 1fr))`,
          }}
        >
          {steps.map((step, index) => {
            const context = {
              step,
              baseline: layout.baseline,
              connector: index < steps.length - 1,
              active: open === step.id,
              labels: statistics.labels,
              formatValue,
            };
            const defaultContent = <WaterfallTooltip step={step} {...statistics} />;
            const content = tooltipContent
              ? tooltipContent({ ...context, defaultContent })
              : defaultContent;
            const hasContent = content !== null && content !== undefined && content !== false;
            return (
              <WaterfallStepView
                key={step.id}
                step={step}
                drawing={
                  children &&
                  ((defaultContent) =>
                    children({ ...context, active: context.active && hasContent, defaultContent }))
                }
                baseline={layout.baseline}
                connector={index < steps.length - 1}
                value={waterfallValue(step, formatValue)}
                tabIndex={tabId === step.id ? 0 : -1}
                slotProps={slotProps}
                elements={elements}
                activate={() => {
                  interaction.current = step.id;
                }}
                focus={() => setTabStop(step.id)}
                navigate={(key) => {
                  const next = getCollectionNavigation(candidates, step.id, key, {
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
                  open: open === step.id && hasContent,
                  onOpenChange: (next) => {
                    if (next && interaction.current !== step.id) return;
                    setOpen((current) => (next ? step.id : current === step.id ? null : current));
                  },
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
