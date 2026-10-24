import type { ComponentProps, RefObject, ReactNode } from 'react';
import type { FunnelStage } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import type { FunnelChartSlotProps } from './funnelChart.types.ts';

interface Props {
  drawing?: (defaultContent: ReactNode) => ReactNode;
  active: boolean;
  stage: FunnelStage;
  tabIndex: number;
  name: string;
  slotProps: FunnelChartSlotProps;
  elements: RefObject<Map<string, HTMLSpanElement>>;
  tooltip: Omit<ComponentProps<typeof TooltipAdapter>, 'children'>;
  activate: () => void;
  focus: () => void;
  navigate: (key: string) => boolean;
}

export function FunnelStageView({
  drawing,
  active,
  stage,
  name,
  tabIndex,
  slotProps,
  elements,
  tooltip,
  activate,
  focus,
  navigate,
}: Props) {
  const slot = native(slotProps.stage?.(stage), ['hidden', 'aria-hidden', 'aria-labelledby']);
  const left = 50 - stage.width * 48;
  const bottomLeft = 50 - stage.nextWidth * 48;
  const points = `${left},0 ${100 - left},0 ${100 - bottomLeft},100 ${bottomLeft},100`;
  const content = (
    <svg
      width="100%"
      height="56"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {stage.width > 0 && (
        <polygon {...native(slotProps.shape)} points={points} fill="currentColor" />
      )}
    </svg>
  );
  return (
    <TooltipAdapter {...tooltip}>
      {(trigger) => (
        <span
          {...slot}
          {...trigger}
          role="img"
          tabIndex={tabIndex}
          aria-label={name}
          data-ui="funnel-stage"
          data-active={active || undefined}
          ref={(element) => {
            trigger.ref(element);
            if (!element) return;
            elements.current.set(stage.id, element);
            return attachRef(element, slot.ref, () => {
              trigger.ref(null);
              elements.current.delete(stage.id);
            });
          }}
          onClick={(event) => {
            slot.onClick?.(event);
            if (!event.defaultPrevented) event.currentTarget.focus();
          }}
          onPointerEnter={(event) => {
            slot.onPointerEnter?.(event);
            if (event.defaultPrevented) return;
            activate();
            trigger.onPointerEnter?.(event);
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
