import type { TextAreaCore } from '@dreadnought/core';

function pixels(value: string): number {
  return Number.parseFloat(value) || 0;
}

function rowHeight(style: CSSStyleDeclaration): number {
  const fontSize = pixels(style.fontSize) || 16;
  const lineHeight = style.lineHeight.trim();
  if (lineHeight.endsWith('px')) return pixels(lineHeight);
  if (lineHeight.endsWith('%')) return fontSize * pixels(lineHeight) / 100;
  if (/^\d*\.?\d+$/.test(lineHeight)) return fontSize * Number(lineHeight);
  return fontSize * 1.2;
}

export function resizeTextArea(element: HTMLTextAreaElement, state: TextAreaCore) {
  const computed = getComputedStyle(element);
  const lineHeight = rowHeight(computed);
  const padding = pixels(computed.paddingTop) + pixels(computed.paddingBottom);
  const border = pixels(computed.borderTopWidth) + pixels(computed.borderBottomWidth);
  const extra = computed.boxSizing === 'border-box' ? padding + border : 0;

  element.style.height = '0px';
  const naturalHeight = element.scrollHeight + (computed.boxSizing === 'border-box' ? border : -padding);
  const minimumHeight = (state.minRows ?? state.rows) * lineHeight + extra;
  const maximumHeight = state.maxRows === undefined ? Infinity : state.maxRows * lineHeight + extra;
  const height = Math.min(Math.max(naturalHeight, minimumHeight), maximumHeight);

  element.style.height = `${Math.ceil(height)}px`;
  element.style.overflowY = naturalHeight > maximumHeight ? 'auto' : 'hidden';
}
