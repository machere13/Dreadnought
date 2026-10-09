import styles from './FloatingPanel.module.css';
export const floatingPanelPresentation = {
  root: styles.root,
  panel: styles.panel,
  header: styles.header,
  title: styles.title,
  close: styles.close,
  body: styles.body,
  footer: styles.footer,
  'bottom-right': styles.bottomRight,
  'bottom-left': styles.bottomLeft,
  'top-right': styles.topRight,
  'top-left': styles.topLeft,
} as const;
