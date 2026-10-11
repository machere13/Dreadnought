import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DatePicker, Modal, Button } from '@dreadnought/ui/react';
import type { CalendarDate } from '@dreadnought/ui/react';
import { DatePickerFormDemo } from '../../docs/src/content/components/Fields/DatePickerDemo.tsx';

const meta = {
  title: 'Fields/DatePicker',
  component: DatePicker,
  args: { 'aria-label': 'Date', defaultValue: '2026-10-12' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};
export const Range: Story = {
  args: { mode: 'range', defaultValue: ['2026-10-10', '2026-10-20'], 'aria-label': 'Period' },
};
export const Restrictions: Story = {
  args: {
    minDate: '2026-10-01',
    maxDate: '2026-10-31',
    disabledDate: (date) => date.endsWith('-15'),
  },
};
export const ManualInput: Story = { args: { defaultValue: null, placeholder: 'YYYY-MM-DD' } };
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState<CalendarDate | null>('2026-10-12');
    return (
      <DatePicker
        {...args}
        mode="single"
        placeholder="YYYY-MM-DD"
        defaultValue={undefined}
        value={value}
        onChange={setValue}
      />
    );
  },
};
export const WithForm: Story = { render: () => <DatePickerFormDemo /> };
export const InModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Date"
          content={<DatePicker aria-label="Date in modal" defaultValue="2026-10-12" />}
        >
          {(trigger) => <Button {...trigger}>Open modal</Button>}
        </Modal>
      </>
    );
  },
};
