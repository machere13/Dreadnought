import styles from './Input.module.css';

export const inputPresentation = {
  root: `dreadnought-text-input ${styles.input}`,
  sizes: { default: undefined, compact: styles.compact },
  variants: { outlined: undefined, filled: styles.filled, borderless: styles.borderless },
} as const;
