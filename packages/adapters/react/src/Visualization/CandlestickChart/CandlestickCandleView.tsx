import type { ComponentProps, RefObject, ReactNode } from 'react';
import type { CandlestickCandle } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import type { CandlestickChartSlotProps } from './candlestickChart.types.ts';

interface Props {
  candle: CandlestickCandle;
  tabIndex: number;
  children: ReactNode;
  description: string;
  slotProps: CandlestickChartSlotProps;
  elements: RefObject<Map<string, HTMLSpanElement>>;
  tooltip: Omit<ComponentProps<typeof TooltipAdapter>, 'children'>;
  activate: () => void;
  focus: () => void;
  navigate: (key: string) => boolean;
}
export function CandlestickCandleView({
  candle,
  tabIndex,
  children,
  description,
  slotProps,
  elements,
  tooltip,
  activate,
  focus,
  navigate,
}: Props) {
  const slot = native(slotProps.candle?.(candle), ['hidden', 'aria-hidden', 'aria-labelledby']);
  return (
    <TooltipAdapter {...tooltip}>
      {(trigger) => (
        <span
          {...slot}
          {...trigger}
          role="img"
          tabIndex={tabIndex}
          aria-label={description}
          data-ui="candlestick-candle"
          data-trend={candle.trend}
          ref={(element) => {
            trigger.ref(element);
            if (!element) return;
            elements.current.set(candle.id, element);
            return attachRef(element, slot.ref, () => {
              trigger.ref(null);
              elements.current.delete(candle.id);
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
          {children}
        </span>
      )}
    </TooltipAdapter>
  );
}
