import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DocsPage } from '../src/components/DocsPage';

afterEach(cleanup);

describe('documentation pages', () => {
  it('offers a real route from the overview to Button', () => {
    render(<DocsPage section="overview" />);

    expect(screen.getByRole('heading', { name: 'Начните с готового компонента' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Посмотреть Button' }).getAttribute('href')).toBe('/components/button/');
    expect(screen.getByRole('list', { name: 'Три уровня использования' }).querySelectorAll('[role="listitem"]')).toHaveLength(3);
  });

  it('renders Button API and updates the live example', () => {
    render(<DocsPage section="button" />);

    expect(screen.getByRole('heading', { name: 'Button', level: 1 })).toBeTruthy();
    expect(screen.getByText('Нажатий: 0')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Нажать' }));
    expect(screen.getByText('Нажатий: 1')).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'loading' })).toBeTruthy();
    expect(screen.getByRole('table').getAttribute('data-ui')).toBe('table');
  });

  it('links to Table and uses the same documentation structure', () => {
    render(<DocsPage section="table" />);

    expect(screen.getByRole('link', { name: 'Table' }).getAttribute('href')).toBe('/components/table/');
    expect(screen.getByRole('heading', { name: 'Table', level: 1 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Пример' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Когда нужен другой слой' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Основные свойства' })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'dataSource' })).toBeTruthy();
  });

  it('lets readers sort the live Table example', () => {
    render(<DocsPage section="table" />);

    const table = screen.getByRole('table', { name: 'Пример таблицы' });
    expect(table.querySelector('tbody tr:first-child td')?.textContent).toBe('Борис');
    fireEvent.click(screen.getByRole('button', { name: 'Сортировать Имя' }));
    expect(table.querySelector('tbody tr:first-child td')?.textContent).toBe('Анна');
  });

  it('documents Input with a working password visibility example', () => {
    render(<DocsPage section="input" />);

    expect(screen.getByRole('heading', { name: 'Input', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'passwordVisibilityLabels' })).toBeTruthy();
    const password = screen.getByLabelText('Пароль');
    expect(password.getAttribute('type')).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Показать пароль' }));
    expect(password.getAttribute('type')).toBe('text');
  });

  it('documents TextArea with an editable auto-sizing example', () => {
    render(<DocsPage section="textarea" />);

    expect(screen.getByRole('heading', { name: 'TextArea', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'autoSize' })).toBeTruthy();
    const notes = screen.getByRole('textbox', { name: 'Заметки' }) as HTMLTextAreaElement;
    fireEvent.change(notes, { target: { value: 'Новая заметка' } });
    expect(notes.value).toBe('Новая заметка');
    expect(notes.hasAttribute('data-auto-size')).toBe(true);
  });

  it('documents Badge variants and keeps the target interactive', () => {
    render(<DocsPage section="badge" />);

    expect(screen.getByRole('link', { name: 'Badge' }).getAttribute('href')).toBe('/components/badge/');
    expect(screen.getByRole('heading', { name: 'Badge', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'appearance' })).toBeTruthy();
    expect(screen.getByText('Ghosted')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Своя разметка — логика' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Уведомления, 2 новых' }));
    expect(screen.getByRole('button', { name: 'Уведомления, 3 новых' })).toBeTruthy();
  });

  it('documents Card composition without inventing a logic API', () => {
    render(<DocsPage section="card" />);

    expect(screen.getByRole('link', { name: 'Card' }).getAttribute('href')).toBe('/components/card/');
    expect(screen.getByRole('heading', { name: 'Card', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'children' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Своя разметка — логика' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Подробнее' }));
    expect(screen.getByText('В карточку можно вложить любые компоненты.')).toBeTruthy();
  });
});
