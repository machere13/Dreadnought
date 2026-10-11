import styles from './TextArea.module.css';

export const textAreaPresentation = {
  root: `dreadnought-text-text-area ${styles.textArea}`,
  sizes: { default: undefined, compact: styles.compact },
  variants: { outlined: undefined, filled: styles.filled, borderless: styles.borderless },
} as const;
