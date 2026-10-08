import { TreeAdapter } from '@dreadnought/react/unstyled';
import type { TreeAdapterProps } from '@dreadnought/react/unstyled';
import { treePresentation } from '#presentation/Navigation/Tree/treePresentation.ts';

export type TreeProps<RecordType, Key extends string | number = string | number> = TreeAdapterProps<RecordType, Key>;

export function Tree<RecordType, Key extends string | number = string | number>({
  className, slotClassNames = {}, ...props
}: TreeProps<RecordType, Key>) {
  const classes = (library: string, consumer?: string) => [library, consumer].filter(Boolean).join(' ');
  return <TreeAdapter {...props} className={classes(treePresentation.root, className)}
    slotClassNames={{ item: classes(treePresentation.item, slotClassNames.item),
      content: classes(treePresentation.content, slotClassNames.content),
      group: classes(treePresentation.group, slotClassNames.group),
      indicator: classes(treePresentation.indicator, slotClassNames.indicator) }} />;
}
