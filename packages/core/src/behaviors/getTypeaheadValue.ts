import type { NavigationItem } from './getNextEnabledValue.ts';

export interface TypeaheadItem extends NavigationItem {
  text: string;
}

export interface TypeaheadOptions {
  includeCurrent?: boolean;
}

export function getTypeaheadValue(
  items: readonly TypeaheadItem[],
  currentValue: string,
  query: string,
  options: TypeaheadOptions = {},
): string | undefined {
  const { includeCurrent = false } = options;
  const prefix = query.trim().toLowerCase();
  if (!prefix) {
    return undefined;
  }
  const currentIndex = items.findIndex((item) => item.value === currentValue);
  const start = currentIndex < 0 ? 0 : currentIndex + (includeCurrent ? 0 : 1);
  for (let offset = 0; offset < items.length; offset++) {
    const item = items[(start + offset) % items.length]!;
    if (!item.disabled && item.text.trim().toLowerCase().startsWith(prefix)) {
      return item.value;
    }
  }
  return undefined;
}
