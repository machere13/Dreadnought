import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mark } from '@dreadnought/ui/react';

const meta = {
  title: 'DataDisplay/Mark',
  component: Mark,
  args: { shape: 'circle' },
  argTypes: { shape: { control: 'select', options: ['circle', 'square'] }, color: { control: 'color' } },
} satisfies Meta<typeof Mark>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Circle: Story = {};
export const Square: Story = { args: { shape: 'square', color: 'var(--dreadnought-color-status-success)' } };
