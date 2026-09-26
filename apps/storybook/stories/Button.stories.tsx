import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@dreadnought/ui/react';

const meta = {
  title: 'Controls/Button',
  component: Button,
  args: { children: 'Нажать' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outlined', 'ghosted'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    iconPosition: { control: 'select', options: ['start', 'end'] },
    icon: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Outlined: Story = { args: { variant: 'outlined' } };
export const Ghosted: Story = { args: { variant: 'ghosted' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
export const WithIcon: Story = { args: { icon: <span aria-hidden="true">★</span>, iconPosition: 'start' } };
export const AsLink: Story = { args: { href: '#button-link', children: 'Перейти' } };
