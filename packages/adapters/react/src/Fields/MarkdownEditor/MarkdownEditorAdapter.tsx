import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { useMarkdownEditor } from './useMarkdownEditor.ts';
import type { MarkdownEditorAdapterProps } from './markdownEditor.types.ts';

export const MarkdownEditorAdapter = forwardRef<HTMLTextAreaElement, MarkdownEditorAdapterProps>(
  function MarkdownEditorAdapter({ renderToolbar, ...options }, ref) {
    const { execute, disabled, readOnly, textAreaProps, textAreaRef } = useMarkdownEditor(options);
    const nativeRef = useRef<HTMLTextAreaElement | null>(null);
    const setRef = useCallback((element: HTMLTextAreaElement | null) => {
      nativeRef.current = element;
      textAreaRef(element);
    }, [textAreaRef]);
    useImperativeHandle(ref, () => nativeRef.current!, []);
    return <div data-ui="markdown-editor">
      {renderToolbar?.({ execute, disabled, readOnly })}
      <textarea {...textAreaProps} data-ui="markdown-editor-input" ref={setRef} />
    </div>;
  },
);
