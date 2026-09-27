import styles from './Accordion.module.css';

export const accordionPresentation = {
  root: styles.root,
  item: styles.item,
  trigger: `dreadnought-text-accordion-trigger ${styles.trigger}`,
  panel: `dreadnought-text-accordion-panel ${styles.panel}`,
  indicator: styles.indicator,
} as const;
