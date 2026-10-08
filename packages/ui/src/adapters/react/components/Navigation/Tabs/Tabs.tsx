import {
  TabsAdapter,
  TabsListAdapter,
  TabsTabAdapter,
  TabsPanelAdapter,
} from '@dreadnought/react/unstyled';
import type {
  TabsAdapterProps,
  TabsListAdapterProps,
  TabsTabAdapterProps,
  TabsPanelAdapterProps,
} from '@dreadnought/react/unstyled';
import { tabsPresentation } from '#presentation/Navigation/Tabs/tabsPresentation.ts';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';

function classes(library: string, consumer?: string) {
  return [library, consumer].filter(Boolean).join(' ');
}

function TabsRoot({ className, ...props }: TabsAdapterProps) {
  return <TabsAdapter {...props} className={classes(tabsPresentation.root, className)} />;
}

function List({ className, slotProps = {}, ...props }: TabsListAdapterProps) {
  return (
    <TabsListAdapter
      {...props}
      className={classes(tabsPresentation.list, className)}
      slotProps={{
        container: {
          ...slotProps.container,
          className: classes(tabsPresentation.listContainer, slotProps.container?.className),
        },
        more: {
          ...slotProps.more,
          children: slotProps.more?.children ?? <Icon name="ellipsis" />,
          className: classes(tabsPresentation.more, slotProps.more?.className),
        },
        menu: {
          ...slotProps.menu,
          className: classes(tabsPresentation.menu, slotProps.menu?.className),
        },
        item: {
          ...slotProps.item,
          className: classes(tabsPresentation.menuItem, slotProps.item?.className),
        },
      }}
    />
  );
}

function Tab({ className, ...props }: TabsTabAdapterProps) {
  return <TabsTabAdapter {...props} className={classes(tabsPresentation.tab, className)} />;
}

function Panel({ className, ...props }: TabsPanelAdapterProps) {
  return <TabsPanelAdapter {...props} className={classes(tabsPresentation.panel, className)} />;
}

export const Tabs = Object.assign(TabsRoot, { List, Tab, Panel });
export type TabsProps = TabsAdapterProps;
