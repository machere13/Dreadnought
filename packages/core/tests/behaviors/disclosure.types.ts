import { getDisclosureOpen, getDisclosureState } from '@dreadnought/core';
import type { DisclosureAction, DisclosureOptions, DisclosureState, DisclosureStateOptions } from '@dreadnought/core';

const options: DisclosureStateOptions = { triggerId: 'trigger', panelId: 'panel' };
const state: DisclosureState = getDisclosureState(options);
const type: 'button' = state.triggerProps.type;
const hidden: boolean = state.panelProps.hidden;
const expanded: boolean = state.triggerProps['aria-expanded'];
const action: DisclosureAction = 'toggle';
const transition: DisclosureOptions = { disabled: false };
const next: boolean = getDisclosureOpen(state.open, action, transition);
void [type, hidden, expanded, next];
// @ts-expect-error panelId is required
getDisclosureState({ triggerId: 'trigger' });
// @ts-expect-error unsupported action
getDisclosureOpen(false, 'select');
// @ts-expect-error open must be boolean
getDisclosureState({ ...options, open: 'yes' });
