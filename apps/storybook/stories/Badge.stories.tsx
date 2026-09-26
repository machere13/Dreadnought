import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Button } from '@dreadnought/ui/react';

const meta = {
  title: 'DataDisplay/Badge',
  component: Badge,
  args: { children: 'Beta' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithIcon: Story = { args: { icon: <span aria-hidden="true">★</span> } };
export const Outline: Story = { args: { appearance: 'outline' } };
export const Overlay: Story = {
  args: {
    target: <Button aria-label="Уведомления, 3 новых">Уведомления</Button>,
    children: '3',
  },
};
