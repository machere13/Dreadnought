import { afterEach, describe, expect, it, vi } from 'vitest';
import { pickFiles } from '../../src/actions/pickFiles.js';

afterEach(() => vi.restoreAllMocks());

describe('pickFiles', () => {
  it('returns a selected file and removes the temporary input', async () => {
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' });
    let input: HTMLInputElement | undefined;
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
      input = this;
    });

    const selection = pickFiles();
    expect(input?.isConnected).toBe(true);
    expect(input?.type).toBe('file');
    expect(input?.multiple).toBe(false);
    Object.defineProperty(input, 'files', { value: [file] });
    input?.dispatchEvent(new Event('change'));

    expect(await selection).toEqual([file]);
    expect(input?.isConnected).toBe(false);
  });

  it('passes file options to the picker and returns multiple files', async () => {
    const first = new File(['a'], 'a.png', { type: 'image/png' });
    const second = new File(['b'], 'b.png', { type: 'image/png' });
    let input: HTMLInputElement | undefined;
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
      input = this;
    });

    const selection = pickFiles({ accept: 'image/*', multiple: true });
    expect(input?.accept).toBe('image/*');
    expect(input?.multiple).toBe(true);
    Object.defineProperty(input, 'files', { value: [first, second] });
    input?.dispatchEvent(new Event('change'));

    expect(await selection).toEqual([first, second]);
    expect(input?.isConnected).toBe(false);
  });

  it('returns an empty array when the user cancels', async () => {
    let input: HTMLInputElement | undefined;
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
      input = this;
    });

    const selection = pickFiles();
    input?.dispatchEvent(new Event('cancel'));

    expect(await selection).toEqual([]);
    expect(input?.isConnected).toBe(false);
  });

  it('rejects and removes the input if opening the picker throws', async () => {
    let input: HTMLInputElement | undefined;
    const error = new Error('blocked');
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
      input = this;
      throw error;
    });

    await expect(pickFiles()).rejects.toBe(error);
    expect(input?.isConnected).toBe(false);
  });
});
