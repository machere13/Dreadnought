import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Button, Icon, Mark } from '@dreadnought/ui/react';

const meta = {
  title: 'DataDisplay/Badge',
  component: Badge,
  args: { children: 'Beta' },
  argTypes: {
    appearance: { control: 'select', options: ['solid', 'outline', 'ghosted'] },
    iconPosition: { control: 'select', options: ['start', 'end'] },
    icon: { control: false },
    target: { control: false },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithMark: Story = { args: { icon: <Mark color="var(--dreadnought-color-status-success)" /> } };
export const WithIcon: Story = { args: { icon: <Icon name="check" /> } };
export const Outline: Story = { args: { appearance: 'outline' } };
export const Ghosted: Story = { args: { appearance: 'ghosted', icon: <Mark shape="square" /> } };
export const Overlay: Story = {
  args: {
    target: <Button aria-label="Уведомления, 3 новых">Уведомления</Button>,
    children: '3',
  },
};
