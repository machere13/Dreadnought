import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarkdownPreview } from '@dreadnought/ui/react';

const meta = {
  title: 'DataDisplay/MarkdownPreview', component: MarkdownPreview,
  args: { value: '# Markdown\n\nОбычный **текст**, ~~зачёркнутый~~ и [ссылка](https://example.com).\n\n- [x] Готово\n- [ ] В работе\n\n| Компонент | Статус |\n| - | - |\n| MarkdownEditor | Готов |\n\n```ts\nconst ready = true;\n```' },
} satisfies Meta<typeof MarkdownPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const RawHtml: Story = { args: { value: '<script>alert(1)</script>\n\nHTML не выполняется.' } };
export const Empty: Story = { args: { value: '' } };
