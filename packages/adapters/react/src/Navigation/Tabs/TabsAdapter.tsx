import { useCallback, useId } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { getNextTabValue } from '@dreadnought/core';
import type { TabDirection } from '@dreadnought/core';
import { TabsContext } from './TabsContext.tsx';
import { TabsListAdapter } from './TabsListAdapter.tsx';
import { TabsTabAdapter } from './TabsTabAdapter.tsx';
import { TabsPanelAdapter } from './TabsPanelAdapter.tsx';
import { useTabs } from './useTabs.ts';
import type { UseTabsOptions } from './useTabs.ts';
import { useTabsRegistry } from './useTabsRegistry.ts';

export type TabsAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange' | 'children'>
  & UseTabsOptions & { children: ReactNode };

function TabsRootAdapter({ value, defaultValue, onValueChange, children, ref, ...rootProps }: TabsAdapterProps) {
  const selection = useTabs(value === undefined
    ? { defaultValue: defaultValue!, onValueChange }
    : { value, onValueChange });
  const rootId = useId();
  const { registerTab, registerPanel, orderedTabs, getTab } = useTabsRegistry(selection.value);

  const tabId = useCallback((itemValue: string) => `${rootId}-tab-${encodeURIComponent(itemValue)}`, [rootId]);
  const panelId = useCallback((itemValue: string) => `${rootId}-panel-${encodeURIComponent(itemValue)}`, [rootId]);

  const navigate = useCallback((currentValue: string, direction: TabDirection) => {
    const next = getNextTabValue(orderedTabs(), currentValue, direction);
    if (next === undefined) return;
    getTab(next)?.element.focus();
    selection.setValue(next);
  }, [getTab, orderedTabs, selection]);

  return <TabsContext.Provider value={{
    value: selection.value,
    setValue: selection.setValue,
    tabId,
    panelId,
    registerTab,
    orderedTabs,
    registerPanel,
    navigate,
  }}><div {...rootProps} ref={ref} data-ui="tabs">{children}</div></TabsContext.Provider>;
}

export const TabsAdapter = Object.assign(TabsRootAdapter, {
  List: TabsListAdapter,
  Tab: TabsTabAdapter,
  Panel: TabsPanelAdapter,
});
