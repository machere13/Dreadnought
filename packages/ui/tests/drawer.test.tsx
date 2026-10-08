import type { CSSProperties } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it } from 'vitest';
import * as ui from '../src/adapters/react/index.ts';
import * as presentation from '../src/presentation/index.ts';

beforeEach(() =>
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
  }),
);
afterEach(() => {
  cleanup();
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
});

it.each(['right', 'left', 'top', 'bottom'] as const)(
  'places a themed drawer at %s and preserves consumer props',
  (placement) => {
    expect(ui).toHaveProperty('Drawer');
    render(
      <ui.Drawer
        aria-label="Settings"
        placement={placement}
        size={320}
        className="custom"
        data-testid="settings"
        style={{ color: 'red', '--dreadnought-drawer-size': '10px' } as CSSProperties}
        content={({ close }) => (
          <>
            <ui.Input aria-label="Name" />
            <ui.Button onClick={close}>Done</ui.Button>
          </>
        )}
      >
        {(trigger) => <ui.Button {...trigger}>Open</ui.Button>}
      </ui.Drawer>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(dialog.className).toContain(presentation.drawerPresentation.root);
    expect(dialog.className).toContain(presentation.drawerPresentation[placement]);
    expect(dialog.className).toContain('custom');
    expect(dialog.getAttribute('data-testid')).toBe('settings');
    expect(dialog.style.color).toBe('red');
    expect(dialog.style.getPropertyValue('--dreadnought-drawer-size')).toBe('320px');
    expect(dialog.hasAttribute('placement')).toBe(false);
    expect(dialog.hasAttribute('size')).toBe(false);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('Alice');
  },
);

it.each([undefined, 0, -1, NaN, Infinity])(
  'ignores invalid numeric size %s and preserves a local token',
  (size) => {
    render(
      <ui.Drawer
        defaultOpen
        size={size}
        aria-label="Settings"
        content="Content"
        style={{ '--dreadnought-drawer-size': '18rem' } as CSSProperties}
      >
        {(trigger) => <button {...trigger}>Open</button>}
      </ui.Drawer>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog.style.getPropertyValue('--dreadnought-drawer-size')).toBe('18rem');
    expect(dialog.className).toContain(presentation.drawerPresentation.right);
  },
);

it('accepts a CSS size and otherwise leaves the theme default intact', () => {
  const { rerender } = render(
    <ui.Drawer defaultOpen size="70vh" content="Content">
      {(trigger) => <button {...trigger}>Open</button>}
    </ui.Drawer>,
  );
  expect(screen.getByRole('dialog').style.getPropertyValue('--dreadnought-drawer-size')).toBe(
    '70vh',
  );
  rerender(
    <ui.Drawer defaultOpen content="Content">
      {(trigger) => <button {...trigger}>Open</button>}
    </ui.Drawer>,
  );
  expect(screen.getByRole('dialog').style.getPropertyValue('--dreadnought-drawer-size')).toBe('');
});

it('shares nested scroll locks across repeated cycles with Modal', () => {
  document.documentElement.style.setProperty('overflow', 'scroll', 'important');
  try {
    render(
      <ui.Drawer
        aria-label="Parent"
        content={({ close }) => (
          <>
            <ui.Modal
              aria-label="Child"
              content={({ close: closeChild }) => (
                <ui.Button onClick={closeChild}>Close child</ui.Button>
              )}
            >
              {(trigger) => <ui.Button {...trigger}>Open child</ui.Button>}
            </ui.Modal>
            <ui.Button onClick={close}>Close parent</ui.Button>
          </>
        )}
      >
        {(trigger) => <ui.Button {...trigger}>Open parent</ui.Button>}
      </ui.Drawer>,
    );
    for (let cycle = 0; cycle < 3; cycle++) {
      fireEvent.click(screen.getByRole('button', { name: 'Open parent' }));
      fireEvent.click(screen.getByRole('button', { name: 'Open child' }));
      fireEvent.click(screen.getByRole('button', { name: 'Close child' }));
      expect(screen.getByRole('dialog', { name: 'Parent' })).toBeTruthy();
      expect(document.documentElement.style.overflow).toBe('hidden');
      fireEvent.click(screen.getByRole('button', { name: 'Close parent' }));
      expect(document.documentElement.style.overflow).toBe('scroll');
      expect(document.documentElement.style.getPropertyPriority('overflow')).toBe('important');
    }
  } finally {
    document.documentElement.style.removeProperty('overflow');
  }
});
