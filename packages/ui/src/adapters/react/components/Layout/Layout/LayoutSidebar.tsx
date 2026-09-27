import { LayoutSidebarAdapter } from '@dreadnought/react/unstyled';
import type { LayoutSidebarAdapterProps } from '@dreadnought/react/unstyled';
import { layoutPresentation } from '#presentation/Layout/Layout/layoutPresentation.ts';

export type LayoutSidebarProps = LayoutSidebarAdapterProps;

export function LayoutSidebar({ className, slotClassNames, ...props }: LayoutSidebarProps) {
  return <LayoutSidebarAdapter {...props}
    className={[layoutPresentation.sidebar, className].filter(Boolean).join(' ')}
    slotClassNames={{
      body: [layoutPresentation.body, slotClassNames?.body].filter(Boolean).join(' '),
      trigger: [layoutPresentation.trigger, slotClassNames?.trigger].filter(Boolean).join(' '),
    }} />;
}
