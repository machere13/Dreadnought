import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tree } from '@dreadnought/ui/react';

type Node = { id: string; label: string; disabled?: boolean; children?: readonly Node[] };
const records: readonly Node[] = [{ id: 'root', label: 'Root', children: [
  { id: 'branch', label: 'Branch', children: [{ id: 'leaf', label: 'Leaf' }] },
  { id: 'sibling', label: 'Sibling' },
] }];
const args = { records, getKey: (node: Node) => node.id, getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label, 'aria-label': 'Example tree' };
const meta = { title: 'Navigation/Tree', args, component: Tree<Node, string>,
  render: props => <Tree {...props} /> } satisfies Meta<typeof Tree<Node, string>>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { records: [] } };
export const CustomLabel: Story = { args: { renderLabel: row => <strong>{row.record.label}</strong> } };
function ControlledDemo() {
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['root']);
  return <Tree {...args} expandedKeys={expandedKeys} onExpandedKeysChange={setExpandedKeys} />;
}
export const Controlled: Story = { render: () => <ControlledDemo /> };
export const Expanded: Story = { args: { defaultExpandedKeys: ['root', 'branch'] } };
export const Selectable: Story = { args: { selectable: true, defaultExpandedKeys: ['root', 'branch'], defaultSelectedKeys: ['leaf'] } };
export const Multiple: Story = { args: { selectable: true, multiple: true, defaultExpandedKeys: ['root', 'branch'] } };
export const Checkable: Story = { args: { checkable: true, selectable: true, defaultExpandedKeys: ['root', 'branch'], defaultCheckedKeys: ['leaf'] } };
export const IndependentChecks: Story = { args: { checkable: true, checkStrictly: true, defaultExpandedKeys: ['root', 'branch'], defaultCheckedKeys: ['root'] } };
export const DisabledBoundary: Story = { args: { checkable: true, defaultExpandedKeys: ['root', 'locked'], defaultCheckedKeys: ['root'],
  records: [{ id: 'root', label: 'Раздел', children: [{ id: 'enabled', label: 'Доступный пункт' },
    { id: 'locked', label: 'Заблокированная ветка', disabled: true, children: [{ id: 'behind', label: 'Не наследует отметку корня' }] }] }],
  getDisabled: node => Boolean(node.disabled) } };
export const LongLabels: Story = { args: { records: [{ id: 'root', label: 'Разделы документации', children: [
  { id: 'long', label: 'Очень длинное название вложенного раздела, которое переносится и остаётся полностью читаемым на узком экране' },
] }], defaultExpandedKeys: ['root'] }, decorators: [Story => <div style={{ maxWidth: 280 }}><Story /></div>] };
