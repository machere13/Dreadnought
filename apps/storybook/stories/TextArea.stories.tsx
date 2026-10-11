import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from '@dreadnought/ui/react';

const meta = {
  title: 'Fields/TextArea',
  component: TextArea,
  args: { rows: 4, placeholder: 'Введите текст' },
  argTypes: {
    rows: { control: { type: 'number', min: 1, step: 1 } },
    minRows: { control: { type: 'number', min: 1, step: 1 } },
    maxRows: { control: { type: 'number', min: 1, step: 1 } },
    autoSize: { control: 'boolean' },
    allowClear: { control: 'boolean' },
    showCount: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AutoSize: Story = { args: { autoSize: true, rows: 2, maxRows: 6 } };
export const Disabled: Story = { args: { disabled: true } };
export const ClearAndCount: Story = {
  args: {
    defaultValue: 'Заметка',
    allowClear: true,
    showCount: true,
    maxLength: 200,
    autoSize: true,
    maxRows: 6,
    clearLabel: 'Очистить заметки',
  },
};
