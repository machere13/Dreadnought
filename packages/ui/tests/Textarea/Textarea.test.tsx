import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Textarea } from '../../src/Textarea/Textarea.js';

afterEach(cleanup);

it('adds local styling without changing adapter semantics', () => {
  render(<Textarea aria-label="Notes" invalid className="custom" rows={3} />);
  const area = screen.getByRole('textbox', { name: 'Notes' });
  expect(area.classList.contains('custom')).toBe(true);
  expect(area.classList.contains('dreadnought-text-textarea')).toBe(true);
  expect(area.getAttribute('aria-invalid')).toBe('true');
  expect(area.getAttribute('rows')).toBe('3');
});
