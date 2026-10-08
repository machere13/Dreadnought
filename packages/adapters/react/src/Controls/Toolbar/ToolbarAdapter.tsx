import { useCallback, useRef, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { getNextEnabledValue, getToolbarState } from '@dreadnought/core';
import type { NavigationDirection, ToolbarCoreOptions } from '@dreadnought/core';
import { attachRef } from '../../shared/attachRef.ts';
import { ToolbarContext } from './ToolbarContext.ts';
import { useToolbarRegistry } from './useToolbarRegistry.ts';

export type ToolbarAdapterProps = ComponentPropsWithRef<'div'> & {
  navigation?: ToolbarCoreOptions['navigation'];
  orientation?: ToolbarCoreOptions['orientation'];
  loop?: boolean;
};

export function ToolbarAdapter({
  navigation = 'roving',
  orientation = 'horizontal',
  loop = true,
  ref,
  children,
  tabIndex,
  onBlurCapture,
  ...props
}: ToolbarAdapterProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const { items, register, orderedItems, markFocused, handleBlur } = useToolbarRegistry(
    root,
    navigation,
  );
  const [activeValue, setActiveValue] = useState<string>();
  const activate = useCallback(
    (value: string) => {
      markFocused(value);
      setActiveValue(value);
    },
    [markFocused],
  );
  const state = getToolbarState({ items, activeValue, navigation, orientation });
  const navigate = useCallback(
    (value: string, direction: NavigationDirection) => {
      const ordered = orderedItems();
      const nextValue = getNextEnabledValue(ordered, value, direction, { loop });
      ordered.find((item) => item.value === nextValue)?.element.focus();
    },
    [orderedItems, loop],
  );
  const rootRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) {
        return;
      }
      root.current = element;
      return attachRef(element, ref, () => {
        root.current = null;
      });
    },
    [ref],
  );
  return (
    <ToolbarContext.Provider
      value={{
        navigation,
        orientation,
        loop,
        tabStopValue: state.tabStopValue,
        register,
        activate,
        navigate,
      }}
    >
      <div
        {...props}
        ref={rootRef}
        role={state.role}
        aria-orientation={state.ariaOrientation}
        tabIndex={navigation === 'roving' ? -1 : tabIndex}
        onBlurCapture={(event) => {
          onBlurCapture?.(event);
          if (!event.defaultPrevented) {
            handleBlur(event);
          }
        }}
      >
        {children}
      </div>
    </ToolbarContext.Provider>
  );
}
