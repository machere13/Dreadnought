import { useCallback } from 'react';
import type { ComponentPropsWithRef, ReactNode, Ref, RefObject } from 'react';
import { attachRef } from '../../shared/attachRef.ts';
import { useSlider } from './useSlider.ts';
import type { UseSliderOptions } from './slider.types.ts';

export type SliderAdapterProps = UseSliderOptions & {
  ref?: Ref<HTMLDivElement>;
  renderThumb?: (
    thumbProps: ComponentPropsWithRef<'div'>,
    value: number,
    index: 0 | 1,
  ) => ReactNode;
};

function SliderThumb({
  forwardedRef,
  thumbRef,
  thumbProps,
  value,
  index,
  renderThumb,
}: {
  forwardedRef?: Ref<HTMLDivElement>;
  thumbRef: RefObject<HTMLDivElement | null>;
  thumbProps: ComponentPropsWithRef<'div'>;
  value: number;
  index: 0 | 1;
  renderThumb?: SliderAdapterProps['renderThumb'];
}) {
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      thumbRef.current = node;
      if (node) {
        return attachRef(node, forwardedRef, () => {
          thumbRef.current = null;
        });
      }
    },
    [forwardedRef, thumbRef],
  );
  const props = { ...thumbProps, ref: attach };
  return renderThumb ? renderThumb(props, value, index) : <div {...props} />;
}

export function SliderAdapter({ ref, renderThumb, ...props }: SliderAdapterProps) {
  const slider = useSlider(props);
  return (
    <div {...slider.rootProps}>
      <div {...props.slotProps?.rail} ref={slider.railRef} data-slot="rail" aria-hidden="true" />
      <div {...props.slotProps?.track} data-slot="track" aria-hidden="true" />
      {slider.marks.map((mark) => (
        <button key={mark.value} {...mark.markProps}>
          {mark.label}
        </button>
      ))}
      {slider.thumbs.map((thumb, index) => (
        <SliderThumb
          key={index}
          {...thumb}
          index={index as 0 | 1}
          forwardedRef={index === 0 ? ref : undefined}
          renderThumb={renderThumb}
        />
      ))}
      {slider.thumbs.map((thumb, index) => (
        <input key={index} {...thumb.fieldProps} />
      ))}
    </div>
  );
}
