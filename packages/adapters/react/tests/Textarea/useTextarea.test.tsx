import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { useTextarea } from '../../src/Textarea/useTextarea.js';

afterEach(cleanup);

it('provides props for custom unstyled markup', () => {
  function CustomTextarea() {
    const { textareaProps } = useTextarea({ invalid: true, rows: 3 });
    return <textarea {...textareaProps} aria-label="Custom" />;
  }
  render(<CustomTextarea />);
  const area = screen.getByRole('textbox', { name: 'Custom' });
  expect(area.getAttribute('aria-invalid')).toBe('true');
  expect(area.getAttribute('rows')).toBe('3');
  expect(area.hasAttribute('class')).toBe(false);
});
