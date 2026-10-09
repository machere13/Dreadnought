import { useCallback } from 'react';
import type { ComponentPropsWithRef } from 'react';
import type { ContentMountPolicy } from '@dreadnought/core';
import { useContentMount } from '../../shared/useContentMount.ts';
import { useTabsContext } from './TabsContext.tsx';
import { forwardTabsRef } from './forwardTabsRef.ts';

export type TabsPanelAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'hidden'> & {
  value: string;
  mountPolicy?: ContentMountPolicy;
};

export function TabsPanelAdapter({
  value,
  mountPolicy = 'eager',
  children,
  ref,
  ...props
}: TabsPanelAdapterProps) {
  const context = useTabsContext();
  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      context.registerPanel(value, element);
      return forwardTabsRef(element, ref, () => context.registerPanel(value, null));
    },
    [context.registerPanel, ref, value],
  );

  const selected = context.value === value;
  const mounted = useContentMount(selected, mountPolicy);
  return (
    <div
      {...props}
      ref={setRef}
      role="tabpanel"
      data-slot="panel"
      id={context.panelId(value)}
      aria-labelledby={context.tabId(value)}
      hidden={!selected}
      tabIndex={selected ? 0 : undefined}
    >
      {mounted ? children : null}
    </div>
  );
}
