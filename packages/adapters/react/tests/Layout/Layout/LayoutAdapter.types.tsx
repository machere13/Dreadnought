import { LayoutAdapter, LayoutHeaderAdapter, LayoutContentAdapter, LayoutFooterAdapter, LayoutSidebarAdapter } from '@dreadnought/react/unstyled';
import type { LayoutAdapterProps, LayoutSidebarAdapterProps } from '@dreadnought/react/unstyled';

const root: LayoutAdapterProps = { direction: 'horizontal', children: 'shell' };
const sidebar: LayoutSidebarAdapterProps = { collapsed: false, onCollapsedChange: (next: boolean) => { void next; } };
void <LayoutAdapter {...root}><LayoutHeaderAdapter>Header</LayoutHeaderAdapter><LayoutContentAdapter>Main</LayoutContentAdapter><LayoutSidebarAdapter {...sidebar}>Nav</LayoutSidebarAdapter><LayoutFooterAdapter>Footer</LayoutFooterAdapter></LayoutAdapter>;
