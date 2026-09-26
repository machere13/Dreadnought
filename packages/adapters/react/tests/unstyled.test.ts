import { describe, expect, it } from 'vitest';
import * as unstyled from '../src/unstyled.ts';

describe('unstyled public API', () => {
  it('exports the second-layer Button as ButtonAdapter', () => {
    expect(unstyled).toHaveProperty('ButtonAdapter');
  });
});
