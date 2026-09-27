import type { ComponentPropsWithRef } from 'react';

export type LayoutHeaderAdapterProps = ComponentPropsWithRef<'header'>;

export function LayoutHeaderAdapter({ ref, ...props }: LayoutHeaderAdapterProps) {
  return <header {...props} ref={ref} data-ui="layout-header" />;
}
