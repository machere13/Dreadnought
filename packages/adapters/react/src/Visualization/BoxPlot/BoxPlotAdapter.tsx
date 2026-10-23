import { useId, useMemo, useRef, useState } from 'react';
import { buildBoxPlotLayout, getCollectionNavigation } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { ChartPagination, useChartPage } from '../../shared/useChartPage.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { BoxPlotGlyph } from './BoxPlotGlyph.tsx';
import { BoxPlotTooltip, BoxPlotDataTable, boxPlotLabels } from './BoxPlotStatistics.tsx';
import type { BoxPlotAdapterProps } from './boxPlot.types.ts';

export function BoxPlotAdapter({
  data,
  domain,
  label,
  description,
  valueLabel = 'Значение',
  formatValue = String,
  pageSize = 20,
  labels: overrides = {},
  slotProps = {},
  ...rest
}: BoxPlotAdapterProps) {
  const layout = useMemo(
    () => buildBoxPlotLayout({ data, domain }),
    [data, domain?.[0], domain?.[1]],
  );
  const labels = { ...boxPlotLabels, ...overrides };
  if (
    [label, valueLabel, ...Object.values(labels)].some(
      (value) => typeof value !== 'string' || !value.trim(),
    )
  ) {
    throw new TypeError('BoxPlot labels must be nonempty strings');
  }
  if (typeof formatValue !== 'function')
    throw new TypeError('BoxPlot formatter must be a function');
  if (description !== undefined && typeof description !== 'string')
    throw new TypeError('BoxPlot description must be a string');
  const id = useId();
  const page = useChartPage(layout.groups, pageSize);
  const [tabStop, setTabStop] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const elements = useRef(new Map<string, HTMLSpanElement>());
  const interaction = useRef<string | null>(null);
  const candidates = page.rows
    .filter((group) => group.summary)
    .map((group) => ({ value: group.id }));
  const tabId = candidates.some((item) => item.value === tabStop) ? tabStop : candidates[0]?.value;
  if (openGroup !== null && !candidates.some((item) => item.value === openGroup)) {
    setOpenGroup(null);
  }
  return (
    <figure
      {...native(rest, ['role'])}
      data-ui="box-plot"
      aria-labelledby={`${id}-label`}
      aria-describedby={description === undefined ? undefined : `${id}-description`}
    >
      <figcaption id={`${id}-label`}>{label}</figcaption>
      {description !== undefined && <p id={`${id}-description`}>{description}</p>}
      {!layout.groups.length && <p>{labels.empty}</p>}
      <div {...native(slotProps.plot)} data-ui="box-plot-groups">
        {page.rows.map((group) => {
          const slot = native(slotProps.group?.(group), ['hidden', 'aria-hidden']);
          return (
            <div key={group.id}>
              <span>{group.label}</span>
              {group.summary ? (
                <TooltipAdapter
                  {...native(slotProps.tooltip, ['ref'])}
                  open={openGroup === group.id}
                  onOpenChange={(open) => {
                    if (open && interaction.current !== group.id) return;
                    setOpenGroup((current) =>
                      open ? group.id : current === group.id ? null : current,
                    );
                  }}
                  content={
                    <BoxPlotTooltip
                      group={group}
                      labels={labels}
                      formatValue={formatValue}
                      slotProps={slotProps}
                    />
                  }
                >
                  {(trigger) => (
                    <span
                      {...slot}
                      {...trigger}
                      role="img"
                      tabIndex={tabId === group.id ? 0 : -1}
                      aria-label={`${group.label}: ${labels.median} ${formatValue(group.summary!.median)}, ${labels.q1} ${formatValue(group.summary!.q1)}, ${labels.q3} ${formatValue(group.summary!.q3)}`}
                      data-ui="box-plot-group"
                      ref={(element) => {
                        trigger.ref(element);
                        if (!element) return;
                        elements.current.set(group.id, element);
                        return attachRef(element, slot.ref, () => {
                          trigger.ref(null);
                          elements.current.delete(group.id);
                        });
                      }}
                      onClick={(event) => {
                        slot.onClick?.(event);
                        if (!event.defaultPrevented) event.currentTarget.focus();
                      }}
                      onPointerEnter={(event) => {
                        slot.onPointerEnter?.(event);
                        if (event.defaultPrevented) return;
                        interaction.current = group.id;
                        trigger.onPointerEnter?.(event);
                      }}
                      onPointerLeave={(event) => {
                        slot.onPointerLeave?.(event);
                        if (!event.defaultPrevented) trigger.onPointerLeave?.(event);
                      }}
                      onFocus={(event) => {
                        slot.onFocus?.(event);
                        if (event.defaultPrevented) return;
                        interaction.current = group.id;
                        setTabStop(group.id);
                        event.currentTarget.scrollIntoView?.({
                          block: 'nearest',
                          inline: 'nearest',
                        });
                        trigger.onFocus?.(event);
                      }}
                      onBlur={(event) => {
                        slot.onBlur?.(event);
                        if (!event.defaultPrevented) trigger.onBlur?.(event);
                      }}
                      onKeyDown={(event) => {
                        slot.onKeyDown?.(event);
                        if (event.defaultPrevented || event.nativeEvent.isComposing) return;
                        trigger.onKeyDown?.(event);
                        if (event.defaultPrevented) return;
                        const next = getCollectionNavigation(candidates, group.id, event.key, {
                          orientation: 'vertical',
                          loop: false,
                        });
                        if (next !== undefined) {
                          event.preventDefault();
                          elements.current.get(next)?.focus();
                        }
                      }}
                    >
                      <BoxPlotGlyph group={group} slotProps={slotProps} />
                    </span>
                  )}
                </TooltipAdapter>
              ) : (
                <p>{labels.empty}</p>
              )}
            </div>
          );
        })}
      </div>
      {layout.domain && (
        <div {...native(slotProps.axis)} data-ui="box-plot-axis">
          <span>{valueLabel}</span>
          <svg width="100%" height="28" aria-hidden="true">
            {layout.ticks.map((tick, index) => (
              <text
                key={index}
                x={`${2 + tick.position * 96}%`}
                y={20}
                textAnchor={index === 0 ? 'start' : index === 4 ? 'end' : 'middle'}
                fill="currentColor"
              >
                {formatValue(tick.value)}
              </text>
            ))}
          </svg>
        </div>
      )}
      <BoxPlotDataTable
        groups={page.rows}
        label={label}
        labels={labels}
        formatValue={formatValue}
        slotProps={slotProps}
      />
      <ChartPagination {...page} slotProps={slotProps} />
    </figure>
  );
}
