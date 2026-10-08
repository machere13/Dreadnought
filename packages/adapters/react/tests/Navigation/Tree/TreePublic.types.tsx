import { createRef } from 'react';
import { TreeAdapter } from '@dreadnought/react/unstyled';
import { useTree, type UseTreeResult } from '@dreadnought/react/logic';

type Node = { id: number; label: string; children?: readonly Node[] };
const records: readonly Node[] = [{ id: 0, label: 'Root' }];
const options = { records, getKey: (node: Node) => node.id, getChildren: (node: Node) => node.children };
const adapter = <TreeAdapter {...options} getLabel={node => node.label} ref={createRef<HTMLUListElement>()}
  expandedKeys={[0]} onExpandedKeysChange={keys => { const key: number | undefined = keys[0]; void key; }}
  selectable multiple selectedKeys={[0]} onSelectedKeysChange={keys => { const values: number[] = keys; void values; }}
  checkable checkedKeys={[0]} onCheckedKeysChange={(keys, half) => { const values: number[] = [...keys, ...half]; void values; }}
  renderLabel={row => <strong>{row.record.label}</strong>} />;
function Consumer() {
  const result: UseTreeResult<Node, number> = useTree(options);
  result.setExpanded(0, true);
  result.select(0); result.setChecked(0, true);
  return adapter;
}
// @ts-expect-error arbitrary children are unsupported
const invalid = <TreeAdapter {...options} getLabel={node => node.label}>Child</TreeAdapter>;
// @ts-expect-error numeric keys must not be coerced to strings
const wrongKeys = <TreeAdapter {...options} getLabel={node => node.label} expandedKeys={['0']} />;
void Consumer; void invalid; void wrongKeys;
