import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarkdownEditorAdapter } from '@dreadnought/react/unstyled';
import type { MarkdownEditorControls } from '@dreadnought/react/unstyled';
import { Button, Toolbar } from '@dreadnought/ui/react';

function Commands({ execute, disabled, readOnly }: MarkdownEditorControls) {
  return <Toolbar navigation="native" aria-label="Форматирование Markdown">
    <Button size="compact" variant="secondary" disabled={disabled || readOnly} onClick={() => execute({ type: 'bold' })}>Bold</Button>
    <Button size="compact" variant="secondary" disabled={disabled || readOnly} onClick={() => execute({ type: 'italic' })}>Italic</Button>
    <Button size="compact" variant="secondary" disabled={disabled || readOnly} onClick={() => execute({ type: 'heading', level: 2 })}>Heading</Button>
    <Button size="compact" variant="secondary" disabled={disabled || readOnly} onClick={() => execute({ type: 'list', style: 'unordered' })}>List</Button>
  </Toolbar>;
}

const meta = {
  title: 'Fields/MarkdownEditorAdapter', component: MarkdownEditorAdapter,
  args: { 'aria-label': 'Markdown', defaultValue: 'hello', rows: 8, cols: 60, renderToolbar: controls => <Commands {...controls} /> },
} satisfies Meta<typeof MarkdownEditorAdapter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {};
export const Controlled: Story = {
  render: function ControlledEditor(args) {
    const [value, setValue] = useState('hello');
    return <><MarkdownEditorAdapter {...args} value={value} onValueChange={setValue} />
      <Button variant="ghosted" onClick={() => setValue('hello')}>Сбросить значение</Button></>;
  },
};
export const Disabled: Story = { args: { disabled: true } };
export const ReadOnly: Story = { args: { readOnly: true } };
