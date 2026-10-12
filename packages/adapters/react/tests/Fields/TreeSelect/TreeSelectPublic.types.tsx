import { useTreeSelect } from '@dreadnought/react/logic';
import { TreeSelectAdapter } from '@dreadnought/react/unstyled';
import { createRef } from 'react';
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
<TreeSelectAdapter
  {...options}
  ref={createRef<HTMLInputElement>()}
  name="team"
  onValueChange={(value) => {
    const key: number | null = value;
    void key;
  }}
/>;
<TreeSelectAdapter
  {...options}
  multiple
  value={[0]}
  onValueChange={(value) => {
    const keys: number[] = value;
    void keys;
  }}
  renderLabel={(row) => row.record.label}
  renderCheckbox={(props, row) => (
    <input {...props} type="checkbox" aria-label={row.record.label} />
  )}
/>;
// @ts-expect-error Array values require multiple mode.
<TreeSelectAdapter {...options} value={[0]} />;
// @ts-expect-error Only four corner placements are supported.
<TreeSelectAdapter {...options} placement="left" />;
