import styles from './Menu.module.css';

export const menuPresentation = {
  root: styles.root,
  item: `dreadnought-text-menu-item ${styles.item}`,
  group: styles.group,
  groupLabel: styles.groupLabel,
  submenu: styles.submenu,
  divider: styles.divider,
  indicator: styles.indicator,
} as const;
