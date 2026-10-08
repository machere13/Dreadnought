import { expect, it } from 'vitest';
import * as core from '../../../../src/index.ts';

it('derives modal semantics and suppresses disabled opening', () => {
  expect(core).toHaveProperty('getModalState');
  const state = core.getModalState({ triggerId: 'edit', panelId: 'profile', open: true });
  expect(state.open).toBe(true);
  expect(state.triggerProps['aria-haspopup']).toBe('dialog');
  expect(state.contentProps).toEqual({
    id: 'profile',
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': 'edit',
  });
  expect(
    core.getModalState({ triggerId: 'edit', panelId: 'profile', open: true, disabled: true }).open,
  ).toBe(false);
  expect(() => core.getModalState({ triggerId: 'same', panelId: 'same' })).toThrow();
});
