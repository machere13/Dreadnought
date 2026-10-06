import { applyMarkdownCommand, getHistoryState } from '@dreadnought/core';
import type { HistoryState, MarkdownCommand, MarkdownDocument, MarkdownSelection } from '@dreadnought/core';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTextArea } from '../TextArea/index.ts';
import type { MarkdownEditorPreview, UseMarkdownEditorOptions, UseMarkdownEditorResult } from './markdownEditor.types.ts';
import { baseline, continuousInput, recordDocument, sameSelection, snapshot } from './markdownHistory.ts';
import { beforeInputEvent } from './beforeInputEvent.ts';
import { useMarkdownImageUpload } from './useMarkdownImageUpload.ts';

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
  onKeyDown, onCompositionStart, onCompositionEnd, onBeforeInput, onBlur, historyLimit = 100,
  preview: controlledPreview, defaultPreview = 'edit', onPreviewChange, uploadImage, ...options }: UseMarkdownEditorOptions = {}): UseMarkdownEditorResult {
  if (!Number.isSafeInteger(historyLimit) || historyLimit <= 0) throw new RangeError('History limit must be a positive safe integer');
  const initial = useRef(normalize(defaultValue));
  const [internal, setInternal] = useState(initial.current);
  const value = controlledValue === undefined ? internal : normalize(controlledValue);
  const controlled = controlledValue !== undefined;
  const [internalPreview, setInternalPreview] = useState(defaultPreview);
  const preview = controlledPreview ?? internalPreview;
  if (!['edit', 'preview', 'live'].includes(preview)) throw new TypeError('Invalid Markdown preview mode');
  const [element, setElement] = useState<HTMLTextAreaElement | null>(null);
  const node = useRef<HTMLTextAreaElement | null>(null);
  const composing = useRef(false);
  const history = useRef(baseline(snapshot(value, { start: 0, end: 0 })));
  const group = useRef<{ type: string; time: number } | null>(null);
  const compositionChanged = useRef(false);
  const compositionEnding = useRef<object | null>(null);
  const pending = useRef<{ document: MarkdownDocument; history: HistoryState<MarkdownDocument>; element: HTMLTextAreaElement; focus: boolean; composition: boolean } | null>(null);
  const [selection, setSelection] = useState<MarkdownSelection>({ start: 0, end: 0 });
  const [, update] = useState(0);

  function setPreview(next: MarkdownEditorPreview) {
    if (!['edit', 'preview', 'live'].includes(next)) throw new TypeError('Invalid Markdown preview mode');
    if (next === preview) return;
    group.current = null;
    if (controlledPreview === undefined) setInternalPreview(next);
    onPreviewChange?.(next);
  }

  function publish(state: HistoryState<MarkdownDocument>, focus: boolean, composition = false) {
    const current = node.current;
    if (!current) return;
    if (state.present.text !== history.current.present.text) image.cancelImageUpload();
    pending.current = { document: state.present, history: state, element: current, focus, composition };
    if (!controlled) {
      if (composition && state.present.text !== history.current.present.text) compositionChanged.current = true;
      history.current = state;
      setInternal(state.present.text);
    }
    update(revision => revision + 1);
    onValueChange?.(state.present.text);
  }

  function travel(type: 'undo' | 'redo') {
    if (!node.current || options.disabled || options.readOnly || composing.current) return;
    group.current = null;
    compositionEnding.current = null;
    const state = history.current;
    const next = getHistoryState(state, { type }, { limit: historyLimit });
    if (next !== state) publish(next, true);
  }

  function execute(command: MarkdownCommand) {
    const current = node.current;
    if (!current || options.disabled || options.readOnly || composing.current || preview === 'preview') return;
    const previous = !controlled && pending.current?.element === current ? pending.current.document : undefined;
    const result = applyMarkdownCommand(previous ?? { text: current.value, selection: readSelection(current) }, command);
    group.current = null;
    compositionEnding.current = null;
    const state = getHistoryState(history.current, { type: 'replace', value: previous ?? snapshot(current.value, readSelection(current)) }, { limit: historyLimit });
    publish(recordDocument(state, result, false, historyLimit), true);
  }

  const image = useMarkdownImageUpload({ uploadImage,
    readDocument: () => {
      const current = node.current;
      if (!current || options.disabled || options.readOnly || composing.current || preview === 'preview') return null;
      return !controlled && pending.current?.element === current ? pending.current.document : snapshot(current.value, readSelection(current));
    },
    insert: (document, result) => {
      group.current = null;
      compositionEnding.current = null;
      const state = getHistoryState(history.current, { type: 'replace', value: document }, { limit: historyLimit });
      publish(recordDocument(state, result, false, historyLimit), true);
    },
  });

  const area = useTextArea({ ...options, value,
    onChange(event) {
      onChange?.(event);
      pending.current = null;
      if (event.defaultPrevented || options.disabled || options.readOnly) return;
      const next = normalize(event.currentTarget.value);
      const document = snapshot(next, readSelection(event.currentTarget));
      const inputType = (event.nativeEvent as InputEvent).inputType ?? '';
      const time = Date.now();
      const composition = composing.current || !!compositionEnding.current || inputType === 'insertFromComposition';
      compositionEnding.current = null;
      const merge = composition ? compositionChanged.current : group.current?.type === inputType
        && time - group.current.time <= 500 && continuousInput(inputType, history.current.present, document);
      const state = recordDocument(history.current, document, !!merge, historyLimit);
      group.current = !composition && continuousInput(inputType, history.current.present, document) ? { type: inputType, time } : null;
      setSelection(document.selection);
      publish(state, false, composition);
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
      image.cancelImageUpload();
      composing.current = true;
      compositionEnding.current = null;
      compositionChanged.current = false;
      group.current = null;
      pending.current = null;
      onCompositionStart?.(event);
    },
    onCompositionEnd(event) {
      composing.current = false;
      group.current = null;
      const ending = {};
      compositionEnding.current = ending;
      queueMicrotask(() => { if (compositionEnding.current === ending) compositionEnding.current = null; });
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
      image.cancelImageUpload();
      pending.current = null;
      composing.current = false;
      compositionEnding.current = null;
      group.current = null;
    }
    node.current = current;
    setElement(current);
    area.textAreaRef(current);
  }, [area.textAreaRef, image.cancelImageUpload]);

  useLayoutEffect(() => {
    const result = pending.current;
    pending.current = null;
    if (result && result.element === node.current && result.document.text === value) {
      if (result.composition && history.current.present.text !== value) compositionChanged.current = true;
      if (history.current !== result.history) { history.current = result.history; update(revision => revision + 1); }
    } else if (history.current.present.text !== value) {
      image.cancelImageUpload();
      history.current = baseline(snapshot(value, node.current ? readSelection(node.current) : { start: 0, end: 0 }));
      group.current = null;
      compositionChanged.current = false;
      compositionEnding.current = null;
      update(revision => revision + 1);
    } else if (result) { group.current = null; }
    if (result && result.element === node.current && result.document.text === value
      && result.focus && !options.disabled && !options.readOnly && !composing.current) {
      result.element.setSelectionRange(result.document.selection.start, result.document.selection.end);
      if (preview !== 'preview') result.element.focus();
    }
    if (node.current) {
      const next = readSelection(node.current);
      setSelection(current => current.start === next.start && current.end === next.end ? current : next);
    }
  });

  useLayoutEffect(() => {
    group.current = null;
    if (preview === 'preview' && node.current === node.current?.ownerDocument.activeElement) node.current?.blur();
  }, [preview]);

  useLayoutEffect(() => {
    if (options.disabled || options.readOnly || preview === 'preview' || !uploadImage) image.cancelImageUpload();
  }, [options.disabled, options.readOnly, preview, uploadImage, image.cancelImageUpload]);

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
        image.cancelImageUpload();
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

  return { value, selection, preview, setPreview, execute, ...image, undo: () => travel('undo'), redo: () => travel('redo'),
    canUndo: !options.disabled && !options.readOnly && history.current.past.length > 0,
    canRedo: !options.disabled && !options.readOnly && history.current.future.length > 0,
    textAreaProps: area.textAreaProps, textAreaRef,
    disabled: area.state.disabled, readOnly: area.state.readOnly };
}
