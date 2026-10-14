import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { radarChartDoc } from '../src/content/components/Visualization/RadarChartDoc.tsx';

afterEach(cleanup);

it('pairs every RadarChart example with its complete source', () => {
  expect(radarChartDoc.examples).toHaveLength(3);
  for (const example of radarChartDoc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(
        resolve('apps/docs/src/content/components/Visualization', `${name}.tsx`),
        'utf8',
      ),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('accepts legend changes and restores both versions without losing table values', () => {
  render(radarChartDoc.examples![0].demo);
  for (const name of ['Версия 1.0', 'Версия 1.1']) {
    const button = screen.getByRole('button', { name });
    fireEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  }
  const table = screen.getByRole('table', { name: 'Сравнение версий: Данные' });
  expect(table.textContent).toContain('Версия 1.0');
  expect(table.textContent).toContain('80');
  fireEvent.click(screen.getByRole('button', { name: 'Показать все серии' }));
  for (const name of ['Версия 1.0', 'Версия 1.1']) {
    expect(screen.getByRole('button', { name }).getAttribute('aria-pressed')).toBe('true');
  }
});

it.each([
  [3, '3 оси'],
  [4, '4 оси'],
  [5, '5 осей'],
  [6, '6 осей'],
] as const)('updates plot vertices and table metrics for %s axes', (count, label) => {
  render(radarChartDoc.examples![1].demo);
  fireEvent.click(screen.getByRole('button', { name: label }));
  expect(screen.getByRole('button', { name: label }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getAllByRole('img')).toHaveLength(count);
  const table = screen.getByRole('table', { name: 'Количество осей: Данные' });
  expect(within(table).getAllByRole('row')).toHaveLength(count + 1);
});

it('shows original latency values in the tooltip for a reversed metric', () => {
  render(radarChartDoc.examples![2].demo);
  const point = screen.getByRole('img', { name: 'Основной, Задержка, мс: 60' });
  fireEvent.focus(point);
  const tooltip = screen.getByRole('tooltip');
  const values = within(tooltip).getByRole('table', { name: 'Задержка, мс' });
  expect(within(values).getByRole('row', { name: 'Основной 60' })).toBeTruthy();
  expect(within(values).getByRole('row', { name: 'Резервный 100' })).toBeTruthy();
  fireEvent.keyDown(point, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});
