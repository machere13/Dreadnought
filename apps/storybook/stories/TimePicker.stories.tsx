import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Modal, TimePicker } from '@dreadnought/ui/react';
import { TimePickerFormDemo } from '../../docs/src/content/components/Fields/TimePicker/TimePickerFormDemo.tsx';

const meta = {
  title: 'Fields/TimePicker',
  component: TimePicker,
  args: { 'aria-label': 'Time', defaultValue: '09:30:00' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof TimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Seconds: Story = { args: { showSeconds: true, defaultValue: '09:30:15' } };
export const Steps: Story = { args: { hourStep: 2, minuteStep: 15, defaultValue: '10:30:00' } };
export const Restricted: Story = {
  args: { minTime: '09:00:00', maxTime: '18:00:00', disabledTime: { hours: [13] } },
};
export const FullyDisabled: Story = {
  args: {
    defaultValue: undefined,
    disabledTime: { hours: Array.from({ length: 24 }, (_, hour) => hour) },
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Form: Story = { render: () => <TimePickerFormDemo /> };
export const WithinModal: Story = {
  render: (args) => (
    <Modal title="Время встречи" content={<TimePicker {...args} />}>
      {(trigger) => <Button {...trigger}>Открыть модалку</Button>}
    </Modal>
  ),
};
