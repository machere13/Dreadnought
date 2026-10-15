import { getNavigationDirection } from '#behaviors/getNavigationDirection';
import type { NavigationKeyOptions } from '#behaviors/getNavigationDirection';
import { getNextEnabledValue } from '#behaviors/getNextEnabledValue';
import type { NavigationItem, NavigationOptions } from '#behaviors/getNextEnabledValue';

export interface CollectionNavigationOptions extends NavigationKeyOptions, NavigationOptions {}

export function getCollectionNavigation(
  items: readonly NavigationItem[],
  currentValue: string,
  key: string,
  options: CollectionNavigationOptions = {},
): string | undefined {
  const direction = getNavigationDirection(key, options);
  return direction ? getNextEnabledValue(items, currentValue, direction, options) : undefined;
}
