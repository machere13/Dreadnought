import { useCallback, useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
import { useTabsContext } from './TabsContext.tsx';
import type { RegisteredTab } from './TabsContext.tsx';

export function useTabsOverflow(listRef: RefObject<HTMLDivElement | null>) {
  const { value, orderedTabs, orientation } = useTabsContext();
  const vertical = orientation === 'vertical';
  const start = vertical ? 'top' : 'left';
  const end = vertical ? 'bottom' : 'right';
  const scroll = vertical ? 'scrollTop' : 'scrollLeft';
  const [hiddenTabs, setHiddenTabs] = useState<RegisteredTab[]>([]);

  const revealTab = useCallback(
    (element: HTMLButtonElement) => {
      const list = listRef.current;
      if (!list?.contains(element)) {
        return;
      }
      const viewport = list.getBoundingClientRect();
      const tab = element.getBoundingClientRect();
      if (tab[start] < viewport[start]) {
        list[scroll] += tab[start] - viewport[start];
      } else if (tab[end] > viewport[end]) {
        list[scroll] += tab[end] - viewport[end];
      }
    },
    [listRef, start, end, scroll],
  );

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const viewport = list.getBoundingClientRect();
    const fits = vertical
      ? list.scrollHeight <= list.clientHeight
      : list.scrollWidth <= list.clientWidth;
    const next = fits
      ? []
      : orderedTabs().filter(({ element }) => {
          if (!list.contains(element)) {
            return false;
          }
          const tab = element.getBoundingClientRect();
          return (
            Math.round(tab[start]) < Math.round(viewport[start]) ||
            Math.round(tab[end]) > Math.round(viewport[end])
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
  }, [listRef, orderedTabs, vertical, start, end]);

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
