import { LayoutHeaderAdapter } from '@dreadnought/react/unstyled';
import type { LayoutHeaderAdapterProps } from '@dreadnought/react/unstyled';
import { layoutPresentation } from '#presentation/Layout/Layout/layoutPresentation.ts';

export type LayoutHeaderProps = LayoutHeaderAdapterProps;

export function LayoutHeader({ className, ...props }: LayoutHeaderProps) {
  return <LayoutHeaderAdapter {...props} className={[layoutPresentation.header, className].filter(Boolean).join(' ')} />;
}
