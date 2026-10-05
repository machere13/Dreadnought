import type { NavigationItem } from '#behaviors/getNextEnabledValue';

export interface ToolbarCoreOptions {
  items: readonly NavigationItem[];
  activeValue?: string;
  navigation?: 'roving' | 'native';
  orientation?: 'horizontal' | 'vertical';
}

export interface ToolbarCore {
  role: 'toolbar' | 'group';
  ariaOrientation: 'horizontal' | 'vertical' | undefined;
  tabStopValue: string | undefined;
}
