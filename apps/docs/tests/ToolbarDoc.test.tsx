import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { toolbarDoc } from '../src/content/components/Controls/Toolbar/ToolbarDoc.tsx';
import { ToolbarFormatDemo } from '../src/content/components/Controls/Toolbar/ToolbarFormatDemo.tsx';
import { ToolbarFiltersDemo } from '../src/content/components/Controls/Toolbar/ToolbarFiltersDemo.tsx';
import { ToolbarVerticalDemo } from '../src/content/components/Controls/Toolbar/ToolbarVerticalDemo.tsx';

afterEach(cleanup);

it('shows the exact portable source for all three Toolbar scenarios', () => {
  expect(toolbarDoc.examples).toHaveLength(3);
  for (const example of toolbarDoc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Controls', toolbarDoc.title, `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
    expect(example.description).toBeTruthy();
  }
});

it('applies and resets the advertised formatting in the visible sample', () => {
  render(<ToolbarFormatDemo />);
  const sample = screen.getByText('Этот текст меняется после нажатия кнопок.');
  fireEvent.click(screen.getByRole('button', { name: 'Жирный' }));
  fireEvent.click(screen.getByRole('button', { name: 'Курсив' }));
  expect(sample.style.fontWeight).toBe('700');
  expect(sample.style.fontStyle).toBe('italic');
  expect(screen.getByRole('button', { name: 'Жирный' }).getAttribute('aria-pressed')).toBe('true');
  expect(screen.getByRole('status').textContent).toBe('Начертание: жирное, курсив');
  fireEvent.click(screen.getByRole('button', { name: 'Сбросить формат' }));
  expect(sample.style.fontWeight).toBe('400');
  expect(sample.style.fontStyle).toBe('normal');
  expect(screen.getByRole('status').textContent).toBe('Начертание: обычное');
});

it('supports arrows between format actions and Tab out of the panel', async () => {
  const user = userEvent.setup();
  render(
    <>
      <ToolbarFormatDemo />
      <button>После панели</button>
    </>,
  );
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Жирный' }));
  await user.keyboard('{ArrowRight}{Enter}');
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Курсив' }));
  expect(screen.getByRole('status').textContent).toBe('Начертание: курсив');
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'После панели' }));
});

it('applies draft filters only on request and resets both controls and results', async () => {
  const user = userEvent.setup();
  render(<ToolbarFiltersDemo />);
  const search = screen.getByRole('textbox', { name: 'Название документа' });
  const list = screen.getByRole('list', { name: 'Найденные документы' });
  fireEvent.change(search, { target: { value: 'План' } });
  await user.click(screen.getByRole('combobox', { name: 'Статус документа' }));
  await user.click(screen.getByRole('option', { name: 'Архив' }));
  expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
  expect(within(list).getAllByRole('listitem')).toHaveLength(1);
  expect(list.textContent).toContain('План прошлого года');
  fireEvent.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
  expect(search).toHaveProperty('value', '');
  expect(screen.getByRole('combobox', { name: 'Статус документа' })).toHaveProperty('value', '');
  expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  fireEvent.change(search, { target: { value: 'несуществующий документ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Применить' }));
  expect(screen.getByRole('status').textContent).toBe('Ничего не найдено');
});

it('keeps native field navigation instead of taking their arrow keys', async () => {
  const user = userEvent.setup();
  render(<ToolbarFiltersDemo />);
  await user.tab();
  const search = screen.getByRole('textbox', { name: 'Название документа' });
  expect(document.activeElement).toBe(search);
  await user.keyboard('{ArrowRight}');
  expect(document.activeElement).toBe(search);
  await user.tab();
  expect(document.activeElement).toBe(screen.getByRole('combobox', { name: 'Статус документа' }));
});

it('changes sample size, disables the boundary command and avoids keyboard wrapping', async () => {
  const user = userEvent.setup();
  render(<ToolbarVerticalDemo />);
  const increase = screen.getByRole('button', { name: 'Увеличить' });
  await user.click(increase);
  await user.click(increase);
  expect(increase).toHaveProperty('disabled', true);
  expect(screen.getByText('Образец текста').style.fontSize).toBe('150%');
  const decrease = screen.getByRole('button', { name: 'Уменьшить' });
  decrease.focus();
  await user.keyboard('{ArrowUp}');
  expect(document.activeElement).toBe(decrease);
  await user.keyboard('{ArrowDown}');
  const reset = screen.getByRole('button', { name: 'Сбросить масштаб' });
  expect(document.activeElement).toBe(reset);
  await user.keyboard('{ArrowDown}');
  expect(document.activeElement).toBe(reset);
  await user.keyboard('{Enter}');
  expect(screen.getByRole('status').textContent).toBe('Масштаб: 100%');
  expect(increase).toHaveProperty('disabled', false);
});
