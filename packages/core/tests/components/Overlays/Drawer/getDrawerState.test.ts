import { expect, it } from 'vitest';
import * as core from '../../../../src/index.ts';

it('exposes the shared dialog contract through Drawer', () => {
  expect(core).toHaveProperty('getDrawerState');
  expect(core.getDrawerState).toBe(core.getModalState);
  expect(core.getDrawerState({ triggerId: 'open', panelId: 'panel', open: true })).toEqual({
    open: true,
    triggerProps: { id: 'open', type: 'button', disabled: false, 'aria-controls': 'panel', 'aria-expanded': true, 'aria-haspopup': 'dialog' },
    contentProps: { id: 'panel', role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'open' },
  });
  expect(core.getDrawerState({ triggerId: 'open', panelId: 'panel', open: true, disabled: true }).open).toBe(false);
});
