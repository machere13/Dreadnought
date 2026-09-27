import styles from './CodeBlock.module.css';
import { buttonPresentation } from '../../Controls/Button/buttonPresentation.ts';

export const codeBlockPresentation = {
  root: `dreadnought-text-code-block ${styles.root}`,
  header: styles.header,
  pre: styles.pre,
  code: styles.code,
  copyButton: `${buttonPresentation.root} ${buttonPresentation.variants.ghosted} ${buttonPresentation.sizes.compact} ${styles.copyButton}`,
} as const;
