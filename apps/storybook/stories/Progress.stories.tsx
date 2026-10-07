import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress } from '@dreadnought/ui/react';

const meta = {
  title: 'Feedback/Progress', component: Progress,
  args: { value: 35, max: 100, showPercent: true, status: 'normal', 'aria-label': 'Загрузка файла' },
  argTypes: {
    value: { control: 'number' }, max: { control: 'number' }, showPercent: { control: 'boolean' },
    status: { control: 'select', options: ['normal', 'success', 'error'] },
  },
} satisfies Meta<typeof Progress>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithoutPercent: Story = { args: { showPercent: false } };
export const Fractional: Story = { args: { value: 3, max: 8 } };
export const Zero: Story = { args: { value: 0 } };
export const Complete: Story = { args: { value: 100, status: 'normal' } };
export const Success: Story = { args: { value: 100, status: 'success' } };
export const Error: Story = { args: { value: 65, status: 'error' } };
export const CustomTokens: Story = {
  args: { showPercent: false, style: { width: 180, '--dreadnought-progress-height': '12px', '--dreadnought-progress-fill': 'purple' } as CSSProperties },
};
