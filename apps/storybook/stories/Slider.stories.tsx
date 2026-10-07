import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Slider } from '@dreadnought/ui/react';
import type { SliderProps } from '@dreadnought/ui/react';

const meta = { title: 'Fields/Slider', component: Slider, args: { 'aria-label': 'Громкость', defaultValue: 25 },
  decorators: [Story => <div style={{ width: 'min(24rem, 100%)' }}><Story /></div>],
  argTypes: { min: { control: 'number' }, max: { control: 'number' }, step: { control: 'number' },
    value: { control: 'number' }, disabled: { control: 'boolean' } } } satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<Extract<SliderProps, { range?: false }>>;
export const Default: Story = {};
export const Controlled: Story = { render: function Demo(args) {
  const [value, setValue] = useState(25);
  return <><p>Значение: {value}</p><Slider {...args} range={false} defaultValue={25} value={value} onValueChange={setValue} /></>;
} };
export const Decimal: Story = { args: { min: 0, max: 1, step: 0.1, defaultValue: 0.4 } };
export const Disabled: Story = { args: { disabled: true } };
export const FixedValue: Story = { args: { min: 4, max: 4, defaultValue: 4 } };
export const TooltipDisabled: Story = { args: { tooltip: false } };
export const Range: Story = { render: function Demo(args) {
  const [value, setValue] = useState<[number, number]>([20, 80]);
  return <><p>Диапазон: {value[0]}–{value[1]}</p><Slider range value={value} onValueChange={setValue}
    disabled={args.disabled} min={args.min} max={args.max} step={args.step} tooltip={args.tooltip}
    slotProps={{ thumb: [{ 'aria-label': 'От' }, { 'aria-label': 'До' }] }} /></>;
} };
export const CoincidentEndpoints: Story = { render: () => <Slider range defaultValue={[50, 50]}
  slotProps={{ thumb: [{ 'aria-label': 'От' }, { 'aria-label': 'До' }] }} /> };
