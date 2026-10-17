import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { modalDoc } from '../src/content/components/Overlays/Modal/ModalDoc.tsx';
import { drawerDoc } from '../src/content/components/Overlays/Drawer/DrawerDoc.tsx';

const showModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');

beforeEach(() => {
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
});

afterEach(() => {
  cleanup();
  if (showModal) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', showModal);
  else delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
  if (close) Object.defineProperty(HTMLDialogElement.prototype, 'close', close);
  else delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
});

it('opens Modal externally and closes only through its explicit action', () => {
  expect(modalDoc.examples).toHaveLength(3);
  render(modalDoc.examples![1].demo);
  fireEvent.click(screen.getByRole('button', { name: 'Открыть окно извне' }));
  const dialog = screen.getByRole('dialog', { name: 'Управляемое окно' });
  expect(within(dialog).queryByRole('button', { name: 'Закрыть окно' })).toBeNull();
  fireEvent(dialog, new Event('cancel', { cancelable: true }));
  expect(screen.getByRole('dialog')).toBe(dialog);
  expect(screen.getByRole('status').textContent).toBe('Окно открыто');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Завершить' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('status').textContent).toBe('Окно закрыто');
});

it.each([
  ['eager', true, true],
  ['lazy', false, true],
  ['unmount', false, false],
] as const)(
  'demonstrates the %s content lifetime through actual input edits',
  (policy, initial, retained) => {
    expect(modalDoc.examples).toHaveLength(3);
    render(modalDoc.examples![2].demo);
    const label = `Черновик ${policy}`;
    expect(Boolean(screen.queryByLabelText(label))).toBe(initial);
    const trigger = screen.getByRole('button', { name: `Открыть ${policy}` });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.change(screen.getByRole('textbox', { name: label }), {
      target: { value: 'Мой черновик' },
    });
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Закрыть пример' }),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(Boolean(screen.queryByLabelText(label))).toBe(retained);
    fireEvent.click(trigger);
    expect(screen.getByRole('textbox', { name: label })).toHaveProperty(
      'value',
      retained ? 'Мой черновик' : '',
    );
  },
);

it('opens and explicitly closes each of the four Drawer placement examples', () => {
  expect(drawerDoc.examples).toHaveLength(3);
  render(drawerDoc.examples![1].demo);
  for (const label of ['Справа', 'Слева', 'Сверху', 'Снизу']) {
    const trigger = screen.getByRole('button', { name: label });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: `Панель: ${label}` });
    expect(within(dialog).getByRole('heading', { name: label })).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Закрыть панель' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  }
});

it('accepts external opening and native cancellation in controlled Drawer', () => {
  expect(drawerDoc.examples).toHaveLength(3);
  render(drawerDoc.examples![2].demo);
  fireEvent.click(screen.getByRole('button', { name: 'Открыть Drawer извне' }));
  expect(screen.getByRole('status').textContent).toBe('Панель открыта');
  fireEvent(
    screen.getByRole('dialog', { name: 'Управляемая панель Drawer' }),
    new Event('cancel', { cancelable: true }),
  );
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('status').textContent).toBe('Панель закрыта');
});
