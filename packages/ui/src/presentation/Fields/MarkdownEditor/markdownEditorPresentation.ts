import styles from './MarkdownEditor.module.css';

export const markdownEditorPresentation = {
  root: styles.root,
  toolbar: styles.toolbar,
  field: `dreadnought-text-markdown-editor ${styles.field}`,
} as const;
