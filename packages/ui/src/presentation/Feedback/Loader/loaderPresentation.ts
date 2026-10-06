import styles from './Loader.module.css';

export const loaderPresentation = {
  root: styles.root, indicator: styles.indicator, graphic: styles.graphic,
  label: `dreadnought-text-loader ${styles.label}`, content: styles.content,
} as const;
