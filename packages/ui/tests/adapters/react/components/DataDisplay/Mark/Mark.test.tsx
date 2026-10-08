import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Mark } from '@dreadnought/ui/react';

afterEach(cleanup);

it('allows a caller-supplied mark color without changing global tokens', () => {
  const { container } = render(<Mark shape="square" color="rgb(118 211 160 / 100%)" />);
  expect(
    (container.querySelector('[data-ui="mark"]') as HTMLElement).style.getPropertyValue(
      '--dreadnought-mark-color',
    ),
  ).toBe('rgb(118 211 160 / 100%)');
});
