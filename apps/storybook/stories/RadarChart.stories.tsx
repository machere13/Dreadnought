import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadarChart } from '@dreadnought/ui/react';
import { RadarChartAdapter } from '@dreadnought/react/unstyled';
import styles from './RadarChart.stories.module.css';

const metrics = [
  { id: 'quality', label: 'Качество', domain: [0, 100] as const },
  { id: 'coverage', label: 'Покрытие', domain: [0, 100] as const },
  { id: 'latency', label: 'Задержка, мс', domain: [0, 200] as const, reverse: true },
];
const series = [
  { id: 'A', label: 'Вариант A', values: { quality: 80, coverage: 70, latency: 60 } },
  { id: 'B', label: 'Вариант B', values: { quality: 60, coverage: 90, latency: 100 } },
];
const meta = {
  title: 'Visualization/RadarChart', component: RadarChart,
  args: { label: 'Сравнение вариантов', metrics, series },
} satisfies Meta<typeof RadarChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Adaptive: Story = {};
export const FixedSize: Story = { args: { width: 400, height: 320 } };
function axes(count: number) {
  const metrics = ['Качество', 'Покрытие', 'Скорость', 'Надёжность', 'Удобство', 'Поддержка'].slice(0, count)
    .map((label, index) => ({ id: `metric-${index}`, label, domain: [0, 100] as const }));
  return { metrics, series: ['A', 'B'].map((id, seriesIndex) => ({ id, label: `Вариант ${id}`,
    values: Object.fromEntries(metrics.map((metric, index) => [metric.id, 45 + (index * 13 + seriesIndex * 17) % 50])) })) };
}
export const FourAxes: Story = { args: axes(4) };
export const FiveAxes: Story = { args: axes(5) };
export const SixAxes: Story = { args: axes(6) };
export const ScopedThemes: Story = {
  render: args => <div className={styles.themes}>
    <section className={styles.dark}><RadarChart {...args} label="Тёмная область" /></section>
    <section className={styles.light}><RadarChart {...args} label="Светлая область" /></section>
  </div>,
};
export const Adapter: Story = {
  render: args => <RadarChartAdapter {...args} width={400} height={320}
    slotProps={{ grid: { fill: 'none', stroke: 'currentColor' },
      series: () => ({ fill: 'none', stroke: 'currentColor' }) }} />,
};
export const ManySeries: Story = {
  args: { series: Array.from({ length: 8 }, (_, index) => ({
    id: `variant-${index}`, label: `Вариант ${index + 1}`,
    values: { quality: 40 + index * 5, coverage: 80 - index * 5, latency: 40 + index * 15 },
  })) },
};
