import type { Meta, StoryObj } from '@storybook/react-vite';
import { Radio } from '@dreadnought/ui/react';
const meta = { title: 'Fields/Radio', component: Radio, args: { children: 'Один вариант' },
  argTypes: { checked: { control: 'boolean' }, defaultChecked: { control: 'boolean' }, disabled: { control: 'boolean' }, invalid: { control: 'boolean' } } } satisfies Meta<typeof Radio>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
export const Invalid: Story = { args: { invalid: true } };

export const Group: Story = { render: () => <Radio.Group label="Тариф" name="radio" defaultValue={'email'} options={[
  { value: 'email', label: 'Базовый' },
  { value: 'push', label: 'Командный' },
  { value: 'sms', label: 'Корпоративный', disabled: true },
]} /> };
