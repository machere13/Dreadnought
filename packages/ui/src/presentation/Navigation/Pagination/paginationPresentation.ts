import styles from './Pagination.module.css';

export const paginationPresentation = {
  root: styles.root,
  button: styles.button,
  ellipsis: styles.ellipsis,
  summary: `dreadnought-text-pagination ${styles.summary}`,
} as const;
