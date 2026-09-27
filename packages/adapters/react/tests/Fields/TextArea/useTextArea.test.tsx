import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { useTextArea } from '../../../src/Fields/TextArea/useTextArea.ts';

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

it('moves auto-size observation when custom markup replaces the textarea node', () => {
  function CustomTextArea({ version }: { version: number }) {
    const { textAreaProps, textAreaRef } = useTextArea({ autoSize: true, rows: 1,
      style: { boxSizing: 'content-box', lineHeight: '20px', padding: 0, border: 0 } });
    return <textarea key={version} {...textAreaProps} ref={textAreaRef} aria-label="Custom" />;
  }

  const { rerender } = render(<CustomTextArea version={1} />);
  const first = screen.getByRole('textbox', { name: 'Custom' }) as HTMLTextAreaElement;
  Object.defineProperty(first, 'scrollHeight', { configurable: true, get: () => 80 });
  window.dispatchEvent(new Event('resize'));
  expect(first.style.height).toBe('80px');

  rerender(<CustomTextArea version={2} />);
  const replacement = screen.getByRole('textbox', { name: 'Custom' }) as HTMLTextAreaElement;
  Object.defineProperty(replacement, 'scrollHeight', { configurable: true, get: () => 120 });
  window.dispatchEvent(new Event('resize'));
  expect(replacement.style.height).toBe('120px');
});
