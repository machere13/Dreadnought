import styles from './Dropdown.module.css';
import { menuPresentation } from '../Menu/index.ts';
import { popoverPresentation } from '../../Overlays/Popover/index.ts';

export const dropdownPresentation = {
  root: `${popoverPresentation.root} ${styles.root}`,
  menu: `${menuPresentation.root} ${styles.menu}`,
  item: menuPresentation.item,
} as const;
