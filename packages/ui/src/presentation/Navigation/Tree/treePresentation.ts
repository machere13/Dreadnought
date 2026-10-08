import styles from './Tree.module.css';

export const treePresentation = {
  root: `dreadnought-text-tree ${styles.root}`,
  item: styles.item,
  content: styles.content,
  group: styles.group,
  indicator: styles.indicator,
} as const;
