import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it } from 'vitest';
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
