import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '@dreadnought/ui/react';
const meta = { title: 'Fields/Checkbox', component: Checkbox, args: { children: 'Согласен с условиями' },
  argTypes: { checked: { control: 'boolean' }, defaultChecked: { control: 'boolean' }, disabled: { control: 'boolean' }, invalid: { control: 'boolean' }, indeterminate: { control: 'boolean' } } } satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
export const Invalid: Story = { args: { invalid: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Group: Story = { render: () => <Checkbox.Group label="Уведомления" name="checkbox" defaultValue={['email']} options={[
  { value: 'email', label: 'Электронная почта' },
  { value: 'push', label: 'Push-уведомления' },
  { value: 'sms', label: 'SMS', disabled: true },
]} /> };
