import { forwardRef } from 'react';
import { useTextarea } from './useTextarea.js';
import type { UseTextareaOptions } from './useTextarea.js';

export type TextareaAdapterProps = UseTextareaOptions;

export const TextareaAdapter = forwardRef<HTMLTextAreaElement, TextareaAdapterProps>(
  function TextareaAdapter(options, ref) {
    const { textareaProps } = useTextarea(options);
    return <textarea {...textareaProps} data-ui="textarea" ref={ref} />;
  },
);
