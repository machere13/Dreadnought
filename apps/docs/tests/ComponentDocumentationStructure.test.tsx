import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { ComponentDocumentation } from '../src/shared/ComponentDocumentation.tsx';
import { ApiTable } from '../src/shared/ApiTable.tsx';
import type { ComponentDoc } from '../src/shared/types.ts';

afterEach(cleanup);

const doc: ComponentDoc = {
  title: 'Пример',
  description: 'Описание',
  usage: 'Назначение',
  adapterCode: 'adapter()',
  adapterDescription: '',
  primaryProps: ['value'],
  apiRows: [
    ['value', 'string', '—', 'Значение'],
    ['open', 'boolean', 'false', 'Открытие'],
  ],
  notes: ['Подтверждение', 'Отмена'],
  examples: [
    {
      id: 'basic',
      title: 'Основной',
      description: 'Первый сценарий',
      demo: <button>Первое действие</button>,
      code: 'basic()',
    },
    {
      id: 'advanced',
      title: 'Дополнительный',
      description: 'Второй сценарий',
      demo: <button>Второе действие</button>,
      code: 'advanced()',
    },
  ],
};

it('puts the most important properties first rather than sorting the main API alphabetically', () => {
  render(
    <ComponentDocumentation component="button" doc={{ ...doc, primaryProps: ['open', 'value'] }} />,
  );
  expect(
    within(screen.getByRole('table', { name: 'Пример API', exact: true }))
      .getAllByRole('rowheader')
      .map((cell) => cell.textContent),
  ).toEqual(['open', 'value']);
});

it('keeps demos visible while revealing additional source on demand', async () => {
  const user = userEvent.setup();
  render(<ComponentDocumentation component="button" doc={doc} />);
  const basic = screen.getByRole('region', { name: 'Основной', exact: true });
  const advanced = screen.getByRole('region', { name: 'Дополнительный', exact: true });
  expect(basic.querySelector('details')).toBeNull();
  const toggle = within(advanced).getByRole('button', { name: 'Код примера' });
  expect(advanced.querySelector('details')).toBeNull();
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(within(advanced).getByRole('button', { name: 'Второе действие' })).toBeTruthy();
  await user.click(toggle);
  expect(advanced.querySelector('pre')?.textContent).toBe('advanced()');
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  await user.keyboard('{Enter}');
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(within(advanced).getByRole('button', { name: 'Второе действие' })).toBeTruthy();
});

it('preserves all API rows and links to a distinct list of limitations', async () => {
  const user = userEvent.setup();
  render(<ComponentDocumentation component="button" doc={doc} />);
  const basicApi = within(screen.getByRole('table', { name: 'Пример API', exact: true }));
  expect(basicApi.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['value']);
  const toggle = screen.getByRole('button', { name: 'Остальные свойства (1)' });
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  await user.click(toggle);
  expect(
    within(screen.getByRole('table', { name: 'Пример: остальные свойства' }))
      .getAllByRole('rowheader')
      .map((cell) => cell.textContent),
  ).toEqual(['open']);
  await user.keyboard('{Enter}');
  expect(screen.queryByRole('table', { name: 'Пример: остальные свойства' })).toBeNull();
  const notes = screen.getByRole('region', { name: 'Поведение и ограничения' });
  expect(
    within(notes)
      .getAllByRole('listitem')
      .map((item) => item.textContent),
  ).toEqual(['Подтверждение', 'Отмена']);
  expect(
    screen
      .getByRole('link', { name: 'Поведение и ограничения', hidden: true })
      .getAttribute('href'),
  ).toBe('#button-notes');
});

it('reveals a long API type through an accessible accordion trigger', async () => {
  const user = userEvent.setup();
  const type = `${'Readonly<Record<string, string>> | '.repeat(6)}undefined`;
  render(<ApiTable component="button" label="API" rows={[['value', type, '—', 'Значение']]} />);
  const toggle = screen.getByRole('button', { name: 'Полный тип' });
  const panel = document.getElementById(toggle.getAttribute('aria-controls')!)!;
  expect(panel.hidden).toBe(true);
  expect(panel.textContent).toBe(type);
  await user.click(toggle);
  expect(panel.hidden).toBe(false);
  await user.keyboard('{Enter}');
  expect(panel.hidden).toBe(true);
});
