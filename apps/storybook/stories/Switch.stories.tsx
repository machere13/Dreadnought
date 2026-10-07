import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Switch } from '@dreadnought/ui/react';

const meta = { title: 'Fields/Switch', component: Switch, args: { children: 'Получать уведомления' },
  argTypes: { checked: { control: 'boolean' }, defaultChecked: { control: 'boolean' }, disabled: { control: 'boolean' }, invalid: { control: 'boolean' } } } satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
export const Invalid: Story = { args: { invalid: true } };
export const WithoutLabel: Story = { args: { children: undefined, 'aria-label': 'Получать уведомления' } };
export const Controlled: Story = { render: function Demo(args) {
  const [checked, setChecked] = useState(false);
  return <Switch {...args} checked={checked} onChange={event => { setChecked(event.currentTarget.checked); args.onChange?.(event); }} />;
} };
export const FormReset: Story = { render: args => <form style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
  <Switch {...args} name="alerts" defaultChecked /><Button type="reset" size="compact">Сбросить</Button>
</form> };
