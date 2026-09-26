import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from '@dreadnought/ui/react';

const meta = {
  title: 'Fields/TextArea',
  component: TextArea,
  args: { rows: 4, placeholder: 'Введите текст' },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AutoSize: Story = { args: { autoSize: true, rows: 2, maxRows: 6 } };
export const Disabled: Story = { args: { disabled: true } };
