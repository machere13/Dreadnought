import { describe, expect, it } from 'vitest';
import { getButtonState } from '../../src/button/getButtonState.js';

describe('getButtonState', () => {
  it('keeps a loading button focusable while blocking its action', () => {
    expect(getButtonState({ loading: true })).toEqual({
      nativeDisabled: false,
      ariaDisabled: true,
      busy: true,
      actionBlocked: true,
    });
  });

  it('uses native disabled semantics when explicitly disabled', () => {
    expect(getButtonState({ disabled: true, loading: true })).toEqual({
      nativeDisabled: true,
      ariaDisabled: false,
      busy: true,
      actionBlocked: true,
    });
  });
});
