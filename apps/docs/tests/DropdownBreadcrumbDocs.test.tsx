import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { dropdownDoc } from '../src/content/components/Navigation/DropdownDoc.tsx';
import { breadcrumbDoc } from '../src/content/components/Navigation/BreadcrumbDoc.tsx';
import { DropdownActionsDemo } from '../src/content/components/Navigation/DropdownActionsDemo.tsx';
import { DropdownControlledDemo } from '../src/content/components/Navigation/DropdownControlledDemo.tsx';
import { DropdownPlacementDemo } from '../src/content/components/Navigation/DropdownPlacementDemo.tsx';
import { BreadcrumbBasicDemo } from '../src/content/components/Navigation/BreadcrumbBasicDemo.tsx';
import { BreadcrumbAnchorsDemo } from '../src/content/components/Navigation/BreadcrumbAnchorsDemo.tsx';

afterEach(cleanup);

it.each([
  ['Dropdown', dropdownDoc, 3],
  ['Breadcrumb', breadcrumbDoc, 2],
] as const)('pairs each %s example with its complete portable source', (_name, doc, count) => {
  expect(doc.examples).toHaveLength(count);
  for (const example of doc.examples!) {
    const name = (example.demo as { type: { name: string } }).type.name;
    expect(example.code).toBe(
      readFileSync(resolve('apps/docs/src/content/components/Navigation', `${name}.tsx`), 'utf8'),
    );
    expect(example.code).not.toMatch(/from ['"]\./);
  }
});

it('runs a file action, closes the menu and restores trigger focus', async () => {
  const user = userEvent.setup();
  render(<DropdownActionsDemo />);
  const trigger = screen.getByRole('button', { name: 'Действия с файлом' });
  await user.click(trigger);
  expect(screen.getByRole('menuitem', { name: 'Удалить' }).getAttribute('aria-disabled')).toBe(
    'true',
  );
  await user.click(screen.getByRole('menuitem', { name: 'Скачать' }));
  expect(screen.getByRole('status').textContent).toBe('Выбрано: Скачать');
  expect(screen.queryByRole('menu')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('opens from the last enabled item with ArrowUp and closes with Escape', async () => {
  const user = userEvent.setup();
  render(<DropdownActionsDemo />);
  const trigger = screen.getByRole('button', { name: 'Действия с файлом' });
  trigger.focus();
  await user.keyboard('{ArrowUp}');
  expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Скачать' }));
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('menu')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('accepts external opening and keeps the selected format after closing', async () => {
  const user = userEvent.setup();
  render(<DropdownControlledDemo />);
  await user.click(screen.getByRole('button', { name: 'Открыть извне' }));
  expect(screen.getByRole('menuitemradio', { name: 'PDF' }).getAttribute('aria-checked')).toBe(
    'true',
  );
  await user.click(screen.getByRole('menuitemradio', { name: 'CSV' }));
  expect(screen.getByRole('status').textContent).toBe('Формат: CSV. Меню закрыто.');
  await user.click(screen.getByRole('button', { name: 'Формат экспорта' }));
  expect(screen.getByRole('menuitemradio', { name: 'CSV' }).getAttribute('aria-checked')).toBe(
    'true',
  );
});

it('connects both placement examples to their respective actions', async () => {
  const user = userEvent.setup();
  render(<DropdownPlacementDemo />);
  for (const label of ['Сверху справа', 'Снизу слева']) {
    await user.click(screen.getByRole('button', { name: label }));
    await user.click(screen.getByRole('menuitem', { name: 'Подтвердить' }));
    expect(screen.getByRole('status').textContent).toBe(`Подтверждено: ${label}`);
  }
});

it('distinguishes linked ancestors, plain text and the current page', () => {
  render(<BreadcrumbBasicDemo />);
  const trail = screen.getByRole('navigation', { name: 'Пример пути' });
  expect(within(trail).getByRole('link', { name: 'Главная' }).getAttribute('href')).toBe('/');
  expect(within(trail).queryByRole('link', { name: 'Компоненты' })).toBeNull();
  expect(trail.querySelector('[aria-current="page"]')?.textContent).toBe('Button');
});

it('provides real unique destinations for each ancestor link', () => {
  render(
    <>
      <BreadcrumbAnchorsDemo />
      <BreadcrumbAnchorsDemo />
    </>,
  );
  const destinations = new Set<string>();
  for (const trail of screen.getAllByRole('navigation', { name: 'Путь по разделам примера' })) {
    for (const link of within(trail).getAllByRole('link')) {
      const id = link.getAttribute('href')!.slice(1);
      expect(document.getElementById(id)?.querySelector('h4')?.textContent).toBe(link.textContent);
      expect(destinations.has(id)).toBe(false);
      destinations.add(id);
    }
    expect(trail.querySelector('[aria-current="page"]')?.textContent).toBe('Текущий пример');
  }
});
