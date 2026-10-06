import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { useMarkdownEditor } from './useMarkdownEditor.ts';
import type { MarkdownEditorAdapterProps } from './markdownEditor.types.ts';

export const MarkdownEditorAdapter = forwardRef<HTMLTextAreaElement, MarkdownEditorAdapterProps>(
  function MarkdownEditorAdapter({ renderToolbar, renderPreview, ...options }, ref) {
    const { textAreaProps, textAreaRef, ...controls } = useMarkdownEditor(options);
    const nativeRef = useRef<HTMLTextAreaElement | null>(null);
    const setRef = useCallback((element: HTMLTextAreaElement | null) => {
      nativeRef.current = element;
      textAreaRef(element);
    }, [textAreaRef]);
    useImperativeHandle(ref, () => nativeRef.current!, []);
    return <div data-ui="markdown-editor" data-preview={controls.preview}>
      {renderToolbar?.(controls)}
      <div data-ui="markdown-editor-panels">
        <div data-ui="markdown-editor-edit" hidden={controls.preview === 'preview'} style={controls.preview === 'preview' ? { display: 'none' } : undefined}>
          <textarea {...textAreaProps} data-ui="markdown-editor-input" ref={setRef} />
        </div>
        <div data-ui="markdown-editor-preview" hidden={controls.preview === 'edit'} style={controls.preview === 'edit' ? { display: 'none' } : undefined}>
          {controls.preview !== 'edit' ? renderPreview?.(controls.value) : null}
        </div>
      </div>
    </div>;
  },
);
