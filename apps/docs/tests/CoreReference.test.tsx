import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it } from 'vitest';
import { CoreReference } from '../src/content/core/CoreReference.tsx';

afterEach(cleanup);

it('documents collection navigation as a pattern with an executable example', () => {
  render(<CoreReference kind="patterns" />);
  const navigation = within(screen.getByRole('region', { name: 'getCollectionNavigation', exact: true }));
  expect(navigation.getByRole('rowheader', { name: 'items', exact: true })).toBeTruthy();
  expect(navigation.getByText(/import \{ getCollectionNavigation \}/).textContent).toContain('ArrowRight');
  expect(screen.queryByRole('heading', { name: 'getNextEnabledValue', exact: true })).toBeNull();
});

it('shows action parameters, return values and complete examples without mixing in component state', () => {
  render(<CoreReference kind="actions" />);
  const copy = within(screen.getByRole('region', { name: 'copy', exact: true }));
  expect(copy.getByRole('rowheader', { name: 'text', exact: true })).toBeTruthy();
  expect(copy.getByText('Promise<void>', { exact: true })).toBeTruthy();
  expect(copy.getByText(/import \{ copy \}/).textContent).toContain('await copy(text)');
  expect(screen.queryByRole('heading', { name: 'getButtonState', exact: true })).toBeNull();
});

it('lets the reader open the types used by a behavior contract', async () => {
  const user = userEvent.setup();
  render(<CoreReference kind="behaviors" />);
  const navigation = within(screen.getByRole('region', { name: 'getNextEnabledValue', exact: true }));
  expect(navigation.getByRole('rowheader', { name: 'options', exact: true })).toBeTruthy();
  await user.click(navigation.getByRole('button', { name: 'Типы параметров и результата', exact: true }));
  expect(navigation.getByText(/type NavigationOptions =/).textContent).toContain('loop');
});
