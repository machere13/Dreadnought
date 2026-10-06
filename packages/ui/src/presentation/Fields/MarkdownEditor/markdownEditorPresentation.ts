import styles from './MarkdownEditor.module.css';

export const markdownEditorPresentation = {
  root: styles.root,
  toolbar: styles.toolbar,
  toolbarGroup: styles.toolbarGroup,
  field: `dreadnought-text-markdown-editor ${styles.field}`,
} as const;
