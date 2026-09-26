import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@dreadnought/ui/react';

const meta = {
  title: 'Fields/Input',
  component: Input,
  args: { placeholder: 'Введите текст' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Password: Story = {
  args: {
    type: 'password',
    passwordVisibilityLabels: {
      show: 'Показать пароль',
      hide: 'Скрыть пароль',
    },
  },
};
