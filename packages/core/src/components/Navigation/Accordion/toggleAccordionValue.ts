import { getSelectionValue } from '#behaviors/getSelectionValue';

export function toggleAccordionValue(current: string | null, item: string): string | null;
export function toggleAccordionValue(current: readonly string[], item: string): string[];
export function toggleAccordionValue(
  current: string | null | readonly string[],
  item: string,
): string | null | string[] {
  return getSelectionValue(current, { type: 'toggle', value: item });
}
