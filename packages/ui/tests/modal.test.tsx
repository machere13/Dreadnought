import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import * as ui from '../src/adapters/react/index.ts';

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

it('provides themed modal composition without losing native attributes or closing behavior', () => {
  expect(ui).toHaveProperty('Modal');
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
