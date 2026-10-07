import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Dropdown, Icon } from '@dreadnought/ui/react';

const meta = {
  title: 'Navigation/Dropdown', component: Dropdown,
  args: { items: [{ value: 'edit', label: 'Редактировать' }, { value: 'download', label: 'Скачать' }, { value: 'delete', label: 'Удалить', disabled: true }],
    placement: 'bottomLeft', arrow: false, children: trigger => <Button {...trigger}>Действия</Button> },
  argTypes: { placement: { control: 'select', options: ['top', 'topLeft', 'topRight', 'bottom', 'bottomLeft', 'bottomRight', 'left', 'leftTop', 'leftBottom', 'right', 'rightTop', 'rightBottom'] } },
} satisfies Meta<typeof Dropdown>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithArrow: Story = { args: { arrow: { pointAtCenter: true }, placement: 'bottomRight' } };
export const Disabled: Story = { args: { disabled: true } };
export const IconTrigger: Story = { args: { children: trigger => <Button {...trigger} aria-label="Действия" icon={<Icon name="ellipsis" />} /> } };
export const Selected: Story = { render: function Selected(args) {
  const [selectedValue, setSelectedValue] = useState('edit');
  return <Dropdown {...args} selectedValue={selectedValue} onAction={setSelectedValue} />;
} };
export const Controlled: Story = { render: function Controlled(args) {
  const [open, setOpen] = useState(false);
  return <Dropdown {...args} open={open} onOpenChange={setOpen} />;
} };
export const LongMenu: Story = { args: { items: Array.from({ length: 50 }, (_, index) => ({ value: String(index), label: `Действие ${index + 1}` })) } };
