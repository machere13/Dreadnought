import styles from './Card.module.css';

export const cardPresentation = {
  root: styles.root,
  header: styles.header,
  title: styles.title,
  extra: styles.extra,
  body: styles.body,
  cover: styles.cover,
  footer: styles.footer,
  actions: styles.actions,
  action: styles.action,
} as const;
