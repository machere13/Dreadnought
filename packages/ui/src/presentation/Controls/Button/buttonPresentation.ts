import styles from './Button.module.css';

export const buttonPresentation = {
  root: `dreadnought-text-button ${styles.button}`,
  variants: {
    primary: styles.primary,
    secondary: styles.secondary,
    outlined: styles.outlined,
    ghosted: styles.ghosted,
  },
  sizes: {
    default: '',
    compact: styles.compact,
  },
} as const;
