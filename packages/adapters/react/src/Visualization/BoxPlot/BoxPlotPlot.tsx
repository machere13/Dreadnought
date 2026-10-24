import { useRef, useState } from 'react';
import { getCollectionNavigation } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { BoxPlotGlyph } from './BoxPlotGlyph.tsx';
import { BoxPlotTooltip } from './BoxPlotStatistics.tsx';
import { useBoxPlot } from './BoxPlotContext.tsx';
import type { BoxPlotPlotProps } from './boxPlot.types.ts';

export function BoxPlotPlotAdapter({ children, tooltipContent }: BoxPlotPlotProps) {
  const { page, labels, formatValue, slotProps } = useBoxPlot();
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
    <div {...native(slotProps.plot)} data-ui="box-plot-groups">
      {page.rows.map((group) => {
        const slot = native(slotProps.group?.(group), ['hidden', 'aria-hidden']);
        const context = { group, labels, formatValue, active: openGroup === group.id };
        const defaultTooltip = (
          <BoxPlotTooltip
            group={group}
            labels={labels}
            formatValue={formatValue}
            slotProps={slotProps}
          />
        );
        const content =
          group.summary && tooltipContent
            ? tooltipContent({ ...context, defaultContent: defaultTooltip })
            : defaultTooltip;
        const hasContent = content !== null && content !== undefined && content !== false;
        return (
          <div key={group.id}>
            <span>{group.label}</span>
            {group.summary ? (
              <TooltipAdapter
                {...native(slotProps.tooltip, ['ref'])}
                open={openGroup === group.id && hasContent}
                onOpenChange={(open) => {
                  if (open && interaction.current !== group.id) return;
                  setOpenGroup((current) =>
                    open ? group.id : current === group.id ? null : current,
                  );
                }}
                content={content}
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
                    {children ? (
                      <span
                        aria-hidden="true"
                        style={{ display: 'contents', pointerEvents: 'none' }}
                      >
                        {children({
                          ...context,
                          active: context.active && hasContent,
                          defaultContent: <BoxPlotGlyph group={group} slotProps={slotProps} />,
                        })}
                      </span>
                    ) : (
                      <BoxPlotGlyph group={group} slotProps={slotProps} />
                    )}
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
  );
}
