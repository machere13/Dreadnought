import { expect, it } from 'vitest';
import { getFloatingPanelState } from '../../../../src/index.ts';

it('connects the trigger to a nonmodal dialog', () => {
  const state = getFloatingPanelState({ triggerId: 'launch', panelId: 'panel', open: true });
  expect(state.triggerProps['aria-expanded']).toBe(true);
  expect(state.triggerProps['aria-controls']).toBe('panel');
  expect(state.contentProps.role).toBe('dialog');
  expect(state.contentProps['aria-modal']).toBe(false);
  expect(state.contentProps['aria-labelledby']).toBe('launch');
});

it('hides a disabled panel and disables its trigger', () => {
  const state = getFloatingPanelState({ triggerId: 'launch', panelId: 'panel', open: true, disabled: true });
  expect(state.open).toBe(false);
  expect(state.contentProps.hidden).toBe(true);
  expect(state.triggerProps.disabled).toBe(true);
});

it('rejects conflicting IDs', () => {
  expect(() => getFloatingPanelState({ triggerId: 'panel', panelId: 'panel' })).toThrow('Disclosure needs distinct');
});
