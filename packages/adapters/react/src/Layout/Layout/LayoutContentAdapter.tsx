import type { ComponentPropsWithRef } from 'react';

export type LayoutContentAdapterProps = ComponentPropsWithRef<'main'>;

export function LayoutContentAdapter({ ref, ...props }: LayoutContentAdapterProps) {
  return <main {...props} ref={ref} data-ui="layout-content" />;
}
