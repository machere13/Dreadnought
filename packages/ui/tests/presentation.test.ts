import { describe, expect, it } from 'vitest';
import * as ui from '../src/index.ts';

describe('framework-neutral presentation', () => {
  it('does not export React components', () => {
    expect(ui).not.toHaveProperty('Button');
    expect(ui).not.toHaveProperty('Input');
    expect(ui).not.toHaveProperty('TextArea');
  });

  it('provides classes for a native button and its variants', () => {
    expect(ui).toHaveProperty('buttonPresentation');
    const presentation = ui.buttonPresentation;
    const button = document.createElement('button');
    button.className = `${presentation.root} ${presentation.variants.secondary}`;

    expect(button.classList.contains('dreadnought-text-button')).toBe(true);
    expect(button.classList.contains(presentation.variants.secondary)).toBe(true);
    expect(presentation.variants.primary).not.toBe(presentation.variants.secondary);
  });

  it('provides classes for native input and textarea controls', () => {
    expect(ui).toHaveProperty('inputPresentation');
    expect(ui).toHaveProperty('textAreaPresentation');
    const input = document.createElement('div');
    input.className = ui.inputPresentation.root;
    const textArea = document.createElement('textarea');
    textArea.className = ui.textAreaPresentation.root;

    expect(input.classList.contains('dreadnought-text-input')).toBe(true);
    expect(textArea.classList.contains('dreadnought-text-text-area')).toBe(true);
  });
});
