import { LayoutAdapter } from '@dreadnought/react/unstyled';
import type { LayoutAdapterProps } from '@dreadnought/react/unstyled';
import { layoutPresentation } from '#presentation/Layout/Layout/layoutPresentation.ts';
import { LayoutHeader } from './LayoutHeader.tsx';
import { LayoutContent } from './LayoutContent.tsx';
import { LayoutFooter } from './LayoutFooter.tsx';
import { LayoutSidebar } from './LayoutSidebar.tsx';

export type LayoutProps = LayoutAdapterProps;

function LayoutRoot({ className, ...props }: LayoutProps) {
  return (
    <LayoutAdapter
      {...props}
      className={[layoutPresentation.root, className].filter(Boolean).join(' ')}
    />
  );
}

export const Layout = Object.assign(LayoutRoot, {
  Header: LayoutHeader,
  Content: LayoutContent,
  Footer: LayoutFooter,
  Sidebar: LayoutSidebar,
});
