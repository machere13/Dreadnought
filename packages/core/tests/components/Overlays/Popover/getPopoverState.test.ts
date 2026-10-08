import { expect, it } from 'vitest';
import * as core from '../../../../src/index.ts';

it('connects a popover trigger to a nonmodal dialog and suppresses disabled opening', () => {
  expect(core).toHaveProperty('getPopoverState');
  const state = core.getPopoverState({
    triggerId: 'settings-button',
    panelId: 'settings',
    open: true,
  });
  expect(state.triggerProps).toEqual({
    id: 'settings-button',
    type: 'button',
    disabled: false,
    'aria-expanded': true,
    'aria-controls': 'settings',
    'aria-haspopup': 'dialog',
  });
  expect(state.contentProps).toEqual({
    id: 'settings',
    hidden: false,
    role: 'dialog',
    'aria-modal': false,
    'aria-labelledby': 'settings-button',
  });
  expect(
    core.getPopoverState({ triggerId: 'trigger', panelId: 'popup', open: true, disabled: true })
      .open,
  ).toBe(false);
  expect(() => core.getPopoverState({ triggerId: 'same', panelId: 'same' })).toThrow();
});
