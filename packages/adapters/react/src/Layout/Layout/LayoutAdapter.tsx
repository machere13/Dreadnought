import type { ComponentPropsWithRef } from 'react';

export type LayoutDirection = 'vertical' | 'horizontal';

export type LayoutAdapterProps = ComponentPropsWithRef<'div'> & {
  direction?: LayoutDirection;
};

export function LayoutAdapter({ direction = 'vertical', ref, ...props }: LayoutAdapterProps) {
  return <div {...props} ref={ref} data-ui="layout" data-direction={direction} />;
}
