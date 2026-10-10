import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ComponentDocumentation } from '../src/shared/ComponentDocumentation.tsx';
import { getCatalogDoc } from '../src/data/catalog/getCatalogDoc.ts';

afterEach(cleanup);

it('does not render empty optional explanations or notes', () => {
  const { container } = render(
    <ComponentDocumentation component="button" doc={{
      ...getCatalogDoc('button'), title: 'Button', description: 'Кнопка.',
      adapterDescription: '', logicDescription: undefined, footnote: null,
      demo: <div>Пример кнопки</div>,
    }} />,
  );
  expect(Array.from(container.querySelectorAll('p')).filter(p => !p.textContent?.trim())).toEqual([]);
  expect(screen.getByRole('heading', { name: 'Основные свойства' })).toBeTruthy();
});

it('shows meaningful API descriptions without changing types and defaults', () => {
  const doc = getCatalogDoc('select');
  render(<ComponentDocumentation component="select" doc={{
    ...doc, title: 'Select', description: 'Выбор.', adapterDescription: '',
    footnote: null, demo: <div>Пример выбора</div>,
  }} />);
  const table = screen.getByRole('table', { name: 'Select API' });
  expect(within(table).queryAllByText('Свойство компонента')).toEqual([]);
  const disabled = within(table).getByRole('rowheader', { name: 'disabled' }).closest('tr')!;
  expect(within(disabled).getByRole('cell', { name: 'boolean', exact: true })).toBeTruthy();
  expect(within(disabled).getByRole('cell', { name: 'false', exact: true })).toBeTruthy();
});
