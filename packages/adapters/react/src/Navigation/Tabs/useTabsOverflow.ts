import { useCallback, useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import { useTabsContext } from './TabsContext.tsx';
import type { RegisteredTab } from './TabsContext.tsx';

export function useTabsOverflow(listRef: RefObject<HTMLDivElement | null>) {
  const { value, orderedTabs } = useTabsContext();
  const [hiddenTabs, setHiddenTabs] = useState<RegisteredTab[]>([]);

  const revealTab = useCallback(
    (element: HTMLButtonElement) => {
      const list = listRef.current;
      if (!list?.contains(element)) {
        return;
      }
      const viewport = list.getBoundingClientRect();
      const tab = element.getBoundingClientRect();
      if (tab.left < viewport.left) {
        list.scrollLeft += tab.left - viewport.left;
      } else if (tab.right > viewport.right) {
        list.scrollLeft += tab.right - viewport.right;
      }
    },
    [listRef],
  );

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const viewport = list.getBoundingClientRect();
    const next =
      list.scrollWidth <= list.clientWidth
        ? []
        : orderedTabs().filter(({ element }) => {
            if (!list.contains(element)) {
              return false;
            }
            const tab = element.getBoundingClientRect();
            return (
              Math.round(tab.left) < Math.round(viewport.left) ||
              Math.round(tab.right) > Math.round(viewport.right)
            );
          });
    setHiddenTabs((previous) =>
      previous.length === next.length &&
      previous.every(
        (tab, index) =>
          tab.element === next[index].element &&
          tab.disabled === next[index].disabled &&
          tab.label === next[index].label,
      )
        ? previous
        : next,
    );
  }, [listRef, orderedTabs]);

  useLayoutEffect(() => {
    const selected = orderedTabs().find((tab) => tab.value === value);
    if (selected) {
      revealTab(selected.element);
    }
    measure();
  }, [value, orderedTabs, revealTab, measure]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const update = () => {
      const selected = orderedTabs().find((tab) => tab.value === value);
      if (selected) {
        revealTab(selected.element);
      }
      measure();
    };
    const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    const observeTabs = () => {
      resize?.disconnect();
      resize?.observe(list);
      for (const { element } of orderedTabs()) {
        if (list.contains(element)) {
          resize?.observe(element);
        }
      }
    };
    observeTabs();
    const mutations = new MutationObserver(() => {
      observeTabs();
      update();
    });
    mutations.observe(list, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-label'],
    });
    window.addEventListener('resize', update);
    return () => {
      resize?.disconnect();
      mutations.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [listRef, value, orderedTabs, revealTab, measure]);

  return { hiddenTabs, revealTab, measure };
}
