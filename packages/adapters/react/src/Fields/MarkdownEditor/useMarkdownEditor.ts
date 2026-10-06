import { applyMarkdownCommand } from '@dreadnought/core';
import type { MarkdownCommand, MarkdownDocument, MarkdownSelection } from '@dreadnought/core';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTextArea } from '../TextArea/index.ts';
import type { UseMarkdownEditorOptions, UseMarkdownEditorResult } from './markdownEditor.types.ts';

const normalize = (text: string) => text.replace(/\r\n?/g, '\n');
const readSelection = (node: HTMLTextAreaElement): MarkdownSelection => ({ start: node.selectionStart, end: node.selectionEnd });

function keyCommand(event: KeyboardEvent<HTMLTextAreaElement>): MarkdownCommand | undefined {
  if (event.altKey || (event.ctrlKey && event.metaKey)) return;
  if (!event.ctrlKey && !event.metaKey) return !event.shiftKey && event.key === 'Enter' ? { type: 'newLine' } : undefined;
  const key = event.key.toLowerCase();
  if (event.shiftKey) return key === 'x' ? { type: 'strikethrough' } : undefined;
  switch (key) {
    case 'b': return { type: 'bold' };
    case 'i': return { type: 'italic' };
    case 'e': return { type: 'inlineCode' };
    case ']': return { type: 'indent' };
    case '[': return { type: 'outdent' };
  }
}

export function useMarkdownEditor({ value: controlledValue, defaultValue = '', onValueChange, onChange, onSelect,
  onKeyDown, onCompositionStart, onCompositionEnd, ...options }: UseMarkdownEditorOptions = {}): UseMarkdownEditorResult {
  const initial = useRef(normalize(defaultValue));
  const [internal, setInternal] = useState(initial.current);
  const value = controlledValue === undefined ? internal : normalize(controlledValue);
  const controlled = controlledValue !== undefined;
  const [element, setElement] = useState<HTMLTextAreaElement | null>(null);
  const node = useRef<HTMLTextAreaElement | null>(null);
  const composing = useRef(false);
  const pending = useRef<{ document: MarkdownDocument; element: HTMLTextAreaElement } | null>(null);
  const [selection, setSelection] = useState<MarkdownSelection>({ start: 0, end: 0 });
  const [, update] = useState(0);

  function execute(command: MarkdownCommand) {
    const current = node.current;
    if (!current || options.disabled || options.readOnly || composing.current) return;
    const previous = !controlled && pending.current?.element === current ? pending.current.document : undefined;
    const result = applyMarkdownCommand(previous ?? { text: current.value, selection: readSelection(current) }, command);
    pending.current = { document: result, element: current };
    if (!controlled) setInternal(result.text);
    update(revision => revision + 1);
    onValueChange?.(result.text);
  }

  const area = useTextArea({ ...options, value,
    onChange(event) {
      onChange?.(event);
      pending.current = null;
      if (event.defaultPrevented || options.disabled || options.readOnly) return;
      const next = normalize(event.currentTarget.value);
      if (!controlled) setInternal(next);
      setSelection(readSelection(event.currentTarget));
      onValueChange?.(next);
    },
    onSelect(event) {
      onSelect?.(event);
      pending.current = null;
      setSelection(readSelection(event.currentTarget));
    },
    onCompositionStart(event) {
      composing.current = true;
      pending.current = null;
      onCompositionStart?.(event);
    },
    onCompositionEnd(event) {
      composing.current = false;
      onCompositionEnd?.(event);
    },
    onKeyDown(event) {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229 || composing.current || options.disabled || options.readOnly) return;
      const command = keyCommand(event);
      if (command) { event.preventDefault(); execute(command); }
    },
  });
  const textAreaRef = useCallback((current: HTMLTextAreaElement | null) => {
    if (node.current !== current) {
      pending.current = null;
      composing.current = false;
    }
    node.current = current;
    setElement(current);
    area.textAreaRef(current);
  }, [area.textAreaRef]);

  useLayoutEffect(() => {
    const result = pending.current;
    pending.current = null;
    if (result && result.element === node.current && result.document.text === value
      && !options.disabled && !options.readOnly && !composing.current) {
      result.element.focus();
      result.element.setSelectionRange(result.document.selection.start, result.document.selection.end);
    }
    if (node.current) {
      const next = readSelection(node.current);
      setSelection(current => current.start === next.start && current.end === next.end ? current : next);
    }
  });

  useEffect(() => {
    const form = element?.form;
    let mounted = true;
    function reset(event: Event) {
      queueMicrotask(() => {
        if (!mounted || event.defaultPrevented) return;
        pending.current = null;
        if (!controlled) setInternal(initial.current);
      });
    }
    form?.addEventListener('reset', reset);
    return () => { mounted = false; form?.removeEventListener('reset', reset); };
  }, [element, controlled, options.form]);

  return { value, selection, execute, textAreaProps: area.textAreaProps, textAreaRef,
    disabled: area.state.disabled, readOnly: area.state.readOnly };
}
