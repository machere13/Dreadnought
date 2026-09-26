import { getTextAreaState } from '@dreadnought/core';
import type { TextAreaCore } from '@dreadnought/core';
import { useCallback, useLayoutEffect, useRef } from 'react';
import type { InputEvent, RefCallback, TextareaHTMLAttributes } from 'react';
import { resizeTextArea } from './resizeTextArea.ts';

export interface UseTextAreaOptions extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  minRows?: number;
  maxRows?: number;
  autoSize?: boolean;
}

export function useTextArea({
  disabled,
  readOnly,
  required,
  invalid,
  rows,
  minRows,
  maxRows,
  autoSize,
  onInput,
  style,
  ...rest
}: UseTextAreaOptions = {}): {
  textAreaProps: TextareaHTMLAttributes<HTMLTextAreaElement>;
  textAreaRef: RefCallback<HTMLTextAreaElement>;
  state: TextAreaCore;
} {
  const state = getTextAreaState({ disabled, readOnly, required, invalid, rows, minRows, maxRows, autoSize });
  const elementRef = useRef<HTMLTextAreaElement | null>(null);
  const wasAutoSized = useRef(false);
  const textAreaRef = useCallback((element: HTMLTextAreaElement | null) => {
    elementRef.current = element;
  }, []);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    if (!state.autoSize) {
      if (wasAutoSized.current) {
        element.style.height = typeof style?.height === 'number' ? `${style.height}px` : style?.height ?? '';
        element.style.overflowY = style?.overflowY ?? '';
      }
      wasAutoSized.current = false;
      return;
    }

    wasAutoSized.current = true;
    const update = () => resizeTextArea(element, state);
    update();
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    observer?.observe(element);
    window.addEventListener('resize', update);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
    };
  });

  function handleInput(event: InputEvent<HTMLTextAreaElement>) {
    onInput?.(event);
    if (state.autoSize) resizeTextArea(event.currentTarget, state);
  }

  const minimumRows = state.autoSize || state.minRows !== undefined || state.maxRows !== undefined
    ? Math.min(state.minRows ?? (state.autoSize ? state.rows : 1), state.maxRows ?? Infinity)
    : undefined;
  const textAreaProps = {
    ...rest,
    rows: state.autoSize ? 1 : state.rows,
    disabled: state.disabled,
    readOnly: state.readOnly,
    required: state.required,
    'aria-invalid': state.invalid ? true : rest['aria-invalid'],
    'data-invalid': state.invalid ? '' : undefined,
    'data-auto-size': state.autoSize ? '' : undefined,
    'data-min-rows': minimumRows === undefined ? undefined : '',
    'data-max-rows': state.maxRows === undefined ? undefined : '',
    style: {
      ...style,
      '--dreadnought-text-area-min-rows': minimumRows,
      '--dreadnought-text-area-max-rows': state.maxRows,
      ...(state.autoSize ? { resize: 'none' as const, overflowY: 'hidden' as const } : {}),
    },
    onInput: handleInput,
  };

  return { textAreaProps, textAreaRef, state };
}
