import styles from './Toast.module.css';

export const toastPresentation = {
  root: styles.root, viewport: styles.viewport, icon: styles.icon, content: styles.content,
  title: `dreadnought-text-toast-title ${styles.title}`,
  description: `dreadnought-text-toast-description ${styles.description}`,
  action: styles.action, close: styles.close,
} as const;
