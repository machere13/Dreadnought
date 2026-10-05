// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { getDisclosureState } from '../../src/index.ts';

describe('getDisclosureState', () => {
  it('connects a closed trigger and panel without mutating frozen input', () => {
    const options = Object.freeze({ triggerId: ':r0:-trigger', panelId: 'ответ-panel' });
    expect(getDisclosureState(options)).toEqual({
      open: false, disabled: false,
      triggerProps: { id: ':r0:-trigger', type: 'button', disabled: false,
        'aria-expanded': false, 'aria-controls': 'ответ-panel' },
      panelProps: { id: 'ответ-panel', hidden: true, 'aria-labelledby': ':r0:-trigger' },
    });
    expect(options).toEqual({ triggerId: ':r0:-trigger', panelId: 'ответ-panel' });
  });
  it.each([
    { open: false, disabled: false, expanded: false, hidden: true },
    { open: false, disabled: true, expanded: false, hidden: true },
    { open: true, disabled: false, expanded: true, hidden: false },
    { open: true, disabled: true, expanded: true, hidden: false },
  ])('keeps visibility and disabled independent: $open / $disabled', ({ open, disabled, expanded, hidden }) => {
    const options = Object.freeze({ open, disabled, triggerId: 'trigger', panelId: 'panel' });
    const state = getDisclosureState(options);
    expect(state.open).toBe(open);
    expect(state.disabled).toBe(disabled);
    expect(state.triggerProps['aria-expanded']).toBe(expanded);
    expect(state.triggerProps.disabled).toBe(disabled);
    expect(state.panelProps.hidden).toBe(hidden);
  });
  it.each(['', 'a b', 'a\tb', 'a\nb', 'a\fb', 'a\rb'])('rejects invalid trigger or panel ID %j', (id) => {
    expect(() => getDisclosureState({ triggerId: id, panelId: 'panel' })).toThrow();
    expect(() => getDisclosureState({ triggerId: 'trigger', panelId: id })).toThrow();
  });
  it('rejects equal IDs', () => {
    expect(() => getDisclosureState({ triggerId: 'same', panelId: 'same' })).toThrow();
  });
  it('preserves Unicode, encoded values and React-style IDs', () => {
    const state = getDisclosureState({ triggerId: ':r1:-триггер-%20', panelId: 'панель-%3F' });
    expect(state.triggerProps['aria-controls']).toBe('панель-%3F');
    expect(state.panelProps['aria-labelledby']).toBe(':r1:-триггер-%20');
  });
});
