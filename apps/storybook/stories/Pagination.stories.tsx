import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from '@dreadnought/ui/react';

const meta = {
  title: 'Navigation/Pagination', component: Pagination,
  args: { total: 200, pageSize: 10 },
  argTypes: { total: { control: 'number' }, pageSize: { control: 'number' },
    current: { control: 'number' }, defaultCurrent: { control: 'number' },
    simple: { control: 'boolean' }, disabled: { control: 'boolean' } },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Simple: Story = { args: { simple: true } };
export const Uncontrolled: Story = { args: { defaultCurrent: 10 } };
export const Empty: Story = { args: { total: 0 } };
export const Disabled: Story = { args: { disabled: true, defaultCurrent: 10 } };
export const MillionPages: Story = { args: { total: 1000000, pageSize: 1, defaultCurrent: 500000 } };
export const CustomTokens: Story = { args: { style: {
  '--dreadnought-pagination-size': '40px', '--dreadnought-pagination-selected-bg': 'purple',
} as CSSProperties } };

function ControlledDemo() {
  const [current, setCurrent] = useState(3);
  return <Pagination total={200} current={current} onChange={setCurrent} />;
}
export const Controlled: Story = { render: () => <ControlledDemo /> };
