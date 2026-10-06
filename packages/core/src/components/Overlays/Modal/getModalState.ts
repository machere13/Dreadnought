import { getDisclosureState } from '#behaviors/getDisclosureState';
import type { DisclosureStateOptions, DisclosureState } from '#behaviors/getDisclosureState';

export type ModalCoreOptions = DisclosureStateOptions;
export interface ModalCore {
  open: boolean;
  triggerProps: DisclosureState['triggerProps'] & { 'aria-haspopup': 'dialog' };
  contentProps: { id: string; role: 'dialog'; 'aria-modal': true; 'aria-labelledby': string };
}

export function getModalState(options: ModalCoreOptions): ModalCore {
  const state = getDisclosureState({ ...options, open: !!options.open && !options.disabled });
  return { open: state.open, triggerProps: { ...state.triggerProps, 'aria-haspopup': 'dialog' },
    contentProps: { id: state.panelProps.id, role: 'dialog', 'aria-modal': true, 'aria-labelledby': state.triggerProps.id } };
}
