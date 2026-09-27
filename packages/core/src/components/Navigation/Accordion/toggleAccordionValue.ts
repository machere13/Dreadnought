export function toggleAccordionValue(current: string | null, item: string): string | null;
export function toggleAccordionValue(current: readonly string[], item: string): string[];
export function toggleAccordionValue(current: string | null | readonly string[], item: string): string | null | string[] {
  if (Array.isArray(current)) {
    return current.includes(item) ? current.filter((value) => value !== item) : [...current, item];
  }
  return current === item ? null : item;
}
