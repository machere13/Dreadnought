import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Tooltip } from '@dreadnought/ui/react';

const meta = { title: 'Overlays/Tooltip', component: Tooltip,
  args: { content: 'Открывает настройки приложения', children: trigger => <Button {...trigger}>Настройки</Button> },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const LongContent: Story = { args: { content: 'Подсказка переносится на несколько строк и остаётся открытой, когда указатель находится над ней. Escape закрывает её.' } };
