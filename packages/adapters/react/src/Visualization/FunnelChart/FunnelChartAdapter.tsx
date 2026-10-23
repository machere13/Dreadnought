import { useId, useMemo, useRef, useState } from 'react';
import { buildFunnelLayout, getCollectionNavigation } from '@dreadnought/core';
import { ChartPagination, useChartPage } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { FunnelStageView } from './FunnelStageView.tsx';
import { FunnelTooltip, FunnelDataTable, funnelLabels } from './FunnelStatistics.tsx';
import type { FunnelChartAdapterProps } from './funnelChart.types.ts';

const percent = (ratio: number) => `${Number((ratio * 100).toFixed(1))}%`;

export function FunnelChartAdapter({
  data,
  label,
  description,
  formatValue = String,
  formatPercent = percent,
  pageSize = 20,
  labels: overrides = {},
  slotProps = {},
  ...rest
}: FunnelChartAdapterProps) {
  const layout = useMemo(() => buildFunnelLayout({ data }), [data]);
  const labels = { ...funnelLabels, ...overrides };
  if (
    [label, ...Object.values(labels)].some((value) => typeof value !== 'string' || !value.trim())
  ) {
    throw new TypeError('Funnel labels must be nonempty strings');
  }
  if (typeof formatValue !== 'function' || typeof formatPercent !== 'function') {
    throw new TypeError('Funnel formatters must be functions');
  }
  if (description !== undefined && typeof description !== 'string') {
    throw new TypeError('Funnel description must be a string');
  }
  const id = useId();
  const page = useChartPage(layout.stages, pageSize);
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
    <figure
      {...native(rest, ['role'])}
      data-ui="funnel-chart"
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      {!layout.stages.length && <p>{labels.empty}</p>}
      <div {...native(slotProps.plot)} data-ui="funnel-plot">
        {page.rows.map((stage) => {
          const name = `${stage.label}: ${formatValue(stage.value)}`;
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
                  content: <FunnelTooltip stage={stage} {...statistics} />,
                  open: openStage === stage.id,
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
      <FunnelDataTable stages={page.rows} label={label} {...statistics} />
      <ChartPagination {...page} slotProps={slotProps} />
    </figure>
  );
}
