import styles from './Select.module.css';
export const selectPresentation = {
  root: `dreadnought-text-select ${styles.root}`,
  sizes: { default: undefined, compact: styles.compact },
  variants: { outlined: undefined, filled: styles.filled, borderless: styles.borderless },
  popup: `dreadnought-text-select ${styles.popup}`,
  option: styles.option,
  groupLabel: styles.groupLabel,
  clear: styles.clear,
};
