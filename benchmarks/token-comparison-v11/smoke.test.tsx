// @vitest-environment jsdom
import {afterEach, describe, expect, it} from 'vitest';
import {cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WithDreadnought from './with-dreadnought/src/main';
import WithoutDreadnought from './without-dreadnought/src/main';

HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
};
afterEach(cleanup);
const searchInput = () => screen.getByLabelText<HTMLInputElement>('Поиск задач');

// Read the nearest numerical counter beside its visible label, regardless of markup.
function count(label: string) {
  const labels = screen.getAllByText(label, {exact: true}).filter(node => !node.closest('table, [role=tab], select'));
  for (const labelNode of labels) {
    let node: HTMLElement | null = labelNode;
    for (let depth = 0; node && depth < 4; depth++, node = node.parentElement) {
      const numbers = node.textContent?.match(/\d+/g);
      if (numbers?.length === 1) return Number(numbers[0]);
    }
  }
  throw new Error('Missing counter: ' + label);
}

describe.each([['Dreadnought', WithDreadnought], ['React/CSS', WithoutDreadnought]])('%s', (_name, App) => {
  it('filters by status and case-insensitive search together, keeping global counts', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(count('Всего')).toBe(3);
    expect(count('В работе')).toBe(1);
    expect(count('Готово')).toBe(1);
    const tab = screen.getByRole('tab', {name: 'В работе'});
    await user.click(tab);
    expect(within(screen.getByRole('table')).getByText('Собрать требования')).toBeTruthy();
    expect(screen.queryByText('Проверить макет')).toBeNull();
    await user.type(searchInput(), 'АННА');
    expect(within(screen.getByRole('table')).getByText('Собрать требования')).toBeTruthy();
    await user.clear(searchInput());
    await user.type(searchInput(), 'Борис');
    expect(within(screen.getByRole('tabpanel')).getByText('Задачи не найдены')).toBeTruthy();
    expect(count('Всего')).toBe(3);
    await user.click(screen.getByRole('tab', {name: 'Все'}));
    expect(within(screen.getByRole('table')).getByText('Проверить макет')).toBeTruthy();
  });

  it('creates a record, resets filters, closes the dialog and updates counters', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', {name: 'Готово'}));
    await user.type(searchInput(), 'нет совпадений');
    await user.click(screen.getByRole('button', {name: /Новая задача/}));
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-label') || dialog.getAttribute('aria-labelledby')).toBeTruthy();
    const title = within(dialog).getByLabelText(/^Название задачи/);
    await user.type(title, 'Новая тестовая задача');
    await user.type(within(dialog).getByLabelText(/^Исполнитель/), 'Даша');
    await user.selectOptions(within(dialog).getByLabelText(/^Статус/), 'В работе');
    await user.selectOptions(within(dialog).getByLabelText(/^Приоритет/), 'Высокий');
    await user.click(within(dialog).getByRole('button', {name: 'Создать задачу'}));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(searchInput().value).toBe('');
    expect(screen.getByRole('tab', {name: 'Все'}).getAttribute('aria-selected')).toBe('true');
    const row = within(screen.getByRole('table')).getByText('Новая тестовая задача').closest('tr')!;
    expect(within(row).getByText('Даша')).toBeTruthy();
    expect(within(row).getByText('В работе')).toBeTruthy();
    expect(within(row).getByText('Высокий')).toBeTruthy();
    expect(count('Всего')).toBe(4);
    expect(count('В работе')).toBe(2);
    expect(count('Готово')).toBe(1);
  });

  it('rejects whitespace-only fields and cancels without creating a task', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', {name: /Новая задача/}));
    const dialog = screen.getByRole('dialog');
    const title = within(dialog).getByLabelText(/^Название задачи/);
    await user.type(title, '   ');
    await user.type(within(dialog).getByLabelText(/^Исполнитель/), 'Даша');
    fireEvent.submit(title.closest('form')!);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(count('Всего')).toBe(3);
    await user.click(within(dialog).getByRole('button', {name: 'Отмена'}));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(count('Всего')).toBe(3);
  });

  it('supports keyboard tab navigation', async () => {
    const user = userEvent.setup();
    render(<App />);
    screen.getByRole('tab', {name: 'Все'}).focus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(screen.getByRole('tab', {name: 'К выполнению'}).getAttribute('aria-selected')).toBe('true');
    expect(within(screen.getByRole('table')).getByText('Проверить макет')).toBeTruthy();
    expect(screen.queryByText('Собрать требования')).toBeNull();
  });
});
