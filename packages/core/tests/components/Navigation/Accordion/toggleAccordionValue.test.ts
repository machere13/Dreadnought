import { describe, expect, it } from 'vitest';
import { toggleAccordionValue } from '../../../../src/components/Navigation/Accordion/toggleAccordionValue.ts';

describe('toggleAccordionValue', () => {
  it('opens a single item and closes it on a repeated toggle', () => {
    expect(toggleAccordionValue(null, 'a')).toBe('a');
    expect(toggleAccordionValue('a', 'a')).toBeNull();
    expect(toggleAccordionValue('a', 'b')).toBe('b');
  });

  it('adds and removes multiple items without changing the input', () => {
    const before = ['a', 'b'];
    expect(toggleAccordionValue(before, 'c')).toEqual(['a', 'b', 'c']);
    expect(toggleAccordionValue(before, 'a')).toEqual(['b']);
    expect(before).toEqual(['a', 'b']);
  });
});
