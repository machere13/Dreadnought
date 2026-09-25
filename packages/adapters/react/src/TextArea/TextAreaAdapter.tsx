import { forwardRef } from 'react';
import { useTextArea } from './useTextArea.js';
import type { UseTextAreaOptions } from './useTextArea.js';

export type TextAreaAdapterProps = UseTextAreaOptions;

export const TextAreaAdapter = forwardRef<HTMLTextAreaElement, TextAreaAdapterProps>(
  function TextAreaAdapter(options, ref) {
    const { textAreaProps } = useTextArea(options);
    return <textarea {...textAreaProps} data-ui="text-area" ref={ref} />;
  },
);
