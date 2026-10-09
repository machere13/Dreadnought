import { describe, expect, it } from 'vitest';
import { getContentMountState } from '../../src/index.ts';

describe('getContentMountState', () => {
  it.each([
    { mountPolicy: 'eager', active: false, visited: false, mounted: true },
    { mountPolicy: 'eager', active: true, visited: false, mounted: true },
    { mountPolicy: 'eager', active: false, visited: true, mounted: true },
    { mountPolicy: 'lazy', active: false, visited: false, mounted: false },
    { mountPolicy: 'lazy', active: true, visited: false, mounted: true },
    { mountPolicy: 'lazy', active: false, visited: true, mounted: true },
    { mountPolicy: 'unmount', active: false, visited: false, mounted: false },
    { mountPolicy: 'unmount', active: true, visited: false, mounted: true },
    { mountPolicy: 'unmount', active: false, visited: true, mounted: false },
  ] as const)('applies $mountPolicy for active=$active, visited=$visited', (options) => {
    expect(getContentMountState(options)).toEqual({
      mounted: options.mounted,
      visited: options.active || options.visited,
    });
  });

  it('keeps the default eager and carries visits across close and reopen', () => {
    expect(getContentMountState()).toEqual({ mounted: true, visited: false });
    const opened = getContentMountState({ active: true, mountPolicy: 'lazy' });
    expect(getContentMountState({ visited: opened.visited, mountPolicy: 'lazy' })).toEqual({
      mounted: true,
      visited: true,
    });
  });

  it('rejects an unsupported policy instead of silently mounting content', () => {
    expect(() => getContentMountState({ mountPolicy: 'invalid' as never })).toThrow(
      'Content mount policy must be eager, lazy or unmount.',
    );
  });
});
