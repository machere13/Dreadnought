import type { MarkdownCommand, MarkdownSelection } from '@dreadnought/core';
import type { ReactNode, RefCallback, TextareaHTMLAttributes } from 'react';
import type { UseTextAreaOptions } from '../TextArea/index.ts';

export type MarkdownEditorPreview = 'edit' | 'preview' | 'live';

export interface UseMarkdownEditorOptions extends Omit<UseTextAreaOptions, 'value' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  historyLimit?: number;
  preview?: MarkdownEditorPreview;
  defaultPreview?: MarkdownEditorPreview;
  onPreviewChange?: (preview: MarkdownEditorPreview) => void;
}

export interface MarkdownEditorControls {
  execute: (command: MarkdownCommand) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  preview: MarkdownEditorPreview;
  setPreview: (preview: MarkdownEditorPreview) => void;
  disabled: boolean;
  readOnly: boolean;
}

export interface UseMarkdownEditorResult extends MarkdownEditorControls {
  value: string;
  selection: MarkdownSelection;
  textAreaProps: TextareaHTMLAttributes<HTMLTextAreaElement>;
  textAreaRef: RefCallback<HTMLTextAreaElement>;
}

export interface MarkdownEditorAdapterProps extends UseMarkdownEditorOptions {
  renderToolbar?: (controls: MarkdownEditorControls) => ReactNode;
  renderPreview?: (value: string) => ReactNode;
}
