import type { ComponentProps, RefObject, ReactNode } from 'react';
import type { SankeyItem } from '@dreadnought/core';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import { sankeyItemLabel, type SankeyStatisticsProps } from './SankeyStatistics.tsx';

interface Props {
  drawing?: (context: {
    width: number;
    height: number;
    path: string;
    defaultContent: ReactNode;
  }) => ReactNode;
  item: SankeyItem;
  itemKey: string;
  layoutWidth: number;
  tabIndex: number;
  statistics: SankeyStatisticsProps;
  elements: RefObject<Map<string, HTMLSpanElement>>;
  tooltip: Omit<ComponentProps<typeof TooltipAdapter>, 'children'>;
  activate: () => void;
  focus: () => void;
  navigate: (key: string) => boolean;
}
export function SankeyItemView({
  drawing,
  item,
  itemKey,
  layoutWidth,
  tabIndex,
  statistics,
  elements,
  tooltip,
  activate,
  focus,
  navigate,
}: Props) {
  const { slotProps, formatValue } = statistics;
  const slot = native(slotProps.item?.(item), ['hidden', 'aria-hidden', 'aria-labelledby']);
  const node = item.kind === 'node';
  const left = node ? item.x : item.sourceX;
  const top = node ? item.y : Math.min(item.sourceY, item.targetY) - item.width / 2;
  const width = node ? item.width : item.targetX - item.sourceX;
  const height = node
    ? Math.max(2, item.height)
    : Math.abs(item.targetY - item.sourceY) + item.width;
  const path = node
    ? ''
    : [
        `M0,${item.sourceY - top}`,
        `C${width / 2},${item.sourceY - top}`,
        `${width / 2},${item.targetY - top} ${width},${item.targetY - top}`,
      ].join(' ');
  const content = (
    <>
      <svg
        width="100%"
        height="100%"
        aria-hidden="true"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {node ? (
          <rect
            width={width}
            height={height}
            fill="currentColor"
            style={{ pointerEvents: 'all' }}
          />
        ) : (
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth={item.width}
            style={{ pointerEvents: 'stroke' }}
          />
        )}
      </svg>
      {node && (
        <span
          data-ui="sankey-node-label"
          data-side={item.x > layoutWidth - 200 ? 'left' : 'right'}
          style={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 124,
            pointerEvents: 'auto',
            ...(item.x > layoutWidth - 200
              ? { right: 'calc(100% + 8px)' }
              : { left: 'calc(100% + 8px)' }),
          }}
        >
          {item.label}
        </span>
      )}
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
          aria-label={`${sankeyItemLabel(item)}: ${formatValue(item.value)}`}
          data-ui="sankey-item"
          data-kind={item.kind}
          data-color={(node ? item.index : item.sourceIndex) % 6}
          style={{
            ...slot.style,
            position: 'absolute',
            left,
            top,
            width,
            height,
            zIndex: node ? 1 : 0,
            pointerEvents: 'none',
          }}
          ref={(element) => {
            trigger.ref(element);
            if (!element) return;
            elements.current.set(itemKey, element);
            return attachRef(element, slot.ref, () => {
              trigger.ref(null);
              elements.current.delete(itemKey);
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
            event.currentTarget
              .querySelector<HTMLElement>('[data-ui="sankey-node-label"]')
              ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
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
            <>
              <span
                inert
                aria-hidden="true"
                data-ui="sankey-item-drawing"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                {drawing({ width, height, path, defaultContent: content })}
              </span>
              <span
                aria-hidden="true"
                data-ui="sankey-item-hit"
                style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none' }}
              >
                {content}
              </span>
            </>
          ) : (
            content
          )}
        </span>
      )}
    </TooltipAdapter>
  );
}
