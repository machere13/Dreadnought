import styles from './Alert.module.css';

export const alertPresentation = {
  root: styles.root,
  icon: styles.icon,
  title: `dreadnought-text-alert-title ${styles.title}`,
  description: `dreadnought-text-alert-description ${styles.description}`,
  actions: styles.actions,
  close: styles.close,
} as const;
