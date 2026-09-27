import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Icon } from '@dreadnought/ui/react';

afterEach(cleanup);

it.each(['eye', 'eye-off', 'search', 'check', 'close', 'down'] as const)('renders named icon %s as SVG', (name) => {
  const { container } = render(<Icon name={name} />);
  expect(container.querySelector('[data-ui="icon"] svg')).not.toBeNull();
  expect(container.querySelector('[data-ui="icon"]')?.getAttribute('aria-hidden')).toBe('true');
});

it('exposes a label for a meaningful standalone icon', () => {
  render(<Icon name="check" aria-label="Done" />);
  expect(screen.getByRole('img', { name: 'Done' }).querySelector('svg')).not.toBeNull();
});
