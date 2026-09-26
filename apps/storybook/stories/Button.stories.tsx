import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@dreadnought/ui/react';

const meta = {
  title: 'Controls/Button',
  component: Button,
  args: { children: 'Нажать' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
