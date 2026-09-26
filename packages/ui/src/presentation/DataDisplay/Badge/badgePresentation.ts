import styles from './Badge.module.css';

export const badgePresentation = {
  root: `dreadnought-text-badge ${styles.root}`,
  appearances: {
    solid: styles.solid,
    outline: styles.outline,
  },
} as const;
