import styles from './CodeBlock.module.css';

export const codeBlockPresentation = {
  root: `dreadnought-text-code-block ${styles.root}`,
  header: styles.header,
  pre: styles.pre,
  code: styles.code,
  copyButton: styles.copyButton,
} as const;
