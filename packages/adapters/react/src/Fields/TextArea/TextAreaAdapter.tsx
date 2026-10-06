import { forwardRef, useCallback } from 'react';
import { useTextArea } from './useTextArea.ts';
import type { UseTextAreaOptions } from './useTextArea.ts';
import { attachRef } from '../../shared/attachRef.ts';

export type TextAreaAdapterProps = UseTextAreaOptions;

export const TextAreaAdapter = forwardRef<HTMLTextAreaElement, TextAreaAdapterProps>(
  function TextAreaAdapter(options, ref) {
    const { textAreaProps, textAreaRef } = useTextArea(options);
    const setRef = useCallback((element: HTMLTextAreaElement | null) => {
      textAreaRef(element);
      if (element) return attachRef(element, ref, () => textAreaRef(null));
    }, [ref, textAreaRef]);

    return <textarea {...textAreaProps} data-ui="text-area" ref={setRef} />;
  },
);
