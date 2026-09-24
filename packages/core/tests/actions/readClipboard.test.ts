import { afterEach, describe, expect, it, vi } from 'vitest';
import { readClipboard } from '../../src/actions/readClipboard.js';

afterEach(() => vi.unstubAllGlobals());

describe('readClipboard', () => {
  it('returns the current clipboard text', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { readText: async () => 'Dreadnought' },
    });

    expect(await readClipboard()).toBe('Dreadnought');
  });

  it('returns an empty string when the clipboard has no text', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { readText: async () => '' },
    });

    expect(await readClipboard()).toBe('');
  });

  it('propagates clipboard permission errors', async () => {
    const denied = new DOMException('Denied', 'NotAllowedError');
    vi.stubGlobal('navigator', {
      clipboard: { readText: async () => { throw denied; } },
    });

    await expect(readClipboard()).rejects.toBe(denied);
  });
});
