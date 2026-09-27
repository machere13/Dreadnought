import { LayoutFooterAdapter } from '@dreadnought/react/unstyled';
import type { LayoutFooterAdapterProps } from '@dreadnought/react/unstyled';
import { layoutPresentation } from '#presentation/Layout/Layout/layoutPresentation.ts';

export type LayoutFooterProps = LayoutFooterAdapterProps;

export function LayoutFooter({ className, ...props }: LayoutFooterProps) {
  return <LayoutFooterAdapter {...props} className={[layoutPresentation.footer, className].filter(Boolean).join(' ')} />;
}
