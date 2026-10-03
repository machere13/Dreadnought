import type { TabDirection, TabItem } from './TabsCore.ts';
import { getNextEnabledValue } from '#behaviors/getNextEnabledValue';

export function getNextTabValue(
  tabs: readonly TabItem[],
  currentValue: string,
  direction: TabDirection,
): string | undefined {
  return getNextEnabledValue(tabs, currentValue, direction);
}
