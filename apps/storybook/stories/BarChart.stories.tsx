import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarChart } from '@dreadnought/ui/react';

const categories = [{ id: 'jan', label: 'Январь' }, { id: 'feb', label: 'Февраль' }, { id: 'mar', label: 'Март' }];
const series = [{ id: 'a', label: 'Вариант A', values: { jan: 60, feb: 85, mar: 70 } },
  { id: 'b', label: 'Вариант B', values: { jan: 40, feb: 60, mar: 90 } }];
const meta = { title: 'Visualization/BarChart', component: BarChart,
  args: { label: 'Сравнение по месяцам', categories, series, domain: [0, 100], categoryLabel: 'Месяц', valueLabel: 'Значение' },
} satisfies Meta<typeof BarChart>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Adaptive: Story = {};
export const FixedSize: Story = { args: { width: 600, height: 320 } };
export const Horizontal: Story = { args: { width: 600, height: 320, orientation: 'horizontal' } };
export const Negative: Story = { args: { width: 600, height: 320, domain: [-100, 100], series: [{ id: 'a', label: 'Баланс', values: { jan: -60, feb: 0, mar: 80 } }] } };
export const Missing: Story = { args: { series: [{ ...series[0], values: { jan: null, feb: 0, mar: 70 } }, series[1]] } };
export const Empty: Story = { args: { categories: [], series: [] } };
export const Narrow: Story = { args: { width: 320, height: 240 } };
