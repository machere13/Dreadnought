import { useTreeSelect } from '@dreadnought/react/logic';
type Node = { id: number; label: string; children?: readonly Node[] };
const options = {
  records: [] as readonly Node[],
  getKey: (node: Node) => node.id,
  getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label,
};
useTreeSelect({
  ...options,
  onValueChange: (value) => {
    const key: number | null = value;
    void key;
  },
});
useTreeSelect({
  ...options,
  multiple: true,
  value: [0],
  onValueChange: (value) => {
    const keys: number[] = value;
    void keys;
  },
});
// @ts-expect-error Single mode does not accept multiple values.
useTreeSelect({ ...options, value: [0] });
// @ts-expect-error Linked checking requires multiple mode.
useTreeSelect({ ...options, checkStrictly: true });
// @ts-expect-error Multiple mode requires an array.
useTreeSelect({ ...options, multiple: true, value: 0 });
