import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { ComponentDocumentation } from '../src/shared/ComponentDocumentation.tsx';
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
  expect(advanced.querySelector('details')?.open).toBe(false);
  expect(within(advanced).getByRole('button', { name: 'Второе действие' })).toBeTruthy();
  await user.click(within(advanced).getByText('Код примера'));
  expect(advanced.querySelector('pre')?.textContent).toBe('advanced()');
  expect(advanced.querySelector('details')?.open).toBe(true);
});

it('preserves all API rows and links to a distinct list of limitations', async () => {
  const user = userEvent.setup();
  render(<ComponentDocumentation component="button" doc={doc} />);
  const basicApi = within(screen.getByRole('table', { name: 'Пример API', exact: true }));
  expect(basicApi.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual(['value']);
  await user.click(screen.getByText('Остальные свойства (1)'));
  expect(
    within(screen.getByRole('table', { name: 'Пример: остальные свойства' }))
      .getAllByRole('rowheader')
      .map((cell) => cell.textContent),
  ).toEqual(['open']);
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
