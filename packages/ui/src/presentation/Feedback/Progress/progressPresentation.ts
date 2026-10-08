import styles from './Progress.module.css';

export const progressPresentation = {
  root: styles.root,
  track: styles.track,
  fill: styles.fill,
  label: `dreadnought-text-progress ${styles.label}`,
} as const;
