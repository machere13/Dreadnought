import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { selectDoc } from '../src/content/components/Fields/Select/SelectDoc.tsx';
import { tableDoc } from '../src/content/components/DataDisplay/Table/TableDoc.tsx';
import { SelectBasicDemo } from '../src/content/components/Fields/Select/SelectBasicDemo.tsx';
import { SelectMultipleDemo } from '../src/content/components/Fields/Select/SelectMultipleDemo.tsx';
import { TableBasicDemo } from '../src/content/components/DataDisplay/Table/TableBasicDemo.tsx';
import { TableLayoutDemo } from '../src/content/components/DataDisplay/Table/TableLayoutDemo.tsx';
import { TableFiltersDemo } from '../src/content/components/DataDisplay/Table/TableFiltersDemo.tsx';
import { TableSummaryDemo } from '../src/content/components/DataDisplay/Table/TableSummaryDemo.tsx';
import { TableSelectionDemo } from '../src/content/components/DataDisplay/Table/TableSelectionDemo.tsx';
import { ComponentDocumentation } from '../src/shared/ComponentDocumentation.tsx';

afterEach(cleanup);

it.each([
  ['Select', selectDoc, 'Fields/Select', 9],
  ['Table', tableDoc, 'DataDisplay/Table', 9],
] as const)('uses the exact runnable source for every %s example', (_title, doc, folder, count) => {
  expect(doc.examples).toHaveLength(count);
  expect(new Set(doc.examples!.map((example) => example.id)).size).toBe(count);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    const source = readFileSync(
      resolve('apps/docs/src/content/components', folder, `${name}.tsx`),
      'utf8',
    );
    expect(example.code).toBe(source);
    expect(source).not.toMatch(/from ['"]\./);
    expect(source).toContain('@dreadnought/ui/react');
    expect(example.description.length).toBeGreaterThan(20);
  }
});

it('pairs each labelled example with its own code and navigation link', () => {
  render(
    <ComponentDocumentation
      component="select"
      doc={{
        ...selectDoc,
        examples: selectDoc.examples!.slice(0, 2),
        apiRows: [],
        apiGroups: [],
        logicCode: undefined,
        notes: [],
      }}
    />,
  );
  for (const example of selectDoc.examples!.slice(0, 2)) {
    const region = screen.getByRole('region', { name: example.title });
    expect(within(region).getByRole('heading', { name: example.title })).toBeTruthy();
    expect(region.querySelector('pre')?.textContent).toBe(example.code);
    expect(screen.getByRole('link', { name: example.title }).getAttribute('href')).toBe(
      `#select-${example.id}`,
    );
  }
  expect(screen.queryByText(selectDoc.readyCode!, { exact: true })).toBeNull();
});

it('shows the selected name and clears the controlled single selection', async () => {
  const user = userEvent.setup();
  render(<SelectBasicDemo />);
  await user.click(screen.getByRole('combobox', { name: 'Исполнитель' }));
  await user.click(screen.getByRole('option', { name: 'Анна' }));
  expect(screen.getByRole('status').textContent).toBe('Исполнитель: Анна');
  await user.click(screen.getByRole('button', { name: /clear|очистить/i }));
  expect(screen.getByRole('status').textContent).toBe('Исполнитель: не выбран');
});

it('keeps a visible label and updates the multiple-selection result', async () => {
  const user = userEvent.setup();
  render(<SelectMultipleDemo />);
  expect(screen.getByRole('combobox', { name: 'Участники' })).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('Анна, Вера');
  await user.click(screen.getByRole('button', { name: 'Удалить Анна' }));
  expect(screen.getByRole('status').textContent).toContain('Вера');
  expect(screen.getByRole('status').textContent).not.toContain('Анна');
});

it('starts Table with a small local example and working sort', () => {
  expect(tableDoc.examples![0].id).toBe('basic');
  expect(tableDoc.examples!.at(-1)!.id).toBe('manual');
  render(<TableBasicDemo />);
  const table = screen.getByRole('table', { name: 'Пример таблицы' });
  expect(table.querySelector('tbody tr:first-child td')?.textContent).toBe('Борис');
  fireEvent.click(screen.getByRole('button', { name: 'Сортировать Имя' }));
  expect(table.querySelector('tbody tr:first-child td')?.textContent).toBe('Анна');
});

it('demonstrates hiding and restoring the grouped city column', () => {
  render(<TableLayoutDemo />);
  expect(screen.getByRole('columnheader', { name: 'Город' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Скрыть город' }));
  expect(screen.queryByRole('columnheader', { name: 'Город' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Показать город' }));
  expect(screen.getByRole('columnheader', { name: 'Город' })).toBeTruthy();
});

it('applies the age filter only after confirmation', () => {
  render(<TableFiltersDemo />);
  const table = screen.getByRole('table', { name: 'Расширенные фильтры' });
  fireEvent.click(screen.getByRole('button', { name: 'Фильтр Возраст' }));
  fireEvent.change(screen.getByLabelText('Минимальный возраст'), { target: { value: '30' } });
  expect(table.querySelectorAll('tbody tr')).toHaveLength(4);
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
  expect(table.querySelectorAll('tbody tr')).toHaveLength(1);
  expect(table.querySelector('tbody')?.textContent).toContain('Марк');
});

it('recalculates the documented summary when changing page', () => {
  render(<TableSummaryDemo />);
  const table = screen.getByRole('table', { name: 'Итоги страницы' });
  expect(table.querySelector('tfoot')?.textContent).toContain('360');
  fireEvent.click(screen.getByRole('button', { name: 'Следующая страница' }));
  expect(table.querySelector('tfoot')?.textContent).toContain('80');
  expect(table.querySelector('tbody')?.textContent).toContain('Тестирование');
});

it('shows initial and updated Table selection through row state and readable names', () => {
  render(<TableSelectionDemo />);
  const table = screen.getByRole('table', { name: 'Выбор участников' });
  const rows = table.querySelectorAll('tbody tr');
  expect(rows[0].getAttribute('data-selected')).toBe('true');
  expect(screen.getByRole('status').textContent).toBe('Выбраны: Анна');
  fireEvent.click(within(rows[1] as HTMLElement).getByRole('checkbox'));
  expect(rows[1].getAttribute('data-selected')).toBe('true');
  expect(screen.getByRole('status').textContent).toBe('Выбраны: Анна, Марк');
  fireEvent.click(within(rows[0] as HTMLElement).getByRole('checkbox'));
  expect(rows[0].getAttribute('data-selected')).not.toBe('true');
  expect(screen.getByRole('status').textContent).toBe('Выбраны: Марк');
  expect(rows[1].querySelector('[data-fixed="left"]')).toBeTruthy();
});
