import styles from './Tabs.module.css';
import { menuPresentation } from '../Menu/menuPresentation.ts';

export const tabsPresentation = {
  root: styles.root,
  list: styles.list,
  listContainer: styles.listContainer,
  more: `dreadnought-text-tabs-tab ${styles.more}`,
  menu: `${menuPresentation.root} ${styles.menu}`,
  menuItem: menuPresentation.item,
  tab: `dreadnought-text-tabs-tab ${styles.tab}`,
  panel: `dreadnought-text-tabs-panel ${styles.panel}`,
} as const;
