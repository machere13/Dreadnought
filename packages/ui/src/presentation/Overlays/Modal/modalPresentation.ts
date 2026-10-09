import styles from './Modal.module.css';
export const modalPresentation = {
  root: styles.root,
  header: styles.header,
  title: styles.title,
  close: styles.close,
  body: styles.body,
  footer: styles.footer,
} as const;
