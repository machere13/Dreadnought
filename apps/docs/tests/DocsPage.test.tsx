import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocsPage } from '../src/components/DocsPage';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

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

  it('documents Tabs with a working, accessible layered example', () => {
    render(<DocsPage section="tabs" />);

    expect(screen.getByRole('link', { name: 'Tabs' }).getAttribute('href')).toBe('/components/tabs/');
    expect(screen.getByRole('heading', { name: 'Tabs', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'defaultValue' })).toBeTruthy();
    expect(screen.getByRole('tablist', { name: 'Уровень библиотеки' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Компонент' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByRole('tab', { name: 'Адаптер' }));
    expect(screen.getByRole('tab', { name: 'Адаптер' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toContain('Разметка и поведение без готовых стилей.');
  });

  it('documents Accordion and opens the live FAQ', () => {
    render(<DocsPage section="accordion" />);

    expect(screen.getByRole('link', { name: 'Accordion' }).getAttribute('href')).toBe('/components/accordion/');
    expect(screen.getByRole('heading', { name: 'Accordion', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'multiple' })).toBeTruthy();
    const trigger = screen.getByRole('button', { name: 'Как подключить компонент?' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Импортируйте готовый компонент из @dreadnought/ui/react.')).toBeTruthy();
  });

  it('documents CodeBlock with a working copy example', async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(<DocsPage section="codeblock" />);

    expect(screen.getByRole('link', { name: 'CodeBlock' }).getAttribute('href')).toBe('/components/codeblock/');
    expect(screen.getByRole('heading', { name: 'CodeBlock', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'copyable' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Копировать пример' }));
    expect(await screen.findByRole('button', { name: 'Пример скопирован' })).toBeTruthy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('const answer = 42;\n');
  });

  it('documents Alert with independent close and retry actions', () => {
    render(<DocsPage section="alert" />);

    expect(screen.getByRole('link', { name: 'Alert' }).getAttribute('href')).toBe('/components/alert/');
    expect(screen.getByRole('heading', { name: 'Alert', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'variant' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Полезная подсказка');
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть подсказку' }));
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(screen.getByRole('alert').textContent).toContain('Попыток: 1');
  });
});
