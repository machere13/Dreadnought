import { applyMarkdownCommand, getHistoryState } from '@dreadnought/core';
import type { HistoryState, MarkdownCommand, MarkdownDocument, MarkdownSelection } from '@dreadnought/core';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTextArea } from '../TextArea/index.ts';
import type { UseMarkdownEditorOptions, UseMarkdownEditorResult } from './markdownEditor.types.ts';
import { baseline, continuousInput, recordDocument, sameSelection, snapshot } from './markdownHistory.ts';
import { beforeInputEvent } from './beforeInputEvent.ts';

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
  onKeyDown, onCompositionStart, onCompositionEnd, onBeforeInput, onBlur, historyLimit = 100, ...options }: UseMarkdownEditorOptions = {}): UseMarkdownEditorResult {
  if (!Number.isSafeInteger(historyLimit) || historyLimit <= 0) throw new RangeError('History limit must be a positive safe integer');
  const initial = useRef(normalize(defaultValue));
  const [internal, setInternal] = useState(initial.current);
  const value = controlledValue === undefined ? internal : normalize(controlledValue);
  const controlled = controlledValue !== undefined;
  const [element, setElement] = useState<HTMLTextAreaElement | null>(null);
  const node = useRef<HTMLTextAreaElement | null>(null);
  const composing = useRef(false);
  const history = useRef(baseline(snapshot(value, { start: 0, end: 0 })));
  const group = useRef<{ type: string; time: number } | null>(null);
  const compositionChanged = useRef(false);
  const pending = useRef<{ document: MarkdownDocument; history: HistoryState<MarkdownDocument>; element: HTMLTextAreaElement; focus: boolean } | null>(null);
  const [selection, setSelection] = useState<MarkdownSelection>({ start: 0, end: 0 });
  const [, update] = useState(0);

  function publish(state: HistoryState<MarkdownDocument>, focus: boolean) {
    const current = node.current;
    if (!current) return;
    pending.current = { document: state.present, history: state, element: current, focus };
    if (!controlled) { history.current = state; setInternal(state.present.text); }
    update(revision => revision + 1);
    onValueChange?.(state.present.text);
  }

  function travel(type: 'undo' | 'redo') {
    if (!node.current || options.disabled || options.readOnly || composing.current) return;
    group.current = null;
    const state = history.current;
    const next = getHistoryState(state, { type }, { limit: historyLimit });
    if (next !== state) publish(next, true);
  }

  function execute(command: MarkdownCommand) {
    const current = node.current;
    if (!current || options.disabled || options.readOnly || composing.current) return;
    const previous = !controlled && pending.current?.element === current ? pending.current.document : undefined;
    const result = applyMarkdownCommand(previous ?? { text: current.value, selection: readSelection(current) }, command);
    group.current = null;
    const state = getHistoryState(history.current, { type: 'replace', value: previous ?? snapshot(current.value, readSelection(current)) }, { limit: historyLimit });
    publish(recordDocument(state, result, false, historyLimit), true);
  }

  const area = useTextArea({ ...options, value,
    onChange(event) {
      onChange?.(event);
      pending.current = null;
      if (event.defaultPrevented || options.disabled || options.readOnly) return;
      const next = normalize(event.currentTarget.value);
      const document = snapshot(next, readSelection(event.currentTarget));
      const inputType = (event.nativeEvent as InputEvent).inputType ?? '';
      const time = Date.now();
      const merge = composing.current ? compositionChanged.current : group.current?.type === inputType
        && time - group.current.time <= 500 && continuousInput(inputType, history.current.present, document);
      const state = recordDocument(history.current, document, !!merge, historyLimit);
      if (composing.current && next !== history.current.present.text) compositionChanged.current = true;
      group.current = continuousInput(inputType, history.current.present, document) ? { type: inputType, time } : null;
      setSelection(document.selection);
      publish(state, false);
    },
    onSelect(event) {
      onSelect?.(event);
      if (event.defaultPrevented || pending.current) return;
      pending.current = null;
      const next = readSelection(event.currentTarget);
      if (!sameSelection(history.current.present.selection, next)) group.current = null;
      history.current = getHistoryState(history.current, { type: 'replace', value: snapshot(value, next) }, { limit: historyLimit });
      setSelection(next);
    },
    onBlur(event) {
      group.current = null;
      onBlur?.(event);
    },
    onCompositionStart(event) {
      composing.current = true;
      compositionChanged.current = false;
      group.current = null;
      pending.current = null;
      onCompositionStart?.(event);
    },
    onCompositionEnd(event) {
      composing.current = false;
      group.current = null;
      onCompositionEnd?.(event);
    },
    onKeyDown(event) {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229 || composing.current || options.disabled || options.readOnly) return;
      const key = event.key.toLowerCase();
      if (!event.altKey && !(event.ctrlKey && event.metaKey) && (event.ctrlKey || event.metaKey)
        && (key === 'z' || (key === 'y' && event.ctrlKey && !event.shiftKey))) {
        event.preventDefault();
        travel(key === 'y' || event.shiftKey ? 'redo' : 'undo');
        return;
      }
      const command = keyCommand(event);
      if (command) { event.preventDefault(); execute(command); }
    },
  });
  const textAreaRef = useCallback((current: HTMLTextAreaElement | null) => {
    if (node.current !== current) {
      pending.current = null;
      composing.current = false;
      group.current = null;
    }
    node.current = current;
    setElement(current);
    area.textAreaRef(current);
  }, [area.textAreaRef]);

  useLayoutEffect(() => {
    const result = pending.current;
    pending.current = null;
    if (result && result.element === node.current && result.document.text === value) {
      if (history.current !== result.history) { history.current = result.history; update(revision => revision + 1); }
    } else if (history.current.present.text !== value) {
      history.current = baseline(snapshot(value, node.current ? readSelection(node.current) : { start: 0, end: 0 }));
      group.current = null;
      update(revision => revision + 1);
    } else if (result) { group.current = null; }
    if (result && result.element === node.current && result.document.text === value
      && result.focus && !options.disabled && !options.readOnly && !composing.current) {
      result.element.focus();
      result.element.setSelectionRange(result.document.selection.start, result.document.selection.end);
    }
    if (node.current) {
      const next = readSelection(node.current);
      setSelection(current => current.start === next.start && current.end === next.end ? current : next);
    }
  });

  useEffect(() => {
    if (!element) return;
    function beforeInput(raw: Event) {
      const event = raw as InputEvent;
      onBeforeInput?.(beforeInputEvent(event, element!));
      if (event.defaultPrevented || !event.cancelable || event.isComposing || composing.current || options.disabled || options.readOnly) return;
      if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') {
        event.preventDefault();
        travel(event.inputType === 'historyUndo' ? 'undo' : 'redo');
      }
    }
    element.addEventListener('beforeinput', beforeInput);
    return () => element.removeEventListener('beforeinput', beforeInput);
  });

  useEffect(() => {
    const form = element?.form;
    let mounted = true;
    function reset(event: Event) {
      queueMicrotask(() => {
        if (!mounted || event.defaultPrevented) return;
        pending.current = null;
        group.current = null;
        if (!controlled) {
          history.current = baseline(snapshot(initial.current, { start: 0, end: 0 }));
          setInternal(initial.current);
          update(revision => revision + 1);
        }
      });
    }
    form?.addEventListener('reset', reset);
    return () => { mounted = false; form?.removeEventListener('reset', reset); };
  }, [element, controlled, options.form]);

  return { value, selection, execute, undo: () => travel('undo'), redo: () => travel('redo'),
    canUndo: !options.disabled && !options.readOnly && history.current.past.length > 0,
    canRedo: !options.disabled && !options.readOnly && history.current.future.length > 0,
    textAreaProps: area.textAreaProps, textAreaRef,
    disabled: area.state.disabled, readOnly: area.state.readOnly };
}
