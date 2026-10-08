import { LayoutContentAdapter } from '@dreadnought/react/unstyled';
import type { LayoutContentAdapterProps } from '@dreadnought/react/unstyled';
import { layoutPresentation } from '#presentation/Layout/Layout/layoutPresentation.ts';

export type LayoutContentProps = LayoutContentAdapterProps;

export function LayoutContent({ className, ...props }: LayoutContentProps) {
  return (
    <LayoutContentAdapter
      {...props}
      className={[layoutPresentation.content, className].filter(Boolean).join(' ')}
    />
  );
}
