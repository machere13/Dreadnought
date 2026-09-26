import { describe, expect, it } from 'vitest';
import { getButtonState } from '../../../../src/components/Controls/Button/getButtonState.ts';

describe('getButtonState', () => {
  it('keeps a loading button focusable while blocking its action', () => {
    expect(getButtonState({ loading: true })).toEqual({
      disabled: false,
      ariaDisabled: true,
      busy: true,
      actionBlocked: true,
    });
  });

  it('uses native disabled semantics when explicitly disabled', () => {
    expect(getButtonState({ disabled: true, loading: true })).toEqual({
      disabled: true,
      ariaDisabled: false,
      busy: true,
      actionBlocked: true,
    });
  });
});
