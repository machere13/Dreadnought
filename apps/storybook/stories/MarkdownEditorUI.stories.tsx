import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarkdownEditor } from '@dreadnought/ui/react';

const meta = {
  title: 'Fields/MarkdownEditor', component: MarkdownEditor,
  args: { 'aria-label': 'Markdown', defaultValue: '# Заметки\n\nВыделите текст и выберите форматирование.', rows: 8 },
} satisfies Meta<typeof MarkdownEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Controlled: Story = {
  render: function ControlledEditor(args) {
    const [value, setValue] = useState('Редактируемый текст');
    return <MarkdownEditor {...args} value={value} onValueChange={setValue} />;
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
export const Invalid: Story = { args: { invalid: true } };
export const WithoutToolbar: Story = { args: { toolbar: false } };
export const Narrow: Story = { render: args => <div style={{ width: 240, maxWidth: '100%' }}><MarkdownEditor {...args} /></div> };
export const AutoSize: Story = { args: { autoSize: true, minRows: 3, maxRows: 10 } };
