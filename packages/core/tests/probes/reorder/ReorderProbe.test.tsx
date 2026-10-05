import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { ReorderProbe } from './ReorderProbe.tsx';

afterEach(cleanup);
const handle = (value: string) => screen.getByRole('button', { name: `Move ${value}` });
const order = () => within(screen.getByRole('list', { name: 'Tasks' })).getAllByRole('button').map(node => node.textContent);
const status = () => screen.getByRole('status').textContent;
const dataTransfer = () => ({ effectAllowed: 'uninitialized', dropEffect: 'none', setData(_type: string, _value: string) {} });

it('selects a keyboard destination without mutating order, then commits on Enter', async () => {
  render(<ReorderProbe />);
  handle('Alpha').focus();
  await userEvent.keyboard(' {ArrowDown}{ArrowDown}');
  expect(status()).toBe('Moving Alpha: position 3 of 3.');
  expect(order()).toEqual(['Move Alpha', 'Move Beta', 'Move Gamma']);
  await userEvent.keyboard('{Enter}');
  expect(order()).toEqual(['Move Beta', 'Move Gamma', 'Move Alpha']);
  expect(status()).toBe('Moved Alpha to position 3 of 3.');
  expect(document.activeElement).toBe(handle('Alpha'));
});

it('cancels a keyboard move with Escape without losing focus', async () => {
  render(<ReorderProbe />);
  handle('Beta').focus();
  await userEvent.keyboard('{Enter}{ArrowUp}{Escape}');
  expect(order()).toEqual(['Move Alpha', 'Move Beta', 'Move Gamma']);
  expect(status()).toBe('Cancelled move of Beta.');
  expect(document.activeElement).toBe(handle('Beta'));
});

it('supports both directions, Home/End and bounds without wrapping', async () => {
  render(<ReorderProbe />);
  handle('Gamma').focus();
  await userEvent.keyboard('{Enter}{ArrowDown}');
  expect(status()).toBe('Moving Gamma: position 3 of 3.');
  await userEvent.keyboard('{Home}{ArrowUp}');
  expect(status()).toBe('Moving Gamma: position 1 of 3.');
  await userEvent.keyboard(' ');
  expect(order()).toEqual(['Move Gamma', 'Move Alpha', 'Move Beta']);
  await userEvent.keyboard('{Enter}{End}{ArrowUp}{Enter}');
  expect(order()).toEqual(['Move Alpha', 'Move Gamma', 'Move Beta']);
});

it('commits a native drag drop using the drop target, not stale hover state', () => {
  render(<ReorderProbe />);
  const transfer = dataTransfer();
  fireEvent.dragStart(handle('Alpha'), { dataTransfer: transfer });
  fireEvent.dragOver(handle('Beta'), { dataTransfer: transfer });
  expect(order()).toEqual(['Move Alpha', 'Move Beta', 'Move Gamma']);
  fireEvent.drop(handle('Gamma'), { dataTransfer: transfer });
  fireEvent.dragEnd(handle('Alpha'), { dataTransfer: transfer });
  expect(order()).toEqual(['Move Beta', 'Move Gamma', 'Move Alpha']);
  expect(document.activeElement).toBe(handle('Alpha'));
  expect(status()).toBe('Moved Alpha to position 3 of 3.');
});

it('cancels a pointer session when dragend arrives without drop', () => {
  render(<ReorderProbe />);
  const transfer = dataTransfer();
  fireEvent.dragStart(handle('Alpha'), { dataTransfer: transfer });
  fireEvent.dragOver(handle('Gamma'), { dataTransfer: transfer });
  fireEvent.dragEnd(handle('Alpha'), { dataTransfer: transfer });
  expect(order()).toEqual(['Move Alpha', 'Move Beta', 'Move Gamma']);
  expect(status()).toBe('Cancelled move of Alpha.');
  expect(document.activeElement).toBe(handle('Alpha'));
});

it('does not accept external drops or a drop during keyboard movement', async () => {
  render(<ReorderProbe />);
  const transfer = dataTransfer();
  expect(fireEvent.dragOver(handle('Gamma'), { dataTransfer: transfer })).toBe(true);
  fireEvent.drop(handle('Gamma'), { dataTransfer: transfer });
  expect(order()).toEqual(['Move Alpha', 'Move Beta', 'Move Gamma']);
  handle('Alpha').focus();
  await userEvent.keyboard('{Enter}{ArrowDown}');
  fireEvent.drop(handle('Gamma'), { dataTransfer: transfer });
  expect(status()).toBe('Moving Alpha: position 2 of 3.');
  await userEvent.keyboard('{Enter}');
  expect(order()).toEqual(['Move Beta', 'Move Alpha', 'Move Gamma']);
});

it('lets Tab leave while cancelling an unfinished keyboard move', async () => {
  render(<><ReorderProbe /><button type="button">Outside</button></>);
  handle('Gamma').focus();
  await userEvent.keyboard('{Enter}{Home}');
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
  expect(order()).toEqual(['Move Alpha', 'Move Beta', 'Move Gamma']);
  expect(status()).toBe('Cancelled move of Gamma.');
});

it('respects cancelled, composing and modified keyboard events', () => {
  const { rerender } = render(<div onKeyDownCapture={event => event.preventDefault()}><ReorderProbe /></div>);
  fireEvent.keyDown(handle('Alpha'), { key: 'Enter' });
  expect(status()).toBe('Ready');
  rerender(<div><ReorderProbe /></div>);
  for (const flags of [{ isComposing: true }, { shiftKey: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }]) {
    expect(fireEvent.keyDown(handle('Alpha'), { key: 'Enter', ...flags })).toBe(true);
  }
  expect(status()).toBe('Ready');
});

it('allows held arrows but ignores repeated activation so it cannot commit accidentally', async () => {
  render(<ReorderProbe />);
  handle('Alpha').focus();
  await userEvent.keyboard('{Enter}');
  fireEvent.keyDown(handle('Alpha'), { key: 'Enter', repeat: true });
  expect(status()).toBe('Moving Alpha: position 1 of 3.');
  fireEvent.keyDown(handle('Alpha'), { key: 'ArrowDown', repeat: true });
  expect(status()).toBe('Moving Alpha: position 2 of 3.');
  await userEvent.keyboard('{Enter}');
  expect(order()).toEqual(['Move Beta', 'Move Alpha', 'Move Gamma']);
});

it('blocks disabled interaction and cancels a move when disabled mid-session', async () => {
  const { rerender } = render(<ReorderProbe />);
  handle('Alpha').focus();
  await userEvent.keyboard('{Enter}{End}');
  rerender(<ReorderProbe disabled />);
  fireEvent.keyDown(handle('Alpha'), { key: 'Enter' });
  fireEvent.dragStart(handle('Alpha'), { dataTransfer: dataTransfer() });
  fireEvent.drop(handle('Gamma'), { dataTransfer: dataTransfer() });
  expect(order()).toEqual(['Move Alpha', 'Move Beta', 'Move Gamma']);
  expect(handle('Alpha').hasAttribute('disabled')).toBe(true);
  expect(handle('Alpha').draggable).toBe(false);
  expect(status()).toBe('Cancelled move of Alpha.');
});
