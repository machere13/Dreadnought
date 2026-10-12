import styles from './TreeSelect.module.css';
import { treePresentation } from '../../Navigation/Tree/treePresentation.ts';

export const treeSelectPresentation = {
  root: `dreadnought-tree-select dreadnought-text-treeselect ${styles.root}`,
  slots: {
    field: styles.field,
    selection: styles.selection,
    tag: styles.tag,
    tagLabel: styles.tagLabel,
    popup: styles.popup,
    viewport: styles.viewport,
    tree: treePresentation.root,
    item: treePresentation.item,
    content: treePresentation.content,
    group: treePresentation.group,
    indicator: `${treePresentation.indicator} ${styles.indicator}`,
    empty: styles.empty,
    actions: styles.actions,
  },
} as const;
