import { createRequire } from 'node:module';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Button, Input, TextArea } from '@dreadnought/ui/react';
import { ButtonAdapter, InputAdapter, TextAreaAdapter } from '@dreadnought/react/unstyled';
import { buttonPresentation, inputPresentation, textAreaPresentation } from '@dreadnought/ui';

afterEach(cleanup);

it('publishes the ready React entrypoint from the visual layer', () => {
  const require = createRequire(import.meta.url);
  expect(() => require.resolve('@dreadnought/ui/react')).not.toThrow();
});

it('styles the ready button without styling its adapter on the same page', () => {
  render(<><Button>Ready</Button><ButtonAdapter>Base</ButtonAdapter></>);

  const ready = screen.getByRole('button', { name: 'Ready' });
  const base = screen.getByRole('button', { name: 'Base' });
  expect(ready.className).toContain(buttonPresentation.variants.primary);
  expect(base.className).not.toContain(buttonPresentation.variants.primary);
  expect(base.className).not.toContain('dreadnought-text-button');
});

it('styles the ready input without styling its adapter on the same page', () => {
  render(<><Input aria-label="Ready input" /><InputAdapter aria-label="Base input" /></>);

  const ready = screen.getByRole('textbox', { name: 'Ready input' });
  const base = screen.getByRole('textbox', { name: 'Base input' });
  expect(ready.parentElement?.className).toContain(inputPresentation.root);
  expect(base.parentElement?.className).not.toContain(inputPresentation.root);
});

it('styles the ready textarea without styling its adapter on the same page', () => {
  render(<><TextArea aria-label="Ready area" /><TextAreaAdapter aria-label="Base area" /></>);

  const ready = screen.getByRole('textbox', { name: 'Ready area' });
  const base = screen.getByRole('textbox', { name: 'Base area' });
  expect(ready.className).toContain(textAreaPresentation.root);
  expect(base.className).not.toContain(textAreaPresentation.root);
});
