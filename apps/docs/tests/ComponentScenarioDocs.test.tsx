import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { treeDoc } from '../src/content/components/Navigation/TreeDoc.tsx';
import { radioDoc } from '../src/content/components/Fields/RadioDoc.tsx';
import { toastDoc } from '../src/content/components/Feedback/ToastDoc.tsx';
import { modalDoc } from '../src/content/components/Overlays/ModalDoc.tsx';
import { drawerDoc } from '../src/content/components/Overlays/DrawerDoc.tsx';
import { TreeSelectionDemo } from '../src/content/components/Navigation/TreeSelectionDemo.tsx';
import { TreeCheckDemo } from '../src/content/components/Navigation/TreeCheckDemo.tsx';
import { RadioGroupDemo } from '../src/content/components/Fields/RadioGroupDemo.tsx';
import { RadioStandaloneDemo } from '../src/content/components/Fields/RadioStandaloneDemo.tsx';
import { ToastBasicDemo } from '../src/content/components/Feedback/ToastBasicDemo.tsx';
import { ToastQueueDemo } from '../src/content/components/Feedback/ToastQueueDemo.tsx';
import { ModalProfileDemo } from '../src/content/components/Overlays/ModalProfileDemo.tsx';
import { DrawerProfileDemo } from '../src/content/components/Overlays/DrawerProfileDemo.tsx';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it.each([
  ['Tree', treeDoc, 'Navigation', 2],
  ['Radio', radioDoc, 'Fields', 2],
  ['Toast', toastDoc, 'Feedback', 2],
  ['Modal', modalDoc, 'Overlays', 1],
  ['Drawer', drawerDoc, 'Overlays', 1],
] as const)(
  'pairs every %s scenario with its exact portable source',
  (_title, doc, folder, count) => {
    expect(doc.examples).toHaveLength(count);
    for (const example of doc.examples!) {
      const name = (example.demo as { type: { name: string } }).type.name;
      expect(example.code).toBe(
        readFileSync(resolve('apps/docs/src/content/components', folder, `${name}.tsx`), 'utf8'),
      );
      expect(example.code).not.toMatch(/from ['"]\./);
      expect(example.description).toBeTruthy();
    }
  },
);

it('shows the selected tree label separately from expansion', () => {
  render(<TreeSelectionDemo />);
  const node = screen.getByRole('treeitem', { name: 'Компоненты' });
  fireEvent.keyDown(node, { key: 'ArrowRight' });
  expect(screen.getByRole('treeitem', { name: 'Button' })).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('не выбран');
  fireEvent.keyDown(screen.getByRole('treeitem', { name: 'Button' }), { key: 'Enter' });
  expect(screen.getByRole('status').textContent).toContain('Button');
});

it('switches between linked and independent tree checks', () => {
  render(<TreeCheckDemo />);
  const node = screen.getByRole('treeitem', { name: 'Документация' });
  fireEvent.keyDown(node, { key: ' ' });
  expect(screen.getByRole('status').textContent).toContain('Button');
  fireEvent.keyDown(node, { key: ' ' });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Независимые отметки' }));
  fireEvent.keyDown(node, { key: ' ' });
  expect(screen.getByRole('status').textContent).toBe('Отмечены: Документация');
});

it('updates the group tariff and preserves its disabled option', () => {
  render(<RadioGroupDemo />);
  fireEvent.click(screen.getByRole('radio', { name: 'Про' }));
  expect(screen.getByRole('status').textContent).toBe('Выбран тариф: Про');
  expect(screen.getByRole('radio', { name: 'Корпоративный' })).toHaveProperty('disabled', true);
});

it('keeps standalone radios mutually exclusive', () => {
  render(<RadioStandaloneDemo />);
  fireEvent.click(screen.getByRole('radio', { name: 'Раз в неделю' }));
  expect(screen.getByRole('radio', { name: 'Ежедневно' })).toHaveProperty('checked', false);
  expect(screen.getByRole('status').textContent).toBe('Уведомления: Раз в неделю');
});

it('opens, times out and reopens a single notification', () => {
  vi.useFakeTimers();
  render(<ToastBasicDemo />);
  expect(screen.queryByRole('status')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Показать уведомление' }));
  expect(screen.getByRole('status').textContent).toContain('Изменения сохранены');
  act(() => vi.advanceTimersByTime(3000));
  expect(screen.queryByRole('status')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Показать уведомление' }));
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть уведомление' }));
  expect(screen.queryByRole('status')).toBeNull();
});

it('limits the queue, updates an item in place and clears it', () => {
  vi.useFakeTimers();
  render(<ToastQueueDemo />);
  for (let i = 0; i < 4; i++)
    fireEvent.click(screen.getByRole('button', { name: 'Добавить в очередь' }));
  const viewport = screen.getByRole('region', { name: 'Очередь сохранения' });
  expect(within(viewport).getAllByRole('status')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть все' }));
  fireEvent.click(screen.getByRole('button', { name: 'Начать сохранение' }));
  const toast = screen.getByRole('status');
  act(() => vi.advanceTimersByTime(5000));
  expect(toast.textContent).toContain('Сохраняем');
  fireEvent.click(screen.getByRole('button', { name: 'Завершить сохранение' }));
  expect(screen.getByRole('status')).toBe(toast);
  expect(toast.textContent).toContain('Сохранено');
  act(() => vi.advanceTimersByTime(3000));
  expect(screen.queryByRole('status')).toBeNull();
});

it.each([
  ['Modal', ModalProfileDemo, 'Редактировать профиль'],
  ['Drawer', DrawerProfileDemo, 'Настроить профиль'],
] as const)(
  'saves %s outside the dialog and discards cancelled edits',
  (_name, Demo, triggerName) => {
    const show = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
    const close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value() {
          this.open = true;
        },
      },
      close: {
        configurable: true,
        value() {
          this.open = false;
          this.dispatchEvent(new Event('close'));
        },
      },
    });
    try {
      render(<Demo />);
      const trigger = screen.getByRole('button', { name: triggerName });
      fireEvent.click(trigger);
      fireEvent.change(screen.getByRole('textbox', { name: 'Имя профиля' }), {
        target: { value: 'Ada' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Сохранить профиль' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByRole('status').textContent).toBe('Сохранённое имя: Ada');
      fireEvent.click(trigger);
      expect(screen.getByRole('textbox', { name: 'Имя профиля' })).toHaveProperty('value', 'Ada');
      fireEvent.change(screen.getByRole('textbox', { name: 'Имя профиля' }), {
        target: { value: 'Draft' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
      fireEvent.click(trigger);
      expect(screen.getByRole('textbox', { name: 'Имя профиля' })).toHaveProperty('value', 'Ada');
      fireEvent.change(screen.getByRole('textbox', { name: 'Имя профиля' }), {
        target: { value: 'Another draft' },
      });
      fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
      fireEvent.click(trigger);
      expect(screen.getByRole('textbox', { name: 'Имя профиля' })).toHaveProperty('value', 'Ada');
    } finally {
      cleanup();
      if (show) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', show);
      else delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
      if (close) Object.defineProperty(HTMLDialogElement.prototype, 'close', close);
      else delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
    }
  },
);
