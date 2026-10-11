import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Input, Select, TextArea } from '../src/adapters/react/index.ts';

afterEach(cleanup);

it.each(['filled', 'borderless'] as const)(
  'applies %s and compact styling without leaking visual props to native fields',
  (variant) => {
    render(
      <>
        <Input aria-label="Input" variant={variant} controlSize="compact" size={12} />
        <TextArea aria-label="TextArea" variant={variant} controlSize="compact" />
        <Select aria-label="Select" variant={variant} controlSize="compact" options={[]} />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Input' });
    const textArea = screen.getByRole('textbox', { name: 'TextArea' });
    const select = screen.getByRole('combobox');
    for (const field of [input, textArea, select]) {
      const surface = field === textArea ? field : field.closest('[data-ui]')!;
      expect(surface.className).toContain(variant);
      expect(surface.className).toContain('compact');
      expect(field.hasAttribute('controlSize')).toBe(false);
      expect(field.hasAttribute('variant')).toBe(false);
    }
    expect(input.getAttribute('size')).toBe('12');
  },
);

it('preserves clearing and selection in compact borderless fields', () => {
  render(
    <>
      <Input
        aria-label="Input"
        controlSize="compact"
        variant="borderless"
        allowClear
        defaultValue="a"
      />
      <TextArea
        aria-label="TextArea"
        controlSize="compact"
        variant="borderless"
        allowClear
        showCount
        defaultValue="ab"
      />
      <Select
        aria-label="Select"
        controlSize="compact"
        variant="borderless"
        options={[{ value: 'a', label: 'Анна' }]}
      />
    </>,
  );
  for (const button of document.querySelectorAll('[data-slot="clear"]')) {
    fireEvent.click(button);
  }
  expect((screen.getByRole('textbox', { name: 'Input' }) as HTMLInputElement).value).toBe('');
  expect((screen.getByRole('textbox', { name: 'TextArea' }) as HTMLTextAreaElement).value).toBe('');
  expect(document.querySelector('[data-slot="count"]')?.textContent).toBe('0');
  fireEvent.click(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: 'Анна' }));
  expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Анна');
});
