import styles from './Layout.module.css';

export const layoutPresentation = {
  root: styles.root,
  header: `dreadnought-text-layout ${styles.header}`,
  content: `dreadnought-text-layout ${styles.content}`,
  footer: `dreadnought-text-layout ${styles.footer}`,
  sidebar: `dreadnought-text-layout ${styles.sidebar}`,
  body: styles.body,
  trigger: `dreadnought-text-layout-trigger ${styles.trigger}`,
} as const;
