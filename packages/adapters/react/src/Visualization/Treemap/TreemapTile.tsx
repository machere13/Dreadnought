import type { CSSProperties, ComponentProps, RefObject, HTMLAttributes, ReactNode } from 'react';
import type { TreemapItem, TreemapRect } from '@dreadnought/core';
import { ButtonAdapter } from '../../Controls/Button/ButtonAdapter.tsx';
import { TooltipAdapter } from '../../Overlays/Tooltip/TooltipAdapter.tsx';
import { chartNativeProps as native } from '../../shared/chartNativeProps.ts';
import { attachRef } from '../../shared/attachRef.ts';
import type { TreemapSlotProps } from './treemap.types.ts';

function position(rect: TreemapRect, width: number, height: number): CSSProperties {
  return {
    position: 'absolute',
    left: `${(rect.x / width) * 100}%`,
    top: `${(rect.y / height) * 100}%`,
    width: `${(rect.width / width) * 100}%`,
    height: `${(rect.height / height) * 100}%`,
  };
}
interface Props {
  renderContent?: (defaultContent: ReactNode) => ReactNode;
  item: TreemapItem;
  width: number;
  height: number;
  tabIndex: number;
  formatValue: (value: number) => string;
  slotProps: TreemapSlotProps;
  elements: RefObject<Map<string, HTMLElement>>;
  tooltip: Omit<ComponentProps<typeof TooltipAdapter>, 'children'>;
  activate: () => void;
  focus: () => void;
  navigate: (key: string) => boolean;
  drill: () => void;
}
export function TreemapTile({
  renderContent,
  item,
  width,
  height,
  tabIndex,
  formatValue,
  slotProps,
  elements,
  tooltip,
  activate,
  focus,
  navigate,
  drill,
}: Props) {
  const slot = native(slotProps.tile?.(item), ['hidden', 'aria-hidden', 'aria-labelledby']);
  const rect = item.rect!;
  return (
    <TooltipAdapter {...tooltip}>
      {(trigger) => {
        const props: HTMLAttributes<HTMLElement> = {
          ...slot,
          ...trigger,
          tabIndex,
          'aria-label': `${item.label}: ${formatValue(item.value)}`,
          style: { ...slot.style, ...position(rect, width, height) },
          onClick: (event) => {
            slot.onClick?.(event);
            if (event.defaultPrevented) return;
            event.currentTarget.focus();
            if (item.group) drill();
          },
          onPointerEnter: (event) => {
            slot.onPointerEnter?.(event);
            if (!event.defaultPrevented) {
              activate();
              trigger.onPointerEnter?.(event);
            }
          },
          onPointerLeave: (event) => {
            slot.onPointerLeave?.(event);
            if (!event.defaultPrevented) trigger.onPointerLeave?.(event);
          },
          onFocus: (event) => {
            slot.onFocus?.(event);
            if (event.defaultPrevented) return;
            activate();
            focus();
            event.currentTarget.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
            trigger.onFocus?.(event);
          },
          onBlur: (event) => {
            slot.onBlur?.(event);
            if (!event.defaultPrevented) trigger.onBlur?.(event);
          },
          onKeyDown: (event) => {
            slot.onKeyDown?.(event);
            if (event.defaultPrevented || event.nativeEvent.isComposing) return;
            trigger.onKeyDown?.(event);
            if (!event.defaultPrevented && navigate(event.key)) event.preventDefault();
          },
        };
        const ref = (element: HTMLElement | null) => {
          trigger.ref(element);
          if (!element) return;
          elements.current.set(item.id, element);
          return attachRef(element, slot.ref, () => {
            trigger.ref(null);
            elements.current.delete(item.id);
          });
        };
        const content = (
          <>
            <span data-ui="treemap-tile-label">
              {item.label}
              <span>{formatValue(item.value)}</span>
            </span>
            {item.group && (
              <span data-ui="treemap-preview" aria-hidden="true">
                {item.children
                  .filter((child) => child.rect)
                  .map((child) => (
                    <span key={child.id} style={position(child.rect!, rect.width, rect.height)}>
                      <span>{child.label}</span>
                    </span>
                  ))}
              </span>
            )}
          </>
        );
        return item.group ? (
          <ButtonAdapter
            {...props}
            ref={ref}
            type="button"
            data-ui="treemap-tile"
            data-group="true"
          >
            {renderContent ? (
              <span aria-hidden="true" style={{ display: 'contents', pointerEvents: 'none' }}>
                {renderContent(content)}
              </span>
            ) : (
              content
            )}
          </ButtonAdapter>
        ) : (
          <span {...props} ref={ref} role="img" data-ui="treemap-tile">
            {renderContent ? (
              <span aria-hidden="true" style={{ display: 'contents', pointerEvents: 'none' }}>
                {renderContent(content)}
              </span>
            ) : (
              content
            )}
          </span>
        );
      }}
    </TooltipAdapter>
  );
}
