import { useCallback, useRef } from 'react';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef } from 'react';
import { forwardTabsRef } from './forwardTabsRef.ts';
import { useTabsOverflow } from './useTabsOverflow.ts';
import { TabsOverflowMenu } from './TabsOverflowMenu.tsx';

export type TabsListAdapterProps = ComponentPropsWithRef<'div'> & {
  /** Accessible name of the overflow button and its menu. */
  moreLabel?: string;
  /** Public styling and DOM properties for the overflow parts. */
  slotProps?: {
    container?: ComponentPropsWithoutRef<'div'>;
    more?: ComponentPropsWithoutRef<'button'>;
    menu?: ComponentPropsWithoutRef<'div'>;
    item?: ComponentPropsWithoutRef<'button'>;
  };
};

export function TabsListAdapter({ ref, children, onScroll, moreLabel = 'Ещё вкладки', slotProps = {}, ...props }: TabsListAdapterProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const setRef = useCallback((element: HTMLDivElement | null) => {
    listRef.current = element;
    return forwardTabsRef(element, ref, () => { listRef.current = null; });
  }, [ref]);
  const { hiddenTabs, revealTab, measure } = useTabsOverflow(listRef);

  return <div {...slotProps.container} data-slot="list-container">
    <div {...props} ref={setRef} role="tablist" aria-orientation="horizontal" data-slot="list"
      onScroll={(event) => { onScroll?.(event); measure(); }}>
      {children}
    </div>
    {hiddenTabs.length > 0 && <TabsOverflowMenu tabs={hiddenTabs} revealTab={revealTab}
      label={moreLabel} slotProps={slotProps} />}
  </div>;
}
