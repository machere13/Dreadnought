import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { PieChart, usePieChart } from '@dreadnought/ui/react';
import {
  pieChartPresentation,
  getPieItemClasses,
  markPresentation,
  tablePresentation,
} from '@dreadnought/ui';
import { PieChartAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);
it('uses distinct colors for up to six categories even when their ID hashes collide', () => {
  const categories = ['direct', 'search', 'social', 'email', 'design', 'testing'].map((id) => ({
    id,
    label: id,
    value: 1,
  }));
  const view = render(<PieChart data={categories} label="Colors" width={400} height={320} />);
  const colors = () => screen.getAllByRole('img').map((node) => node.getAttribute('class'));
  const original = colors();
  expect(new Set(original).size).toBe(6);
  view.rerender(
    <PieChart data={[...categories].reverse()} label="Colors" width={400} height={320} />,
  );
  expect(colors()).toEqual([...original].reverse());
});
const data = [
  { id: '__proto__', label: 'Alpha', value: 30 },
  { id: 'constructor', label: 'Beta', value: 70 },
];
const props = { data, label: 'Budget', width: 400, height: 320 };
it('themes composed parts and shares visibility with custom controls', () => {
  function Summary() {
    const { layout } = usePieChart();
    return <p>Total {layout.total}</p>;
  }
  const view = render(
    <PieChart {...props}>
      <Summary />
      <PieChart.Table />
      <PieChart.Legend />
      <PieChart.Plot>{({ defaultContent }) => <g>{defaultContent}</g>}</PieChart.Plot>
    </PieChart>,
  );
  expect(screen.getByText('Total 100')).toBeTruthy();
  const target = screen.getByRole('img', { name: 'Alpha: 30 (30%)' });
  expect(target.getAttribute('data-custom')).toBe('true');
  expect(target.style.fillOpacity).toBe('0');
  expect(
    view.container.querySelector('[data-ui="pie-slice-drawing"] path')?.getAttribute('class'),
  ).toContain(pieChartPresentation.slice);
  fireEvent.click(screen.getByRole('button', { name: 'Alpha' }));
  expect(screen.getByText('Total 70')).toBeTruthy();
  expect(screen.getByRole('table').className).toContain(tablePresentation.root);
});
const alphaColor = () => getPieItemClasses(data.map((item) => item.id)).get('__proto__');

it('applies presentation only in UI and preserves consumer classes', () => {
  const view = render(
    <>
      <PieChart {...props} className="consumer" />
      <PieChartAdapter {...props} label="Plain" />
    </>,
  );
  const figures = view.container.querySelectorAll('figure');
  expect(figures[0].className).toContain('consumer');
  expect(figures[0].className).toContain(pieChartPresentation.root);
  expect(figures[0].querySelector('table')?.className).toContain(tablePresentation.root);
  for (const part of ['pie-plot', 'pie-slice', 'pie-legend-button', 'pie-table']) {
    expect(figures[0].querySelector(`[data-ui="${part}"]`)?.getAttribute('class')).toBeTruthy();
    expect(figures[1].querySelector(`[data-ui="${part}"]`)?.getAttribute('class')).toBeNull();
  }
});

it('keeps the same color for slices, legend and tooltip through reordering', () => {
  const view = render(
    <PieChart {...props} slotProps={{ tooltipMark: () => ({ className: 'consumer-mark' }) }} />,
  );
  fireEvent.focus(screen.getByRole('img', { name: 'Alpha: 30 (30%)' }));
  const mark = screen.getByRole('tooltip').querySelector('[data-ui="mark"]')!;
  expect(mark.className).toContain('consumer-mark');
  expect(mark.className).toContain(markPresentation.root);
  expect(mark.className).toContain(alphaColor());
  expect(screen.getByRole('button', { name: 'Alpha' }).className).toContain(alphaColor());
  view.rerender(<PieChart {...props} data={[data[1], data[0]]} />);
  expect(screen.getByRole('img', { name: 'Alpha: 30 (30%)' }).getAttribute('class')).toContain(
    alphaColor(),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Beta' }));
  expect(screen.getByRole('img', { name: 'Alpha: 30 (100%)' }).getAttribute('class')).toContain(
    alphaColor(),
  );
  expect(
    within(screen.getByRole('table', { name: /Все исходные данные/ })).getByText('Beta'),
  ).toBeTruthy();
});
