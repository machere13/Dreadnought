import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { lineChartDoc } from '../src/content/components/Visualization/LineChartDoc.tsx';
import { barChartDoc } from '../src/content/components/Visualization/BarChartDoc.tsx';

afterEach(cleanup);

it.each([
  ['LineChart', lineChartDoc],
  ['BarChart', barChartDoc],
] as const)('pairs each %s example with its complete source', (_name, doc) => {
  expect(doc.examples).toHaveLength(3);
  for (const example of doc.examples!) {
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

it('hides the planned line without removing its original table values', () => {
  render(lineChartDoc.examples![0].demo);
  const button = screen.getByRole('button', { name: 'План' });
  fireEvent.click(button);
  expect(button.getAttribute('aria-pressed')).toBe('false');
  const table = screen.getByRole('table', { name: 'Заказы по дням: Данные' });
  expect(table.textContent).toContain('85 заказов');
  fireEvent.click(button);
  expect(button.getAttribute('aria-pressed')).toBe('true');
});

it('keeps a missing temperature distinct from zero in the table', () => {
  render(lineChartDoc.examples![1].demo);
  const table = screen.getByRole('table', { name: 'Температура с пропуском: Данные' });
  expect(within(table).getByRole('row', { name: '2 ч —' })).toBeTruthy();
  expect(within(table).getByRole('cell', { name: '24 °C' })).toBeTruthy();
});

it('pages the original line data while range controls limit only the plot', () => {
  render(lineChartDoc.examples![2].demo);
  const table = screen.getByRole('table', { name: 'Поступления за 12 дней: Данные' });
  expect(within(table).getAllByRole('row')).toHaveLength(5);
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница данных' }));
  expect(within(table).getByRole('rowheader', { name: 'День 5' })).toBeTruthy();
  fireEvent.change(screen.getByRole('slider', { name: 'Начало диапазона' }), {
    target: { value: '5' },
  });
  fireEvent.change(screen.getByRole('slider', { name: 'Конец диапазона' }), {
    target: { value: '8' },
  });
  expect(screen.queryByRole('img', { name: 'Поступления, День 1: 20 заказов' })).toBeNull();
  expect(screen.getByRole('img', { name: 'Поступления, День 6: 48 заказов' })).toBeTruthy();
  expect(within(table).getByRole('rowheader', { name: 'День 5' })).toBeTruthy();
});

it('hides the planned bars without removing the full comparison table', () => {
  render(barChartDoc.examples![0].demo);
  const button = screen.getByRole('button', { name: 'План' });
  fireEvent.click(button);
  expect(button.getAttribute('aria-pressed')).toBe('false');
  expect(screen.getByRole('table', { name: 'Заказы по месяцам: Данные' }).textContent).toContain(
    '85 заказов',
  );
});

it('navigates horizontal bars with ArrowDown and closes their tooltip', () => {
  render(barChartDoc.examples![1].demo);
  const first = screen.getByRole('img', { name: 'Трудозатраты, Разработка: 14 ч' });
  fireEvent.focus(first);
  expect(screen.getByRole('tooltip').textContent).toContain('14 ч');
  fireEvent.keyDown(first, { key: 'ArrowDown' });
  const second = screen.getByRole('img', { name: 'Трудозатраты, Дизайн: 8 ч' });
  expect(document.activeElement).toBe(second);
  fireEvent.keyDown(second, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
});

it('distinguishes negative, zero and missing bar values', () => {
  render(barChartDoc.examples![2].demo);
  const table = screen.getByRole('table', { name: 'Баланс по дням: Данные' });
  expect(within(table).getByRole('cell', { name: '-8 ед.' })).toBeTruthy();
  expect(within(table).getByRole('cell', { name: '0 ед.' })).toBeTruthy();
  expect(within(table).getByRole('row', { name: 'Четверг —' })).toBeTruthy();
});
