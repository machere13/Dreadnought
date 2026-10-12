import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Modal, TimePicker } from '@dreadnought/ui/react';

const meta = {
  title: 'Fields/TimePicker', component: TimePicker,
  args: { 'aria-label': 'Time', defaultValue: '09:30:00' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Seconds: Story = { args: { showSeconds: true, defaultValue: '09:30:15' } };
export const WithinModal: Story = {
  render: args => <Modal title="Время встречи" content={<TimePicker {...args} />}>
    {trigger => <Button {...trigger}>Открыть модалку</Button>}
  </Modal>,
};
