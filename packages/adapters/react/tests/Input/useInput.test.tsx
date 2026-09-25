import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { useInput } from '../../src/Input/useInput.js';

afterEach(cleanup);

it('provides props for custom markup without styling it', () => {
  function CustomInput() {
    const { inputProps } = useInput({ type: 'search', invalid: true });
    return <input {...inputProps} aria-label="Find" />;
  }
  render(<CustomInput />);
  const input = screen.getByRole('searchbox', { name: 'Find' });
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.hasAttribute('class')).toBe(false);
});
