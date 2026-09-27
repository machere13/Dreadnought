import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock } from '@dreadnought/ui/react';

const meta = {
  title: 'DataDisplay/CodeBlock',
  component: CodeBlock,
  args: {
    code: "import { Button } from '@dreadnought/ui/react';\n\n<Button>Нажать</Button>;\n",
    language: 'tsx',
    copyable: true,
  },
  argTypes: {
    code: { control: 'text' },
    language: { control: 'text' },
    copyable: { control: 'boolean' },
    copyLabels: { control: 'object' },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoCopy: Story = { args: { copyable: false } };
export const Empty: Story = { args: { code: '', language: undefined } };
