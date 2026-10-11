import { forwardRef, useCallback } from 'react';
import { useTextArea } from './useTextArea.ts';
import type { UseTextAreaOptions } from './useTextArea.ts';
import { attachRef } from '../../shared/attachRef.ts';
import type { ReactNode } from 'react';

export type TextAreaAdapterProps = UseTextAreaOptions & { clearContent?: ReactNode };

export const TextAreaAdapter = forwardRef<HTMLTextAreaElement, TextAreaAdapterProps>(
  function TextAreaAdapter({ clearContent = '×', ...options }, ref) {
    const { textAreaProps, textAreaRef, clearButtonProps, count } = useTextArea(options);
    const setRef = useCallback(
      (element: HTMLTextAreaElement | null) => {
        textAreaRef(element);
        if (element) {
          return attachRef(element, ref, () => textAreaRef(null));
        }
      },
      [ref, textAreaRef],
    );

    return (
      <div data-ui="text-area-field">
        <textarea {...textAreaProps} data-ui="text-area" ref={setRef} />
        {clearButtonProps && (
          <button {...clearButtonProps} data-slot="clear">
            {clearContent}
          </button>
        )}
        {options.showCount && (
          <span data-slot="count">
            {count}
            {options.maxLength === undefined ? '' : ` / ${options.maxLength}`}
          </span>
        )}
      </div>
    );
  },
);
