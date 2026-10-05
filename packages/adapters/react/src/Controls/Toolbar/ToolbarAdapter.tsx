import { useCallback, useRef, useState } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { getToolbarState } from '@dreadnought/core';
import type { ToolbarCoreOptions } from '@dreadnought/core';
import { attachRef } from '../../shared/attachRef.ts';
import { ToolbarContext } from './ToolbarContext.ts';
import { useToolbarRegistry } from './useToolbarRegistry.ts';

export type ToolbarAdapterProps = ComponentPropsWithRef<'div'> & {
  navigation?: ToolbarCoreOptions['navigation'];
  orientation?: ToolbarCoreOptions['orientation'];
  loop?: boolean;
};

export function ToolbarAdapter({ navigation = 'roving', orientation = 'horizontal', loop = true, ref, children, tabIndex, ...props }: ToolbarAdapterProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const { items, register } = useToolbarRegistry();
  const [activeValue, activate] = useState<string>();
  const state = getToolbarState({ items, activeValue, navigation, orientation });
  const rootRef = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;
    root.current = element;
    return attachRef(element, ref, () => { root.current = null; });
  }, [ref]);
  return <ToolbarContext.Provider value={{ navigation, orientation, loop, tabStopValue: state.tabStopValue, register, activate, navigate: () => {} }}>
    <div {...props} ref={rootRef} role={state.role} aria-orientation={state.ariaOrientation} tabIndex={navigation === 'roving' ? -1 : tabIndex}>{children}</div>
  </ToolbarContext.Provider>;
}
