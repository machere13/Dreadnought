import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocsPage } from '../src/components/DocsPage';

vi.mock('../src/knowledge/useKnowledge.ts', () => {
  const state = { entries: [{ id: 'catalog:table:sticky', sourceKind: 'catalog', sourceId: 'catalog:table', title: 'Table · sticky', url: '/components/table/#table-api', text: 'sticky: закреплённая шапка', code: [] }], loading: false, error: null, retry: vi.fn() };
  return { useKnowledge: () => state };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('documentation pages', () => {
  it('documents Switch with an interactive native control and public API', () => {
    render(<DocsPage section="switch" />);
    expect(screen.getByRole('heading', { name: 'Switch', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'checked' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Switch' }).getAttribute('href')).toBe('/components/switch/');
    const input = screen.getByRole('switch', { name: 'Получать уведомления' }) as HTMLInputElement;
    fireEvent.click(input);
    expect(input.checked).toBe(true);
  });
  it('documents Dropdown with a working action menu and its public API', () => {
    render(<DocsPage section="dropdown" />);
    expect(screen.getByRole('heading', { name: 'Dropdown', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'items' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Dropdown' }).getAttribute('href')).toBe('/components/dropdown/');
    const trigger = screen.getByRole('button', { name: 'Действия с файлом' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Скачать' }));
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByText('Выбрано: Скачать')).toBeTruthy();
    expect(document.activeElement).toBe(trigger);
  });
  it('documents Drawer with a working form and visual-only API', () => {
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: { configurable: true, value() { this.open = true; } },
      close: { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } },
    });
    try {
      render(<DocsPage section="drawer" />);
      expect(screen.getByRole('heading', { name: 'Drawer', level: 1 })).toBeTruthy();
      expect(screen.getByRole('rowheader', { name: 'placement' })).toBeTruthy();
      expect(screen.getByRole('rowheader', { name: 'size' })).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Drawer' }).getAttribute('href')).toBe('/components/drawer/');
      const trigger = screen.getByRole('button', { name: 'Настроить профиль' });
      trigger.focus(); fireEvent.click(trigger);
      const field = screen.getByRole('textbox', { name: 'Имя профиля' });
      fireEvent.change(field, { target: { value: 'Ada' } });
      expect((field as HTMLInputElement).value).toBe('Ada');
      field.focus(); fireEvent.click(screen.getByRole('button', { name: 'Сохранить профиль' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).toBe(trigger);
    } finally {
      cleanup();
      delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
      delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
    }
  });
  it('documents Modal with a working form and explicit closure', () => {
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: { configurable: true, value() { this.open = true; } },
      close: { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } },
    });
    try {
      render(<DocsPage section="modal" />);
      expect(document.getElementById('modal-api')).toBeTruthy();
      expect(screen.getByRole('link', { name: 'Modal' }).getAttribute('href')).toBe('/components/modal/');
      const trigger = screen.getByRole('button', { name: 'Редактировать профиль' });
      trigger.focus(); fireEvent.click(trigger);
      const field = screen.getByRole('textbox', { name: 'Имя профиля' });
      fireEvent.change(field, { target: { value: 'Ada' } });
      expect((field as HTMLInputElement).value).toBe('Ada');
      field.focus();
      fireEvent.click(screen.getByRole('button', { name: 'Сохранить профиль' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(document.activeElement).toBe(trigger);
    } finally {
      cleanup();
      delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
      delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
    }
  });
  it('documents Popover layers with a working interactive panel', () => {
    render(<DocsPage section="popover" />);
    expect(document.getElementById('popover-api')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Popover' }).getAttribute('href')).toBe('/components/popover/');
    const trigger = screen.getByRole('button', { name: 'Настройки профиля' });
    fireEvent.click(trigger);
    const field = screen.getByRole('textbox', { name: 'Имя профиля' });
    expect(document.activeElement).toBe(field);
    fireEvent.change(field, { target: { value: 'Ada' } });
    expect((field as HTMLInputElement).value).toBe('Ada');
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull(); expect(document.activeElement).toBe(trigger);
  });
  it('keeps only the wordmark in the header and footer', () => {
    render(<DocsPage section="overview" />);
    const header = screen.getByRole('banner');
    expect(header.textContent).toBe('Dreadnought');
    expect(within(header).getByRole('heading', { name: 'Dreadnought', level: 4 })).toBeTruthy();
    expect(within(header).getByRole('link').getAttribute('href')).toBe('/');
    expect(screen.getByRole('contentinfo').textContent?.toLowerCase()).toBe('dreadnought');
  });
  it('documents BarChart API and keeps full data when a legend series is hidden', () => {
    render(<DocsPage section="barchart" />);
    expect(document.getElementById('barchart-api')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'BarChart' }).getAttribute('href')).toBe('/components/barchart/');
    expect(screen.getByRole('rowheader', { name: 'orientation' })).toBeTruthy();
    const button = screen.getByRole('button', { name: 'Вариант A' });
    fireEvent.click(button); expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('table', { name: 'Сравнение по месяцам: Данные' }).textContent).toContain('85');
  });
  it('documents LineChart layers, navigation and real legend interaction', () => {
    render(<DocsPage section="linechart" />);
    expect(document.getElementById('linechart-api')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'LineChart' }).getAttribute('href')).toBe('/components/linechart/');
    const button = screen.getByRole('button', { name: 'Вариант A' });
    fireEvent.click(button); expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('table', { name: 'Измерения: Данные' })).toBeTruthy();
  });
  it('documents independent Tooltip with a working focus example', () => {
    render(<DocsPage section="tooltip" />);
    expect(document.getElementById('tooltip-api')).toBeTruthy();
    const target = screen.getByRole('button', { name: 'Настройки' });
    fireEvent.focus(target);
    expect(screen.getByRole('tooltip').textContent).toBe('Открывает настройки приложения');
    fireEvent.keyDown(target, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
  it('documents ready Radar and its lower layers with real selection and API', () => {
    render(<DocsPage section="radarchart" />);
    expect(document.getElementById('radarchart-api')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'RadarChart' }).getAttribute('href')).toBe('/components/radarchart/');
    const button = screen.getByRole('button', { name: 'Вариант A' });
    fireEvent.click(button); expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('table', { name: 'Сравнение вариантов: Данные' })).toBeTruthy();
    expect(screen.getByText('Готовый компонент')).toBeTruthy();
  });
  it('documents a custom disclosure with a working example and anchor', () => {
    render(<DocsPage section="custom-components" />);
    expect(screen.getByRole('heading', { name: 'Своя раскрывающаяся секция' }).id).toBe('core-disclosure');
    const trigger = screen.getByRole('button', { name: 'Дополнительные настройки' });
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('textbox', { name: 'Примечание' })).toBeTruthy();
  });
  it('documents Toolbar composition, its API anchor and the Controls navigation link', () => {
    render(<DocsPage section="toolbar" />);
    expect(screen.getByRole('toolbar', { name: 'Действия документа' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Фильтры документа' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Toolbar' }).getAttribute('href')).toBe('/components/toolbar/');
    expect(document.getElementById('toolbar-api')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(screen.getByText('Действие: save')).toBeTruthy();
  });
  it('builds a custom choice control from core without a ready component', () => {
    render(<DocsPage section="custom-components" />);
    const first = screen.getByRole('button', { name: 'Новости' });
    fireEvent.click(first);
    expect(first.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(first);
    expect(first.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('button', { name: 'Архив' }).hasAttribute('disabled')).toBe(true);
  });
  it('documents choice fields with interactive examples', () => {
    const { rerender } = render(<DocsPage section="checkbox" />);
    const checkbox = screen.getByRole('checkbox', { name: 'Получать уведомления' }) as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
    rerender(<DocsPage section="radio" />);
    fireEvent.click(screen.getByRole('radio', { name: 'Про' }));
    expect(screen.getByText('Выбран тариф: pro')).toBeTruthy();
    rerender(<DocsPage section="select" />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Исполнитель' }));
    fireEvent.click(screen.getByRole('option', { name: 'Вера' }));
    expect(screen.getByText('Исполнитель: vera')).toBeTruthy();
  });
  it('documents the shared Menu and runs its actions', () => {
    render(<DocsPage section="menu" />);
    expect(screen.getByRole('menu', { name: 'Действия примера' })).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Копировать' }));
    expect(screen.getByText('Действие: copy')).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Удалить' }).hasAttribute('disabled')).toBe(true);
  });

  it('groups component links by family and opens the current family', () => {
    render(<DocsPage section="table" />);

    const dataDisplay = screen.getByRole('button', { name: 'DataDisplay' });
    const controls = screen.getByRole('button', { name: 'Controls' });
    expect(dataDisplay.getAttribute('aria-expanded')).toBe('true');
    expect(controls.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('link', { name: 'Table' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(controls);
    expect(controls.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('link', { name: 'Button' })).toBeTruthy();
    expect(dataDisplay.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(controls);
    expect(screen.queryByRole('link', { name: 'Button' })).toBeNull();
  });

  it('searches page content and API properties without losing the regular navigation', () => {
    render(<DocsPage section="overview" />);
    const search = screen.getByRole('searchbox', { name: 'Поиск по документации' });

    fireEvent.change(search, { target: { value: 'sticky' } });
    expect(screen.getByRole('link', { name: /Table/ }).getAttribute('href')).toBe('/components/table/#table-api');
    expect(screen.queryByRole('navigation', { name: 'Страницы документации' })).toBeNull();

    fireEvent.change(search, { target: { value: 'несуществующийраздел' } });
    expect(screen.getByText('Ничего не найдено')).toBeTruthy();

    fireEvent.change(search, { target: { value: '' } });
    expect(screen.getByRole('navigation', { name: 'Страницы документации' })).toBeTruthy();
  });

  it('offers a real route from the overview to Button', () => {
    render(<DocsPage section="overview" />);

    expect(screen.getByRole('heading', { name: 'Начните с готового компонента' })).toBeTruthy();
    expect(screen.queryByText('БИБЛИОТЕКА КОМПОНЕНТОВ')).toBeNull();
    expect(screen.queryByText('v0.1')).toBeNull();
    expect(screen.getByRole('link', { name: 'Посмотреть Button' }).getAttribute('href')).toBe('/components/button/');
    expect(screen.getByRole('link', { name: 'Начать работу' }).getAttribute('href')).toBe('/getting-started/');
    expect(screen.getByRole('list', { name: 'Три уровня использования' }).querySelectorAll('[role="listitem"]')).toHaveLength(3);
  });

  it('explains local setup and shows the same Button across three layers', () => {
    const { container } = render(<DocsPage section="getting-started" />);

    expect(screen.getByRole('heading', { name: 'Начало работы', level: 1 })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Начало работы' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('heading', { name: 'Запуск в репозитории' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Одна кнопка — три слоя' })).toBeTruthy();
    const code = [...container.querySelectorAll('pre')].map((element) => element.textContent ?? '');
    expect(code).toHaveLength(4);
    expect(code[0]).toContain('pnpm install');
    expect(code[1]).toContain("@dreadnought/ui/react");
    expect(code[2]).toContain("@dreadnought/react/unstyled");
    expect(code[3]).toContain("@dreadnought/core");
    expect(screen.getByRole('link', { name: 'API Button' }).getAttribute('href')).toBe('/components/button/');
    expect(screen.getByRole('link', { name: 'Настроить тему' }).getAttribute('href')).toBe('/theming/');
  });

  it('explains global, component and instance token scopes with a live Button example', () => {
    const { container } = render(<DocsPage section="theming" />);

    expect(screen.getByRole('heading', { name: 'Тема и токены', level: 1 })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Тема и токены' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('heading', { name: 'Общие токены' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Токены компонента' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Один экземпляр' })).toBeTruthy();
    const code = [...container.querySelectorAll('pre')].map((element) => element.textContent ?? '');
    expect(code.some((value) => value.includes('--dreadnought-spacing-x4'))).toBe(true);
    expect(code.some((value) => value.includes('--dreadnought-button-padding-x'))).toBe(true);
    expect(code.some((value) => value.includes('className={styles.special}'))).toBe(true);
    expect(screen.getByRole('button', { name: 'Одна кнопка' }).getAttribute('class')).toContain('special');
  });

  it('shows how to compose core actions and state into a custom component', async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const { container } = render(<DocsPage section="custom-components" />);

    expect(screen.getByRole('heading', { name: 'Свой компонент из core', level: 1 })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Свой компонент' }).getAttribute('aria-current')).toBe('page');
    const code = [...container.querySelectorAll('pre')].map((element) => element.textContent ?? '');
    expect(code[0]).toContain("import { copy, getButtonState } from '@dreadnought/core'");
    expect(code[1]).toContain('pickFiles');
    fireEvent.click(screen.getByRole('button', { name: 'Скопировать значение' }));
    expect(await screen.findByText('Скопировано: Dreadnought')).toBeTruthy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('Dreadnought');
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
    expect(screen.queryByText('DATA DISPLAY / 01')).toBeNull();
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
    expect(screen.getByText('Полезная подсказка').closest('[role="status"]')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть подсказку' }));
    expect(screen.queryByText('Полезная подсказка')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(screen.getByRole('alert').textContent).toContain('Попыток: 1');
  });

  it('documents Layout with a working collapsible sidebar', () => {
    render(<DocsPage section="layout" />);

    expect(screen.getByRole('link', { name: 'Layout' }).getAttribute('href')).toBe('/components/layout/');
    expect(screen.getByRole('heading', { name: 'Layout', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'direction' })).toBeTruthy();
    const sidebar = screen.getByRole('complementary', { name: 'Пример боковой области' });
    const toggle = sidebar.querySelector('button[aria-expanded]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(sidebar.getAttribute('data-collapsed')).toBe('true');
  });

  it('documents Breadcrumb with linked ancestors and the current page', () => {
    render(<DocsPage section="breadcrumb" />);

    expect(screen.getByRole('link', { name: 'Breadcrumb' }).getAttribute('href')).toBe('/components/breadcrumb/');
    expect(screen.getByRole('heading', { name: 'Breadcrumb', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'items' })).toBeTruthy();
    const trail = screen.getByRole('navigation', { name: 'Пример пути' });
    expect(trail.querySelectorAll('ol > li')).toHaveLength(3);
    expect(trail.querySelector('a[href="/"]')?.textContent).toBe('Главная');
    expect(trail.querySelector('[aria-current="page"]')?.textContent).toBe('Button');
  });

  it('documents every public Icon name and an accessible standalone icon', () => {
    render(<DocsPage section="icon" />);

    expect(screen.getByRole('link', { name: 'Icon' }).getAttribute('href')).toBe('/components/icon/');
    expect(screen.getByRole('heading', { name: 'Icon', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'name' })).toBeTruthy();
    const gallery = screen.getByRole('list', { name: 'Набор иконок' });
    expect(gallery.querySelectorAll('[data-ui="icon"] svg')).toHaveLength(12);
    expect(screen.getByRole('img', { name: 'Успешно' }).querySelector('svg')).toBeTruthy();
  });

  it('documents both Mark shapes and a local color override', () => {
    render(<DocsPage section="mark" />);

    expect(screen.getByRole('link', { name: 'Mark' }).getAttribute('href')).toBe('/components/mark/');
    expect(screen.getByRole('heading', { name: 'Mark', level: 1 })).toBeTruthy();
    expect(screen.getByRole('rowheader', { name: 'shape' })).toBeTruthy();
    const gallery = screen.getByRole('list', { name: 'Формы маркера' });
    expect(gallery.querySelector('[data-shape="circle"]')).toBeTruthy();
    const square = gallery.querySelector('[data-shape="square"]') as HTMLElement;
    expect(square.style.getPropertyValue('--dreadnought-mark-color')).toBe('var(--dreadnought-color-status-success)');
    expect(square.getAttribute('aria-hidden')).toBe('true');
  });
});
