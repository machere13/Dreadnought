import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { DropdownAdapter } from '@dreadnought/react/unstyled';
import * as ui from '@dreadnought/ui/react';

afterEach(cleanup);
it('styles the popup and menu slots while preserving local classes and an unstyled adapter', () => {
  expect(typeof ui.Dropdown).toBe('function');
  render(
    <>
      <ui.Dropdown
        defaultOpen
        className="own-popup"
        items={[{ value: 'a', label: 'A' }]}
        menuProps={{ className: 'own-menu', slotProps: { item: { className: 'own-item' } } }}
      >
        {(trigger) => <ui.Button {...trigger}>Ready</ui.Button>}
      </ui.Dropdown>
      <DropdownAdapter items={[{ value: 'b', label: 'B' }]}>
        {(trigger) => <button {...trigger}>Plain</button>}
      </DropdownAdapter>
    </>,
  );
  const ready = screen.getByRole('menu', { name: 'Ready' });
  expect(ready.parentElement!.className).toContain('own-popup');
  expect(ready.parentElement!.className).not.toBe('own-popup');
  expect(ready.className).toContain('own-menu');
  expect(ready.className).not.toBe('own-menu');
  expect(screen.getByRole('menuitem', { name: 'A' }).className).toContain('own-item');
  expect(screen.getByRole('menuitem', { name: 'A' }).className).toContain(
    'dreadnought-text-menu-item',
  );
  expect(ready.parentElement!.querySelector('[data-ui="popover-arrow"]')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Plain' }));
  const plain = screen.getByRole('menu', { name: 'Plain' });
  expect(plain.className).toBe('');
  expect(plain.parentElement!.className).toBe('');
});
