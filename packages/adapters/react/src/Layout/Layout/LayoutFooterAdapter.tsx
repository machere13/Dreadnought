import type { ComponentPropsWithRef } from 'react';

export type LayoutFooterAdapterProps = ComponentPropsWithRef<'footer'>;

export function LayoutFooterAdapter({ ref, ...props }: LayoutFooterAdapterProps) {
  return <footer {...props} ref={ref} data-ui="layout-footer" />;
}
