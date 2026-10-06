import { getDisclosureState } from '#behaviors/getDisclosureState';
import type { DisclosureStateOptions, DisclosureState } from '#behaviors/getDisclosureState';

export type PopoverCoreOptions = DisclosureStateOptions;
export interface PopoverCore {
  open: boolean;
  triggerProps: DisclosureState['triggerProps'] & { 'aria-haspopup': 'dialog' };
  contentProps: DisclosureState['panelProps'] & { role: 'dialog'; 'aria-modal': false };
}

export function getPopoverState(options: PopoverCoreOptions): PopoverCore {
  const state = getDisclosureState({ ...options, open: !!options.open && !options.disabled });
  return { open: state.open,
    triggerProps: { ...state.triggerProps, 'aria-haspopup': 'dialog' },
    contentProps: { ...state.panelProps, role: 'dialog', 'aria-modal': false } };
}
