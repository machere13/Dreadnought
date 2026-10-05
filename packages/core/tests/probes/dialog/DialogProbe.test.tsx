import { StrictMode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { DialogProbe } from './DialogProbe.tsx';

beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: { configurable: true, value() { this.open = true; } },
    close: { configurable: true, value() { this.open = false; this.dispatchEvent(new Event('close')); } },
  });
});
afterEach(() => {
  cleanup();
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
});
const trigger = () => screen.getByRole('button', { name: 'Open dialog' });
const dialog = () => screen.getByRole('dialog', { name: 'Edit profile' }) as HTMLDialogElement;
const name = () => screen.getByRole('textbox', { name: 'Name' });
const close = () => screen.getByRole('button', { name: 'Close' });

it('opens with an accessible name and focuses the initial field', async () => {
  render(<DialogProbe />);
  expect(screen.queryByRole('dialog')).toBeNull();
  await userEvent.click(trigger());
  expect(dialog().open).toBe(true);
  expect(document.activeElement).toBe(name());
});

it('loops Tab in both directions and keeps normal interior tab order', async () => {
  render(<DialogProbe />);
  await userEvent.click(trigger());
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Save' }));
  await userEvent.tab();
  expect(document.activeElement).toBe(close());
  await userEvent.tab();
  expect(document.activeElement).toBe(name());
  await userEvent.tab({ shift: true });
  expect(document.activeElement).toBe(close());
});

it('skips a disabled action in the focus sequence', async () => {
  render(<DialogProbe saveDisabled />);
  await userEvent.click(trigger());
  await userEvent.tab();
  expect(document.activeElement).toBe(close());
  await userEvent.tab();
  expect(document.activeElement).toBe(name());
});

it('does not intercept cancelled, composing or modified Tab events', async () => {
  const { rerender } = render(<div onKeyDownCapture={event => event.preventDefault()}><DialogProbe /></div>);
  await userEvent.click(trigger());
  close().focus();
  fireEvent.keyDown(close(), { key: 'Tab' });
  expect(document.activeElement).toBe(close());
  rerender(<div><DialogProbe /></div>);
  for (const flags of [{ isComposing: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }]) {
    expect(fireEvent.keyDown(close(), { key: 'Tab', ...flags })).toBe(true);
    expect(document.activeElement).toBe(close());
  }
});

it('closes via Save without submitting a surrounding form', async () => {
  let submissions = 0;
  render(<form onSubmit={event => { event.preventDefault(); submissions++; }}><DialogProbe /></form>);
  await userEvent.click(trigger());
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger());
  expect(submissions).toBe(0);
});

it('closes on a native cancel request and restores the opener', async () => {
  render(<DialogProbe />);
  await userEvent.click(trigger());
  fireEvent(dialog(), new Event('cancel', { cancelable: true }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger());
});

it('honors cancellation of a close request', async () => {
  render(<DialogProbe preventCancel />);
  await userEvent.click(trigger());
  fireEvent(dialog(), new Event('cancel', { cancelable: true }));
  expect(dialog().open).toBe(true);
  expect(document.activeElement).toBe(name());
});

it('supports repeated open/close and ignores a stale close event while open', async () => {
  render(<StrictMode><DialogProbe /></StrictMode>);
  for (let cycle = 0; cycle < 2; cycle++) {
    await userEvent.click(trigger());
    fireEvent(dialog(), new Event('close'));
    expect(dialog().open).toBe(true);
    await userEvent.click(close());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  }
});

it('synchronizes an external native close with React state', async () => {
  render(<DialogProbe />);
  await userEvent.click(trigger());
  fireEvent(dialog(), new Event('cancel', { cancelable: true }));
  await userEvent.click(trigger());
  const node = dialog();
  node.open = false;
  fireEvent(node, new Event('close'));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger());
  await userEvent.click(trigger());
  expect(document.activeElement).toBe(name());
});
