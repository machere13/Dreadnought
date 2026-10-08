export interface NavigationItem {
  value: string;
  disabled?: boolean;
}

export type NavigationDirection = 'previous' | 'next' | 'first' | 'last';

export interface NavigationOptions {
  loop?: boolean;
}

export function getNextEnabledValue(
  items: readonly NavigationItem[],
  currentValue: string,
  direction: NavigationDirection,
  { loop = true }: NavigationOptions = {},
): string | undefined {
  const enabled = items.filter((item) => !item.disabled);
  if (enabled.length === 0) {
    return undefined;
  }
  if (direction === 'first') {
    return enabled[0]!.value;
  }
  if (direction === 'last') {
    return enabled.at(-1)!.value;
  }
  const index = enabled.findIndex((item) => item.value === currentValue);
  if (index < 0) {
    return direction === 'next' ? enabled[0]!.value : enabled.at(-1)!.value;
  }
  const offset = direction === 'next' ? 1 : -1;
  const nextIndex = loop
    ? (index + offset + enabled.length) % enabled.length
    : Math.max(0, Math.min(index + offset, enabled.length - 1));
  return enabled[nextIndex]!.value;
}
