import { useState } from 'react';
import { flushSync } from 'react-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MenuAdapter } from '../../../src/Navigation/Menu/MenuAdapter.tsx';
afterEach(cleanup);
const items = [
  {
    value: 'group',
    type: 'group' as const,
    label: 'Files',
    children: [
      { value: 'copy', label: 'Copy' },
      { value: 'more', label: 'More', children: [{ value: 'save', label: 'Save' }] },
    ],
  },
  { value: 'divider', type: 'divider' as const },
  { value: 'end', label: 'End' },
];

it('opens submenus without actions, enters with Right and returns with Left', () => {
  const action = vi.fn();
  render(<MenuAdapter items={items} aria-label="Commands" onAction={action} />);
  expect(screen.getByRole('group', { name: 'Files' })).toBeTruthy();
  expect(screen.getByRole('separator')).toBeTruthy();
  const more = screen.getByRole('menuitem', { name: 'More' });
  act(() => more.focus());
  fireEvent.keyDown(more, { key: 'ArrowRight' });
  expect(more.getAttribute('aria-expanded')).toBe('true');
  fireEvent.keyDown(more, { key: 'ArrowRight' });
  const save = screen.getByRole('menuitem', { name: 'Save' });
  expect(document.activeElement).toBe(save);
  fireEvent.keyDown(save, { key: 'ArrowLeft' });
  expect(document.activeElement).toBe(more);
  fireEvent.keyDown(more, { key: 'ArrowLeft' });
  expect(screen.queryByRole('menuitem', { name: 'Save' })).toBeNull();
  expect(action).not.toHaveBeenCalled();
});

it('uses controlled open keys and restores focus when a branch closes', () => {
  const change = vi.fn();
  const view = render(<MenuAdapter items={items} openKeys={['more']} onOpenKeysChange={change} />);
  const more = screen.getByRole('menuitem', { name: 'More' });
  fireEvent.click(more);
  expect(change).toHaveBeenCalledExactlyOnceWith([]);
  expect(screen.getByRole('menuitem', { name: 'Save' })).toBeTruthy();
  act(() => screen.getByRole('menuitem', { name: 'Save' }).focus());
  view.rerender(<MenuAdapter items={items} openKeys={[]} onOpenKeysChange={change} />);
  expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'More' }));
});

it('renders navigation as links, marks the current page and disables native navigation', () => {
  const action = vi.fn();
  render(
    <MenuAdapter
      mode="navigation"
      aria-label="Pages"
      selectedValue="docs"
      onAction={action}
      items={[
        { value: 'docs', label: 'Docs', href: '/docs', target: '_blank' },
        { value: 'locked', label: 'Locked', href: '/locked', disabled: true },
      ]}
    />,
  );
  expect(screen.getByRole('navigation', { name: 'Pages' })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBe('page');
  const disabled = screen.getByText('Locked').closest('a')!;
  expect(disabled.hasAttribute('href')).toBe(false);
  expect(disabled.getAttribute('aria-disabled')).toBe('true');
  fireEvent.click(disabled);
  expect(action).not.toHaveBeenCalled();
});

it('does not intercept modified shortcuts or nested interactive content', () => {
  render(
    <MenuAdapter
      items={[
        { value: 'copy', label: <input aria-label="Search" /> },
        { value: 'end', label: 'End' },
      ]}
    />,
  );
  const input = screen.getByRole('textbox');
  act(() => input.focus());
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(input);
  const end = screen.getByRole('menuitem', { name: 'End' });
  act(() => end.focus());
  fireEvent.keyDown(end, { key: 'Home', ctrlKey: true });
  expect(document.activeElement).toBe(end);
});

it('does not run an action disabled synchronously by consumer focus', () => {
  const action = vi.fn();
  function Example() {
    const [disabled, setDisabled] = useState(false);
    return (
      <MenuAdapter
        items={[{ value: 'save', label: 'Save', disabled }]}
        onAction={action}
        onFocus={() => flushSync(() => setDisabled(true))}
      />
    );
  }
  render(<Example />);
  fireEvent.click(screen.getByRole('menuitem', { name: 'Save' }));
  expect(action).not.toHaveBeenCalled();
});
