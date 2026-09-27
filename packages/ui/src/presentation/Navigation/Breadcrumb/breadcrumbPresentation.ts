import styles from './Breadcrumb.module.css';

export const breadcrumbPresentation = {
  root: `dreadnought-text-breadcrumb ${styles.root}`,
  list: styles.list,
  item: styles.item,
  link: styles.link,
  current: `dreadnought-text-breadcrumb-current ${styles.current}`,
} as const;
