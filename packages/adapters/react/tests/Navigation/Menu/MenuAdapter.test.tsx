import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MenuAdapter } from '../../../src/Navigation/Menu/MenuAdapter.tsx';

afterEach(cleanup);
const items = [
  { value: 'copy', label: 'Copy' },
  { value: 'delete', label: 'Delete', disabled: true },
  { value: 'save', label: 'Save' },
];

describe('MenuAdapter', () => {
  it('focuses by typed prefix and cycles repeated letters without choosing an item', () => {
    const action = vi.fn();
    render(
      <MenuAdapter
        items={[
          { value: 'start', label: 'Start' },
          { value: 'locked', label: 'Settings', disabled: true },
          { value: 'settings', label: <span>Settings</span> },
          { value: 'save', label: 'Save' },
          { value: 'name', label: <span aria-hidden="true">★</span>, ariaLabel: 'Название' },
        ]}
        onAction={action}
      />,
    );
    const start = screen.getByRole('menuitem', { name: 'Start' });
    start.focus();
    fireEvent.keyDown(start, { key: 's' });
    expect(document.activeElement).toBe(
      screen
        .getAllByRole('menuitem', { name: 'Settings' })
        .find((item) => !(item as HTMLButtonElement).disabled),
    );
    fireEvent.keyDown(document.activeElement!, { key: 'e' });
    expect(document.activeElement?.textContent).toBe('Settings');
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    fireEvent.keyDown(start, { key: 's' });
    fireEvent.keyDown(document.activeElement!, { key: 's' });
    expect(document.activeElement?.textContent).toBe('Save');
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    fireEvent.keyDown(start, { key: 'н' });
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Название' }));
    expect(action).not.toHaveBeenCalled();
  });

  it('resets a stale query and ignores shortcuts, composition and prevented events', () => {
    let now = 1000;
    const clock = vi.spyOn(Date, 'now').mockImplementation(() => now);
    try {
      render(
        <MenuAdapter
          items={items}
          onKeyDown={(event) => {
            if (event.key === 'x') {
              event.preventDefault();
            }
          }}
        />,
      );
      const copy = screen.getByRole('menuitem', { name: 'Copy' });
      copy.focus();
      for (const extra of [
        { ctrlKey: true },
        { altKey: true },
        { metaKey: true },
        { isComposing: true },
      ]) {
        fireEvent.keyDown(copy, { key: 's', ...extra });
        expect(document.activeElement).toBe(copy);
      }
      fireEvent.keyDown(copy, { key: 'x' });
      fireEvent.keyDown(copy, { key: 's' });
      expect(document.activeElement?.textContent).toBe('Save');
      now += 1000;
      fireEvent.keyDown(document.activeElement!, { key: 'c' });
      expect(document.activeElement).toBe(copy);
    } finally {
      clock.mockRestore();
    }
  });

  it('runs actions with keyboard, skips disabled items and never submits a form', async () => {
    const action = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <MenuAdapter aria-label="Actions" items={items} onAction={action} />
      </form>,
    );
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Copy' }));
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Save' }));
    await user.keyboard('{Home}{ArrowDown}{Enter}');
    expect(action).toHaveBeenCalledExactlyOnceWith('save');
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('menuitem', { name: 'Save' }).tabIndex).toBe(0);
    expect(screen.getByRole('menuitem', { name: 'Copy' }).tabIndex).toBe(-1);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('clears the query when focus leaves the menu and forwards blur events', () => {
    const blur = vi.fn();
    render(
      <>
        <MenuAdapter items={items} onBlur={blur} />
        <button>Outside</button>
      </>,
    );
    const copy = screen.getByRole('menuitem', { name: 'Copy' });
    copy.focus();
    fireEvent.keyDown(copy, { key: 's' });
    expect(document.activeElement?.textContent).toBe('Save');
    screen.getByRole('button', { name: 'Outside' }).focus();
    expect(blur).toHaveBeenCalled();
    const save = screen.getByRole('menuitem', { name: 'Save' });
    save.focus();
    fireEvent.keyDown(save, { key: 'c' });
    expect(document.activeElement).toBe(copy);
    fireEvent.keyDown(copy, { key: 'o' });
    expect(document.activeElement).toBe(copy);
  });

  it('leaves checked selection to the caller and forwards ref and item properties', () => {
    const ref = createRef<HTMLDivElement>();
    const action = vi.fn();
    const { rerender } = render(
      <MenuAdapter
        ref={ref}
        aria-label="Choice"
        items={items}
        selectedValue="copy"
        onAction={action}
        className="own-menu"
        slotProps={{ item: { className: 'own-item', title: 'Command' } }}
      />,
    );
    expect(ref.current).toBe(screen.getByRole('menu', { name: 'Choice' }));
    const save = screen.getByRole('menuitemradio', { name: 'Save' });
    expect(save.className).toBe('own-item');
    expect(save.title).toBe('Command');
    fireEvent.click(save);
    expect(action).toHaveBeenCalledExactlyOnceWith('save');
    expect(save.getAttribute('aria-checked')).toBe('false');
    rerender(<MenuAdapter aria-label="Choice" items={items} selectedValue="save" />);
    expect(screen.getByRole('menuitemradio', { name: 'Save' }).getAttribute('aria-checked')).toBe(
      'true',
    );
  });

  it('honors prevented keyboard and item actions, and handles an empty or disabled menu', () => {
    const action = vi.fn();
    const { rerender } = render(
      <MenuAdapter
        items={items}
        onAction={action}
        onKeyDown={(event) => event.preventDefault()}
        slotProps={{ item: { onClick: (event) => event.preventDefault() } }}
      />,
    );
    const copy = screen.getByRole('menuitem', { name: 'Copy' });
    copy.focus();
    fireEvent.keyDown(copy, { key: 'End' });
    expect(document.activeElement).toBe(copy);
    fireEvent.click(copy);
    expect(action).not.toHaveBeenCalled();
    rerender(<MenuAdapter items={[items[1]]} />);
    expect(screen.getByRole('menuitem').tabIndex).toBe(-1);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' });
    rerender(<MenuAdapter items={[]} />);
    expect(screen.queryByRole('menuitem')).toBeNull();
  });

  it('rejects empty and duplicate values', () => {
    expect(() => render(<MenuAdapter items={[{ value: '', label: 'Empty' }]} />)).toThrow(
      'nonempty and unique',
    );
    expect(() => render(<MenuAdapter items={[items[0], items[0]]} />)).toThrow(
      'nonempty and unique',
    );
  });
});
