import { createRef } from 'react';
import { Tree, type TreeProps } from '@dreadnought/ui/react';
type Node = { id: number; title: string; children?: readonly Node[] };
const props: TreeProps<Node, number> = {
  records: [{ id: 0, title: 'Root' }],
  getKey: (node) => node.id,
  getChildren: (node) => node.children,
  getLabel: (node) => node.title,
  expandedKeys: [0],
  ref: createRef<HTMLUListElement>(),
  selectable: true,
  selectedKeys: [0],
  checkable: true,
  checkedKeys: [0],
  getCheckDisabled: (node) => node.id === 1,
  renderLabel: (row) => <strong>{row.record.title}</strong>,
  onExpandedKeysChange: (keys) => {
    const values: number[] = keys;
    void values;
  },
};
const ready = <Tree {...props} />;
// @ts-expect-error numeric records cannot accept string expanded keys
const wrongKeys = <Tree {...props} expandedKeys={['0']} />;
// @ts-expect-error content comes from records, not arbitrary children
const wrongChildren: TreeProps<Node, number> = { ...props, children: 'Text' };
void [ready, wrongKeys, wrongChildren];
