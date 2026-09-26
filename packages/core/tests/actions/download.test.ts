import { afterEach, describe, expect, it, vi } from 'vitest';
import { download } from '../../src/actions/download.ts';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('download', () => {
  it('starts a named download and releases its temporary URL', () => {
    vi.useFakeTimers();
    const blob = new Blob(['report'], { type: 'text/plain' });
    const created: Blob[] = [];
    const revoked: string[] = [];
    class DownloadURL extends URL {
      static createObjectURL(value: Blob) {
        created.push(value);
        return 'blob:report';
      }

      static revokeObjectURL(value: string) {
        revoked.push(value);
      }
    }
    vi.stubGlobal('URL', DownloadURL);

    let clicked: HTMLAnchorElement | undefined;
    let connectedAtClick = false;
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked = this;
      connectedAtClick = this.isConnected;
    });

    download(blob, 'report.txt');

    expect(created).toEqual([blob]);
    expect(clicked?.href).toBe('blob:report');
    expect(clicked?.download).toBe('report.txt');
    expect(connectedAtClick).toBe(true);
    expect(clicked?.isConnected).toBe(false);
    expect(revoked).toEqual([]);

    vi.runAllTimers();
    expect(revoked).toEqual(['blob:report']);
  });

  it('removes the temporary link when the browser rejects the click', () => {
    vi.useFakeTimers();
    const revoked: string[] = [];
    class DownloadURL extends URL {
      static createObjectURL() {
        return 'blob:blocked';
      }

      static revokeObjectURL(value: string) {
        revoked.push(value);
      }
    }
    vi.stubGlobal('URL', DownloadURL);

    let clicked: HTMLAnchorElement | undefined;
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked = this;
      throw new Error('blocked');
    });

    expect(() => download(new Blob(['report']), 'report.txt')).toThrow('blocked');
    expect(clicked?.isConnected).toBe(false);
    vi.runAllTimers();
    expect(revoked).toEqual(['blob:blocked']);
  });
});
