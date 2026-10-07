import { useCallback } from 'react';
import type { ComponentPropsWithRef, ReactNode, Ref } from 'react';
import { attachRef } from '../../shared/attachRef.ts';
import { useSlider } from './useSlider.ts';
import type { UseSliderOptions } from './slider.types.ts';

export type SliderAdapterProps = UseSliderOptions & {
  ref?: Ref<HTMLDivElement>;
  renderThumb?: (thumbProps: ComponentPropsWithRef<'div'>, value: number) => ReactNode;
};

export function SliderAdapter({ ref, renderThumb, ...props }: SliderAdapterProps) {
  const slider = useSlider(props);
  const thumbRef = slider.thumbRef;
  const attach = useCallback((node: HTMLDivElement | null) => {
    thumbRef.current = node;
    if (node) return attachRef(node, ref, () => { thumbRef.current = null; });
  }, [ref, thumbRef]);
  const thumbProps = { ...slider.thumbProps, ref: attach };
  return <div {...slider.rootProps}>
    <div {...props.slotProps?.rail} ref={slider.railRef} data-slot="rail" aria-hidden="true" />
    <div {...props.slotProps?.track} data-slot="track" aria-hidden="true" />
    {renderThumb ? renderThumb(thumbProps, slider.value) : <div {...thumbProps} />}
    <input {...slider.fieldProps} />
  </div>;
}
