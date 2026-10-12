import { TreeSelect } from '@dreadnought/ui/react';
import type { TreeSelectProps } from '@dreadnought/ui/react';
import { treeSelectPresentation } from '@dreadnought/ui';
type Node = { key: number; label: string; children?: readonly Node[] };
const options = {
  records: [] as readonly Node[],
  getKey: (node: Node) => node.key,
  getLabel: (node: Node) => node.label,
  getChildren: (node: Node) => node.children,
};
const props: TreeSelectProps<Node, number> = { ...options, multiple: true, value: [0] };
<TreeSelect
  {...options}
  multiple
  onValueChange={(value) => {
    const keys: number[] = value;
    void keys;
  }}
/>;
<TreeSelect
  {...props}
  multiple
  onValueChange={(value) => {
    const keys: number[] = value;
    void keys;
  }}
/>;
<TreeSelect
  {...options}
  onValueChange={(value) => {
    const key: number | null = value;
    void key;
  }}
/>;
// @ts-expect-error Ready UI hides adapter renderers.
<TreeSelect {...options} renderField={() => null} />;
// @ts-expect-error Single mode rejects arrays.
<TreeSelect {...options} value={[0]} />;
void treeSelectPresentation.root;
