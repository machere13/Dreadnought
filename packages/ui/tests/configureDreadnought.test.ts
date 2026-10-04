import { afterEach, expect, it, vi } from 'vitest';
import { configureDreadnought } from '../src/index.ts';

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-dreadnought-wide-typography');
});

it('switches the page-wide setting and leaves it unchanged for omitted settings', () => {
  expect(document.documentElement.hasAttribute('data-dreadnought-wide-typography')).toBe(false);
  configureDreadnought({ wideTypography: false });
  expect(document.documentElement.getAttribute('data-dreadnought-wide-typography')).toBe('false');
  configureDreadnought({});
  expect(document.documentElement.getAttribute('data-dreadnought-wide-typography')).toBe('false');
  configureDreadnought({ wideTypography: true });
  expect(document.documentElement.getAttribute('data-dreadnought-wide-typography')).toBe('true');
});

it('does not require a DOM on the server and rejects invalid values', () => {
  vi.stubGlobal('document', undefined);
  expect(() => configureDreadnought({ wideTypography: false })).not.toThrow();
  expect(() => configureDreadnought({ wideTypography: 'false' as unknown as boolean })).toThrow(TypeError);
});
