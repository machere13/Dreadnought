// @vitest-environment node
import { expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { RadarChartAdapter } from '../../../src/unstyled.ts';

const metrics = ['a', 'b', 'c'].map((id) => ({ id, label: id, domain: [0, 100] as const }));
const series = [{ id: 'A', label: 'A', values: { a: 100, b: 50, c: 0 } }];
it('renders fixed SVG and data without DOM globals', () => {
  expect(typeof document).toBe('undefined');
  const html = renderToString(
    <RadarChartAdapter
      label="Сравнение"
      metrics={metrics}
      series={series}
      width={400}
      height={320}
    />,
  );
  expect(html).toContain('<svg');
  expect(html).toContain('<table');
  expect(html).toContain('aria-pressed="true"');
});
it('renders adaptive data but no SVG without a measured container', () => {
  const html = renderToString(
    <RadarChartAdapter label="Сравнение" metrics={metrics} series={series} />,
  );
  expect(html).not.toContain('<svg');
  expect(html).toContain('<table');
  expect(html).toContain('<button');
});
