import { useCallback, useRef } from 'react';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef } from 'react';
import { forwardTabsRef } from './forwardTabsRef.ts';
import { useTabsOverflow } from './useTabsOverflow.ts';
import { TabsOverflowMenu } from './TabsOverflowMenu.tsx';
import { useTabsContext } from './TabsContext.tsx';

export type TabsListAdapterProps = ComponentPropsWithRef<'div'> & {
  moreLabel?: string;
  slotProps?: {
    container?: ComponentPropsWithoutRef<'div'>;
    more?: ComponentPropsWithoutRef<'button'>;
    menu?: ComponentPropsWithoutRef<'div'>;
    item?: ComponentPropsWithoutRef<'button'>;
  };
};

export function TabsListAdapter({
  ref,
  children,
  onScroll,
  moreLabel = 'Ещё вкладки',
  slotProps = {},
  ...props
}: TabsListAdapterProps) {
  const { orientation } = useTabsContext();
  const listRef = useRef<HTMLDivElement>(null);
  const setRef = useCallback(
    (element: HTMLDivElement | null) => {
      listRef.current = element;
      return forwardTabsRef(element, ref, () => {
        listRef.current = null;
      });
    },
    [ref],
  );
  const { hiddenTabs, revealTab, measure } = useTabsOverflow(listRef);

  return (
    <div {...slotProps.container} data-slot="list-container" data-orientation={orientation}>
      <div
        {...props}
        ref={setRef}
        role="tablist"
        aria-orientation={orientation}
        data-slot="list"
        onScroll={(event) => {
          onScroll?.(event);
          measure();
        }}
      >
        {children}
      </div>
      {hiddenTabs.length > 0 && (
        <TabsOverflowMenu
          tabs={hiddenTabs}
          revealTab={revealTab}
          label={moreLabel}
          slotProps={slotProps}
        />
      )}
    </div>
  );
}
