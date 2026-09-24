import { afterEach, describe, expect, it, vi } from 'vitest';
import { copy } from '../../src/actions/copy.js';

afterEach(() => vi.unstubAllGlobals());

describe('copy', () => {
  it('writes the requested text to the clipboard', async () => {
    const written: string[] = [];
    vi.stubGlobal('navigator', {
      clipboard: { writeText: async (text: string) => { written.push(text); } },
    });

    await copy('Dreadnought');

    expect(written).toEqual(['Dreadnought']);
  });

  it('propagates clipboard permission errors', async () => {
    const denied = new DOMException('Denied', 'NotAllowedError');
    vi.stubGlobal('navigator', {
      clipboard: { writeText: async () => { throw denied; } },
    });

    await expect(copy('Dreadnought')).rejects.toBe(denied);
  });
});
