import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Modal } from '../src/adapters/react/components/Overlays/Modal/Modal.tsx';
import { Button } from '../src/adapters/react/components/Controls/Button/Button.tsx';
import { Input } from '../src/adapters/react/components/Fields/Input/Input.tsx';

const ui = { Modal, Button, Input };

it('applies unmount to the modal header, body and footer together', () => {
  let footerCalls = 0;
  render(
    <ui.Modal
      mountPolicy="unmount"
      title="Draft"
      content={<ui.Input aria-label="Draft text" />}
      footer={({ close }) => {
        footerCalls++;
        return <ui.Button onClick={close}>Done</ui.Button>;
      }}
    >
      {(trigger) => <ui.Button {...trigger}>Edit draft</ui.Button>}
    </ui.Modal>,
  );
  expect(screen.queryByText('Draft')).toBeNull();
  expect(footerCalls).toBe(0);
  const trigger = screen.getByRole('button', { name: 'Edit draft' });
  fireEvent.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Draft' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Draft text'), { target: { value: 'Saved' } });
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(screen.queryByText('Draft')).toBeNull();
  expect(screen.queryByLabelText('Draft text')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Done' })).toBeNull();
  fireEvent.click(trigger);
  expect((screen.getByLabelText('Draft text') as HTMLInputElement).value).toBe('');
});

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

it('closes with the built-in button and restores focus to the opener', () => {
  render(
    <ui.Modal aria-label="Profile" content="Profile contents">
      {(trigger) => <ui.Button {...trigger}>Edit</ui.Button>}
    </ui.Modal>,
  );
  const opener = screen.getByRole('button', { name: 'Edit' });
  opener.focus();
  fireEvent.click(opener);
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть окно' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
});

it('allows hiding the close button without losing content', () => {
  render(
    <ui.Modal defaultOpen closable={false} aria-label="Profile" content="Profile contents">
      {(trigger) => <ui.Button {...trigger}>Edit</ui.Button>}
    </ui.Modal>,
  );
  expect(screen.queryByRole('button', { name: 'Закрыть окно' })).toBeNull();
  expect(screen.getByRole('dialog').textContent).toBe('Profile contents');
});

it('customizes the close icon and requests controlled closing without forcing it', () => {
  const onOpenChange = vi.fn();
  const view = render(
    <ui.Modal
      open
      onOpenChange={onOpenChange}
      aria-label="Profile"
      closeLabel="Dismiss profile"
      closeIcon={<span>×</span>}
      content="Profile contents"
    >
      {(trigger) => <ui.Button {...trigger}>Edit</ui.Button>}
    </ui.Modal>,
  );
  const close = screen.getByRole('button', { name: 'Dismiss profile' });
  expect(close.textContent).toBe('×');
  expect(screen.getByRole('dialog').hasAttribute('closeLabel')).toBe(false);
  expect(screen.getByRole('dialog').hasAttribute('closeIcon')).toBe(false);
  close.focus();
  fireEvent.keyDown(close, { key: 'Tab' });
  expect(document.activeElement).toBe(close);
  fireEvent.click(close);
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(screen.getByRole('dialog')).not.toBeNull();
  view.rerender(
    <ui.Modal open={false} aria-label="Profile" content="Profile contents">
      {(trigger) => <ui.Button {...trigger}>Edit</ui.Button>}
    </ui.Modal>,
  );
  expect(screen.queryByRole('dialog')).toBeNull();
});
afterEach(() => {
  cleanup();
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
});

it('uses the title as its accessible name and keeps title and close in one header', () => {
  render(
    <ui.Modal defaultOpen title="Профиль" content={<ui.Input aria-label="Имя" />}>
      {(trigger) => <ui.Button {...trigger}>Edit</ui.Button>}
    </ui.Modal>,
  );
  const dialog = screen.getByRole('dialog', { name: 'Профиль' });
  const title = screen.getByRole('heading', { name: 'Профиль' });
  const header = title.closest('[data-slot="header"]');
  expect(header).not.toBeNull();
  expect(header?.contains(screen.getByRole('button', { name: 'Закрыть окно' }))).toBe(true);
  expect(dialog.hasAttribute('title')).toBe(false);
  expect(screen.getByRole('textbox').closest('[data-slot="body"]')).not.toBeNull();
});

it('renders footer actions outside the body and closes through the existing controls', () => {
  render(
    <ui.Modal
      defaultOpen
      title="Профиль"
      aria-label="Редактирование профиля"
      content={<ui.Input aria-label="Имя" />}
      footer={({ close }) => <ui.Button onClick={close}>Сохранить</ui.Button>}
    >
      {(trigger) => <ui.Button {...trigger}>Edit</ui.Button>}
    </ui.Modal>,
  );
  const dialog = screen.getByRole('dialog', { name: 'Редактирование профиля' });
  const save = screen.getByRole('button', { name: 'Сохранить' });
  expect(save.closest('[data-slot="footer"]')).not.toBeNull();
  expect(save.closest('[data-slot="body"]')).toBeNull();
  expect(dialog.hasAttribute('footer')).toBe(false);
  fireEvent.click(save);
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('does not reserve empty header and footer slots when they are omitted', () => {
  render(
    <ui.Modal defaultOpen closable={false} content="Contents">
      {(trigger) => <ui.Button {...trigger}>Edit</ui.Button>}
    </ui.Modal>,
  );
  const dialog = screen.getByRole('dialog');
  expect(dialog.querySelector('[data-slot="header"]')).toBeNull();
  expect(dialog.querySelector('[data-slot="footer"]')).toBeNull();
});

it('provides themed modal composition without losing native attributes or closing behavior', () => {
  render(
    <ui.Modal
      aria-label="Profile"
      className="custom"
      data-testid="profile"
      content={({ close }) => (
        <>
          <ui.Input aria-label="Name" />
          <ui.Button onClick={close}>Done</ui.Button>
        </>
      )}
    >
      {(trigger) => <ui.Button {...trigger}>Edit</ui.Button>}
    </ui.Modal>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  const node = screen.getByRole('dialog', { name: 'Profile' });
  expect(node.className.split(' ')).toHaveLength(2);
  expect(node.className).toContain('custom');
  expect(node.getAttribute('data-testid')).toBe('profile');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } });
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Alice');
  fireEvent.click(screen.getByRole('button', { name: 'Done' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});
