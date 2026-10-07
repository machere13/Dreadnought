import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@dreadnought/ui/react';

const meta = {
  title: 'Fields/Input',
  component: Input,
  args: { placeholder: 'Введите текст' },
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    required: { control: 'boolean' },
    invalid: { control: 'boolean' },
    passwordVisibilityLabels: { control: 'object' },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { invalid: true, placeholder: 'Неверное значение' } };
export const Number: Story = { args: { type: 'number', defaultValue: '1', min: 0, max: 10,
  stepButtonLabels: { decrease: 'Уменьшить значение', increase: 'Увеличить значение' } } };
export const Decimal: Story = { args: { ...Number.args, defaultValue: '0.2', min: 0, max: 1, step: 0.1 } };
export const ArbitraryNumber: Story = { args: { type: 'number', step: 'any', defaultValue: '0.123' } };
export const Password: Story = {
  args: {
    type: 'password',
    passwordVisibilityLabels: {
      show: 'Показать пароль',
      hide: 'Скрыть пароль',
    },
  },
};
