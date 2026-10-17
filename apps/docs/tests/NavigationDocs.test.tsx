import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { tabsDoc } from '../src/content/components/Navigation/Tabs/TabsDoc.tsx';
import { menuDoc } from '../src/content/components/Navigation/Menu/MenuDoc.tsx';

const restorePopoverMethods: (() => void)[] = [];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  for (const restore of restorePopoverMethods.splice(0)) restore();
});

it.each([
  ['Tabs', tabsDoc, 4],
  ['Menu', menuDoc, 3],
] as const)('pairs all %s scenarios with their complete portable source', (_name, doc, count) => {
  expect(doc.examples).toHaveLength(count);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Navigation', doc.title, `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('switches the controlled tab and its panel through the keyboard', async () => {
  const user = userEvent.setup();
  render(tabsDoc.examples![0].demo);
  screen.getByRole('tab', { name: 'Компонент' }).focus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'Адаптер' }).getAttribute('aria-selected')).toBe('true');
  expect(screen.getByRole('tabpanel').textContent).toBe('Разметка и поведение без готовых стилей.');
});

it('uses vertical arrows for the vertical tab list', async () => {
  const user = userEvent.setup();
  render(tabsDoc.examples![1].demo);
  const list = screen.getByRole('tablist', { name: 'Вертикальные разделы' });
  expect(list.getAttribute('aria-orientation')).toBe('vertical');
  screen.getByRole('tab', { name: 'Компонент' }).focus();
  await user.keyboard('{ArrowDown}');
  expect(screen.getByRole('tab', { name: 'Адаптер' }).getAttribute('aria-selected')).toBe('true');
});

it('preserves eager and lazy text but resets unmounted contents', async () => {
  const user = userEvent.setup();
  render(tabsDoc.examples![3].demo);
  await user.type(screen.getByRole('textbox', { name: 'Текст eager' }), 'E');
  await user.click(screen.getByRole('tab', { name: 'lazy' }));
  await user.type(screen.getByRole('textbox', { name: 'Текст lazy' }), 'L');
  await user.click(screen.getByRole('tab', { name: 'unmount' }));
  await user.type(screen.getByRole('textbox', { name: 'Текст unmount' }), 'U');
  await user.click(screen.getByRole('tab', { name: 'eager' }));
  expect(screen.getByRole('textbox', { name: 'Текст eager' })).toHaveProperty('value', 'E');
  await user.click(screen.getByRole('tab', { name: 'lazy' }));
  expect(screen.getByRole('textbox', { name: 'Текст lazy' })).toHaveProperty('value', 'L');
  await user.click(screen.getByRole('tab', { name: 'unmount' }));
  expect(screen.getByRole('textbox', { name: 'Текст unmount' })).toHaveProperty('value', '');
});

it('selects a hidden tab through the overflow menu with constrained layout metrics', async () => {
  const prototype = HTMLElement.prototype;
  for (const [name, method] of Object.entries({
    showPopover(this: HTMLElement) {
      this.setAttribute('data-test-open', '');
    },
    hidePopover(this: HTMLElement) {
      this.removeAttribute('data-test-open');
    },
  })) {
    const previous = Object.getOwnPropertyDescriptor(prototype, name);
    Object.defineProperty(prototype, name, { configurable: true, value: method });
    restorePopoverMethods.push(() => {
      if (previous) Object.defineProperty(prototype, name, previous);
      else Reflect.deleteProperty(prototype, name);
    });
  }
  const matches = prototype.matches;
  vi.spyOn(prototype, 'matches').mockImplementation(function (selector) {
    return selector === ':popover-open'
      ? this.hasAttribute('data-test-open')
      : matches.call(this, selector);
  });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function () {
    return this.getAttribute('data-slot') === 'list' ? 200 : 800;
  });
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function () {
    return this.getAttribute('data-slot') === 'list'
      ? this.querySelectorAll('[role="tab"]').length * 100
      : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    if (this.getAttribute('data-slot') === 'list') return new DOMRect(0, 0, 200, 44);
    if (this.getAttribute('role') === 'tab') {
      const list = this.closest('[role="tablist"]')!;
      const index = [...list.querySelectorAll('[role="tab"]')].indexOf(this);
      return new DOMRect(index * 100 - list.scrollLeft, 0, 100, 44);
    }
    return new DOMRect(0, 0, 44, 44);
  });
  const user = userEvent.setup();
  render(tabsDoc.examples![2].demo);
  await user.click(await screen.findByRole('button', { name: 'Остальные разделы' }));
  const menu = screen.getByRole('menu');
  await user.click(within(menu).getByRole('menuitemradio', { name: 'Вопросы', exact: true }));
  expect(screen.getByRole('tabpanel').textContent).toBe('Раздел: Вопросы');
});

it('reports only leaf actions and leaves disabled actions unavailable', async () => {
  const user = userEvent.setup();
  render(menuDoc.examples![0].demo);
  await user.click(screen.getByRole('menuitem', { name: 'Экспорт', exact: true }));
  expect(screen.getByRole('status').textContent).toBe('Выберите действие');
  await user.click(screen.getByRole('menuitem', { name: 'PDF', exact: true }));
  expect(screen.getByRole('status').textContent).toBe('Действие: pdf');
  expect(screen.getByRole('menuitem', { name: 'Удалить' })).toHaveProperty('disabled', true);
});

it('skips group labels and separators while selecting grouped actions', async () => {
  const user = userEvent.setup();
  render(menuDoc.examples![1].demo);
  expect(screen.getByRole('separator')).toBeTruthy();
  screen.getByRole('menuitemradio', { name: 'Переименовать' }).focus();
  await user.keyboard('{ArrowDown}{Enter}');
  expect(screen.getByRole('status').textContent).toBe('Действие: preferences');
  expect(screen.getByRole('menuitemradio', { name: 'Права доступа' })).toHaveProperty(
    'disabled',
    true,
  );
});

it('renders real anchor destinations and updates the current navigation item', async () => {
  const user = userEvent.setup();
  render(menuDoc.examples![2].demo);
  const link = screen.getByRole('link', { name: 'Использование примера' });
  const href = link.getAttribute('href')!;
  expect(document.getElementById(href.slice(1))).toBeTruthy();
  await user.click(link);
  expect(link.getAttribute('aria-current')).toBe('page');
  expect(
    screen.getByRole('link', { name: 'Описание примера' }).getAttribute('aria-current'),
  ).toBeNull();
});
