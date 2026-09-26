import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { TextArea } from '../../src/styled.js';

afterEach(cleanup);

it('adds local styling without changing adapter semantics', () => {
  render(<TextArea aria-label="Notes" invalid className="custom" rows={3} />);
  const area = screen.getByRole('textbox', { name: 'Notes' });
  expect(area.classList.contains('custom')).toBe(true);
  expect(area.classList.contains('dreadnought-text-text-area')).toBe(true);
  expect(area.getAttribute('aria-invalid')).toBe('true');
  expect(area.getAttribute('rows')).toBe('3');
});

it('passes manual resize limits to the styled field without leaking custom props to DOM', () => {
  render(<TextArea aria-label="Notes" rows={4} minRows={2} maxRows={6} />);
  const area = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
  expect(area.getAttribute('rows')).toBe('4');
  expect(area.style.getPropertyValue('--dreadnought-text-area-min-rows')).toBe('2');
  expect(area.style.getPropertyValue('--dreadnought-text-area-max-rows')).toBe('6');
  expect(area.hasAttribute('data-min-rows')).toBe(true);
  expect(area.hasAttribute('data-max-rows')).toBe(true);
  expect(area.hasAttribute('minRows')).toBe(false);
});
