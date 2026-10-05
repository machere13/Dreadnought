import styles from './Toolbar.module.css';

export const toolbarPresentation = {
  root: styles.root,
  orientations: { horizontal: styles.horizontal, vertical: styles.vertical },
} as const;
