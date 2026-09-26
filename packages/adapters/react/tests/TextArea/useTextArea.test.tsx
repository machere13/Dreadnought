import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { useTextArea } from '../../src/TextArea/useTextArea.ts';

afterEach(cleanup);

it('provides props for custom unstyled markup', () => {
  function CustomTextArea() {
    const { textAreaProps } = useTextArea({ invalid: true, rows: 3 });
    return <textarea {...textAreaProps} aria-label="Custom" />;
  }
  render(<CustomTextArea />);
  const area = screen.getByRole('textbox', { name: 'Custom' });
  expect(area.getAttribute('aria-invalid')).toBe('true');
  expect(area.getAttribute('rows')).toBe('3');
  expect(area.hasAttribute('class')).toBe(false);
});
