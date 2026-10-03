// @vitest-environment jsdom
import {afterEach, describe, expect, it} from 'vitest';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import WithDreadnought from './with-dreadnought/src/App';
import WithoutDreadnought from './without-dreadnought/src/App';

HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
};
afterEach(cleanup);

describe.each([
  ['Dreadnought', WithDreadnought],
  ['React/CSS', WithoutDreadnought],
])('%s dashboard', (_name, App) => {
  it('adds a task and searches the list', () => {
    render(<App />);
    expect(screen.getAllByText('Собрать требования').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', {name: /Новая задача/i}));
    const title = screen.getByLabelText('Название задачи');
    const assignee = screen.getByLabelText('Исполнитель');
    fireEvent.change(title, {target: {value: 'Новая тестовая задача'}});
    fireEvent.change(assignee, {target: {value: 'Даша'}});
    fireEvent.submit(title.closest('form')!);
    expect(screen.getAllByText('Новая тестовая задача').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByRole('searchbox'), {target: {value: 'несуществующий запрос'}});
    expect(screen.getAllByText('Задачи не найдены').length).toBeGreaterThan(0);
  });
});
