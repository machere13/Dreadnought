import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from '@dreadnought/ui/react';

const meta = { title: 'Fields/Slider', component: Slider, args: { 'aria-label': 'Громкость', defaultValue: 25 },
  decorators: [Story => <div style={{ width: 'min(24rem, 100%)' }}><Story /></div>],
  argTypes: { min: { control: 'number' }, max: { control: 'number' }, step: { control: 'number' },
    value: { control: 'number' }, disabled: { control: 'boolean' } } } satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Controlled: Story = { render: function Demo(args) {
  const [value, setValue] = useState(25);
  return <><p>Значение: {value}</p><Slider {...args} value={value} onValueChange={next => { setValue(next); args.onValueChange?.(next); }} /></>;
} };
export const Decimal: Story = { args: { min: 0, max: 1, step: 0.1, defaultValue: 0.4 } };
export const Disabled: Story = { args: { disabled: true } };
export const FixedValue: Story = { args: { min: 4, max: 4, defaultValue: 4 } };
export const TooltipDisabled: Story = { args: { tooltip: false } };
