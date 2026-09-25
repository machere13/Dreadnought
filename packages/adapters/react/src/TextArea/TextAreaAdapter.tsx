import { forwardRef, useCallback } from 'react';
import { useTextArea } from './useTextArea.js';
import type { UseTextAreaOptions } from './useTextArea.js';

export type TextAreaAdapterProps = UseTextAreaOptions;

export const TextAreaAdapter = forwardRef<HTMLTextAreaElement, TextAreaAdapterProps>(
  function TextAreaAdapter(options, ref) {
    const { textAreaProps, textAreaRef } = useTextArea(options);
    const setRef = useCallback((element: HTMLTextAreaElement | null) => {
      textAreaRef(element);
      if (typeof ref === 'function') ref(element);
      else if (ref) ref.current = element;
    }, [ref, textAreaRef]);

    return <textarea {...textAreaProps} data-ui="text-area" ref={setRef} />;
  },
);
