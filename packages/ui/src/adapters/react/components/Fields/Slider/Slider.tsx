import { useCallback } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { SliderAdapter } from '@dreadnought/react/unstyled';
import type { SliderAdapterProps } from '@dreadnought/react/unstyled';
import type { TooltipTriggerProps, UseTooltipOptions } from '@dreadnought/react/logic';
import { sliderPresentation } from '#presentation/Fields/Slider/sliderPresentation.ts';
import { Tooltip } from '../../Overlays/Tooltip/Tooltip.tsx';

export type SliderProps = SliderAdapterProps & {
  tooltip?: false | {
    formatter?: (value: number) => ReactNode;
    placement?: UseTooltipOptions['placement'];
    openDelay?: number;
    closeDelay?: number;
  };
};

function TooltipThumb({ thumbProps, trigger, value, index, renderThumb }: {
  thumbProps: ComponentPropsWithRef<'div'>;
  trigger: TooltipTriggerProps;
  value: number;
  index: 0 | 1;
  renderThumb: SliderAdapterProps['renderThumb'];
}) {
  const thumbRef = thumbProps.ref, triggerRef = trigger.ref;
  const ref = useCallback((node: HTMLDivElement | null) => {
    const cleanup = typeof thumbRef === 'function' ? thumbRef(node) : undefined;
    if (thumbRef && typeof thumbRef !== 'function') thumbRef.current = node;
    triggerRef(node);
    return () => {
      if (typeof cleanup === 'function') cleanup();
      else if (typeof thumbRef === 'function') thumbRef(null);
      else if (thumbRef) thumbRef.current = null;
      triggerRef(null);
    };
  }, [thumbRef, triggerRef]);
  const props: ComponentPropsWithRef<'div'> = { ...thumbProps, ref, 'aria-describedby': trigger['aria-describedby'],
    onPointerEnter: event => { thumbProps.onPointerEnter?.(event); if (!event.defaultPrevented) trigger.onPointerEnter?.(event); },
    onPointerLeave: event => { thumbProps.onPointerLeave?.(event); if (!event.defaultPrevented) trigger.onPointerLeave?.(event); },
    onFocus: event => { thumbProps.onFocus?.(event); if (!event.defaultPrevented) trigger.onFocus?.(event); },
    onBlur: event => { thumbProps.onBlur?.(event); trigger.onBlur?.(event); },
    onKeyDown: event => { thumbProps.onKeyDown?.(event); if (!event.defaultPrevented) trigger.onKeyDown?.(event); },
  };
  return renderThumb ? renderThumb(props, value, index) : <div {...props} />;
}

export function Slider({ className, tooltip = {}, renderThumb, ...props }: SliderProps) {
  return <SliderAdapter {...props} className={[sliderPresentation.root, className].filter(Boolean).join(' ')}
    renderThumb={tooltip === false ? renderThumb : (thumbProps, value, index) => <Tooltip
      content={tooltip.formatter ? tooltip.formatter(value) : String(value)} placement={tooltip.placement}
      openDelay={tooltip.openDelay} closeDelay={tooltip.closeDelay} disabled={thumbProps['aria-disabled'] === true}
      describedBy={thumbProps['aria-describedby']}>
      {trigger => <TooltipThumb thumbProps={thumbProps} trigger={trigger} value={value} index={index} renderThumb={renderThumb} />}
    </Tooltip>} />;
}
