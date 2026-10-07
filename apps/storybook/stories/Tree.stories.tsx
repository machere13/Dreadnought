import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TreeAdapter } from '@dreadnought/react/unstyled';

type Node = { id: string; label: string; children?: readonly Node[] };
const records: readonly Node[] = [{ id: 'root', label: 'Root', children: [
  { id: 'branch', label: 'Branch', children: [{ id: 'leaf', label: 'Leaf' }] },
  { id: 'sibling', label: 'Sibling' },
] }];
const args = { records, getKey: (node: Node) => node.id, getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label, 'aria-label': 'Example tree' };
const meta = { title: 'Navigation/Tree (unstyled)', args,
  render: props => <TreeAdapter {...props} /> } satisfies Meta<typeof TreeAdapter<Node, string>>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { records: [] } };
export const CustomLabel: Story = { args: { renderLabel: row => <strong>{row.record.label}</strong> } };
function ControlledDemo() {
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['root']);
  return <TreeAdapter {...args} expandedKeys={expandedKeys} onExpandedKeysChange={setExpandedKeys} />;
}
export const Controlled: Story = { render: () => <ControlledDemo /> };
