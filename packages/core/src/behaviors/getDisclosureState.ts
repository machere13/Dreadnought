export interface DisclosureStateOptions {
  open?: boolean;
  disabled?: boolean;
  triggerId: string;
  panelId: string;
}

export interface DisclosureState {
  open: boolean;
  disabled: boolean;
  triggerProps: {
    id: string;
    type: 'button';
    disabled: boolean;
    'aria-expanded': boolean;
    'aria-controls': string;
  };
  panelProps: {
    id: string;
    hidden: boolean;
    'aria-labelledby': string;
  };
}

export function getDisclosureState({
  open = false,
  disabled = false,
  triggerId,
  panelId,
}: DisclosureStateOptions): DisclosureState {
  if (
    !triggerId ||
    !panelId ||
    /[\t\n\f\r ]/.test(triggerId) ||
    /[\t\n\f\r ]/.test(panelId) ||
    triggerId === panelId
  ) {
    throw new Error('Disclosure needs distinct nonempty IDs without ASCII whitespace.');
  }
  return {
    open,
    disabled,
    triggerProps: {
      id: triggerId,
      type: 'button',
      disabled,
      'aria-expanded': open,
      'aria-controls': panelId,
    },
    panelProps: { id: panelId, hidden: !open, 'aria-labelledby': triggerId },
  };
}
