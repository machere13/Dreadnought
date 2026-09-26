import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Input } from '../../src/Input/Input.js';

afterEach(cleanup);

it('composes styled and consumer classes while preserving adapter semantics', () => {
  render(<Input aria-label="Search" type="search" invalid className="custom" />);
  const input = screen.getByRole('searchbox', { name: 'Search' });
  expect(input.parentElement?.classList.contains('custom')).toBe(true);
  expect(input.parentElement?.classList.contains('dreadnought-text-input')).toBe(true);
  expect(input.getAttribute('aria-invalid')).toBe('true');
});
