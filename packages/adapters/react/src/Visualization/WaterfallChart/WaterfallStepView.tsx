import type { ComponentProps, RefObject, ReactNode } from 'react';
import type { WaterfallStep } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import type { WaterfallChartSlotProps } from './waterfallChart.types.ts';

interface Props {
  drawing?: (context: ReactNode) => ReactNode;
  step: WaterfallStep;
  baseline: number;
  connector: boolean;
  tabIndex: number;
  value: string;
  slotProps: WaterfallChartSlotProps;
  elements: RefObject<Map<string, HTMLSpanElement>>;
  tooltip: Omit<ComponentProps<typeof TooltipAdapter>, 'children'>;
  activate: () => void;
  focus: () => void;
  navigate: (key: string) => boolean;
}
export function WaterfallStepView({
  drawing,
  step,
  baseline,
  connector,
  tabIndex,
  value,
  slotProps,
  elements,
  tooltip,
  activate,
  focus,
  navigate,
}: Props) {
  const slot = native(slotProps.step?.(step), ['hidden', 'aria-hidden', 'aria-labelledby']);
  const content = (
    <>
      <svg
        width="100%"
        height="240"
        viewBox="0 -2 100 104"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <line
          x1="0"
          x2="100"
          y1={baseline}
          y2={baseline}
          stroke="currentColor"
          strokeOpacity="0.4"
          vectorEffect="non-scaling-stroke"
          data-ui="waterfall-baseline"
        />
        <rect
          x="20"
          width="60"
          y={step.y}
          height={step.height}
          fill="currentColor"
          data-ui="waterfall-bar"
        />
        {step.height === 0 && (
          <line
            x1="20"
            x2="80"
            y1={step.y}
            y2={step.y}
            stroke="currentColor"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {connector && (
          <line
            x1="80"
            x2="120"
            y1={step.endY}
            y2={step.endY}
            stroke="currentColor"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
            data-ui="waterfall-connector"
          />
        )}
      </svg>
      <span data-ui="waterfall-step-label">
        {step.label}
        <span>{value}</span>
      </span>
    </>
  );
  return (
    <TooltipAdapter {...tooltip}>
      {(trigger) => (
        <span
          {...slot}
          {...trigger}
          role="img"
          tabIndex={tabIndex}
          aria-label={`${step.label}: ${value}`}
          data-ui="waterfall-step"
          data-tone={step.tone}
          ref={(element) => {
            trigger.ref(element);
            if (!element) return;
            elements.current.set(step.id, element);
            return attachRef(element, slot.ref, () => {
              trigger.ref(null);
              elements.current.delete(step.id);
            });
          }}
          onClick={(event) => {
            slot.onClick?.(event);
            if (!event.defaultPrevented) event.currentTarget.focus();
          }}
          onPointerEnter={(event) => {
            slot.onPointerEnter?.(event);
            if (!event.defaultPrevented) {
              activate();
              trigger.onPointerEnter?.(event);
            }
          }}
          onPointerLeave={(event) => {
            slot.onPointerLeave?.(event);
            if (!event.defaultPrevented) trigger.onPointerLeave?.(event);
          }}
          onFocus={(event) => {
            slot.onFocus?.(event);
            if (event.defaultPrevented) return;
            activate();
            focus();
            event.currentTarget.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
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
            if (!event.defaultPrevented && navigate(event.key)) event.preventDefault();
          }}
        >
          {drawing ? (
            <span aria-hidden="true" style={{ display: 'contents', pointerEvents: 'none' }}>
              {drawing(content)}
            </span>
          ) : (
            content
          )}
        </span>
      )}
    </TooltipAdapter>
  );
}
