import styles from './Card.module.css';

export const cardPresentation = {
  root: styles.root,
  header: styles.header,
  title: styles.title,
  extra: styles.extra,
  body: styles.body,
} as const;
