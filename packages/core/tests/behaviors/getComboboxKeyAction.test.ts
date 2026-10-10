import { expect, it } from 'vitest';
import { getComboboxKeyAction } from '../../src/behaviors/getComboboxKeyAction.ts';

it.each([true, false])('removes on Backspace only when permitted, open=%s', (open) => {
  expect(getComboboxKeyAction('Backspace', { open })).toBeUndefined();
  expect(getComboboxKeyAction('Backspace', { open, removeOnBackspace: false })).toBeUndefined();
  expect(getComboboxKeyAction('Backspace', { open, removeOnBackspace: true })).toEqual({
    type: 'remove-last',
    preventDefault: true,
  });
});

it.each([
  ['Escape', true, { type: 'close', preventDefault: true }],
  ['Escape', false, undefined],
  ['Tab', true, { type: 'close', preventDefault: false }],
  ['Tab', false, { type: 'close', preventDefault: false }],
  ['Enter', true, { type: 'select', preventDefault: true }],
  ['Enter', false, { type: 'open', preventDefault: true }],
] as const)('maps %s with open=%s without executing anything', (key, open, expected) => {
  expect(getComboboxKeyAction(key, { open })).toEqual(expected);
});

it.each([
  ['ArrowDown', 'next'],
  ['ArrowUp', 'previous'],
] as const)('maps %s to navigation', (key, direction) => {
  expect(getComboboxKeyAction(key, { open: true })).toEqual({
    type: 'navigate',
    direction,
    preventDefault: true,
  });
});

it.each(['Home', 'End', ' ', 'ArrowLeft', 'ArrowRight', 'a'])(
  'leaves editable key %s native',
  (key) => {
    expect(getComboboxKeyAction(key, { open: true })).toBeUndefined();
  },
);

it.each([
  ['Home', 'first'],
  ['End', 'last'],
] as const)('uses %s for a non-searchable list', (key, direction) => {
  expect(getComboboxKeyAction(key, { open: true, searchable: false })).toEqual({
    type: 'navigate',
    direction,
    preventDefault: true,
  });
});

it.each([true, false])('activates non-searchable Space when open=%s', (open) => {
  expect(getComboboxKeyAction(' ', { open, searchable: false })).toEqual({
    type: open ? 'select' : 'open',
    preventDefault: true,
  });
});

it('can leave closed Enter to form submission without changing open Enter', () => {
  expect(getComboboxKeyAction('Enter', { open: false, openOnEnter: false })).toBeUndefined();
  expect(getComboboxKeyAction('Enter', { open: true, openOnEnter: false })).toEqual({
    type: 'select',
    preventDefault: true,
  });
});
