export interface NavigationItem {
  value: string;
  disabled?: boolean;
}

export type NavigationDirection = 'previous' | 'next' | 'first' | 'last';

export function getNextEnabledValue(items: readonly NavigationItem[], currentValue: string,
  direction: NavigationDirection): string | undefined {
  const enabled = items.filter((item) => !item.disabled);
  if (enabled.length === 0) return undefined;
  if (direction === 'first') return enabled[0]!.value;
  if (direction === 'last') return enabled.at(-1)!.value;
  const index = enabled.findIndex((item) => item.value === currentValue);
  if (index < 0) return direction === 'next' ? enabled[0]!.value : enabled.at(-1)!.value;
  const offset = direction === 'next' ? 1 : -1;
  return enabled[(index + offset + enabled.length) % enabled.length]!.value;
}
