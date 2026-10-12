import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Modal, TreeSelect } from '@dreadnought/ui/react';
type Node = { id: string; label: string; children?: readonly Node[] };
const records: readonly Node[] = [
  {
    id: 'dev',
    label: 'Разработка',
    children: [
      { id: 'front', label: 'Frontend' },
      { id: 'back', label: 'Backend' },
    ],
  },
];
const args = {
  records,
  getKey: (node: Node) => node.id,
  getChildren: (node: Node) => node.children,
  getLabel: (node: Node) => node.label,
  'aria-label': 'Команда',
  showSearch: true,
  defaultExpandedKeys: ['dev'],
};
const meta = {
  title: 'Fields/TreeSelect',
  component: TreeSelect<Node, string>,
  args,
  parameters: { layout: 'padded' },
  render: (props) => <TreeSelect<Node, string> {...props} />,
} satisfies Meta<typeof TreeSelect<Node, string>>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Multiple: Story = {
  render: () => <TreeSelect {...args} multiple defaultValue={['front']} />,
};
export const Overflow: Story = {
  render: () => (
    <TreeSelect
      {...args}
      multiple
      checkStrictly
      defaultValue={['long', 'item-1']}
      records={[
        {
          id: 'dev',
          label: 'Команда',
          children: [
            { id: 'long', label: 'Очень длинное название отдела разработки интерфейсов' },
            ...Array.from({ length: 30 }, (_, index) => ({
              id: `item-${index}`,
              label: `Отдел ${index + 1}`,
            })),
          ],
        },
      ]}
    />
  ),
};
export const WithinModal: Story = {
  render: () => (
    <Modal title="Выбор команды" content={<TreeSelect {...args} />}>
      {(trigger) => <Button {...trigger}>Открыть модалку</Button>}
    </Modal>
  ),
};
