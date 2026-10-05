export type DisclosureAction = 'open' | 'close' | 'toggle';
export interface DisclosureOptions { disabled?: boolean }

export function getDisclosureOpen(currentOpen: boolean, action: DisclosureAction, { disabled = false }: DisclosureOptions = {}): boolean {
  if (disabled) return currentOpen;
  return action === 'toggle' ? !currentOpen : action === 'open';
}
