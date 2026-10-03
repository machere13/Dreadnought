import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MenuAdapter } from '@dreadnought/react/unstyled';
import { Icon, Menu } from '@dreadnought/ui/react';

afterEach(cleanup);

it('styles Menu parts while leaving the adapter unstyled and supports the ellipsis icon', () => {
  render(<><Menu aria-label="Ready" className="own-menu" items={[{ value: 'a', label: 'A' }]}
    slotProps={{ item: { className: 'own-item' } }} />
    <MenuAdapter aria-label="Plain" items={[{ value: 'b', label: 'B' }]} />
    <Icon name="ellipsis" aria-label="More" /></>);
  expect(screen.getByRole('menu', { name: 'Ready' }).className).toContain('own-menu');
  expect(screen.getByRole('menu', { name: 'Ready' }).className).not.toBe('own-menu');
  expect(screen.getByRole('menuitem', { name: 'A' }).className).toContain('own-item');
  expect(screen.getByRole('menuitem', { name: 'A' }).className).toContain('dreadnought-text-menu-item');
  expect(screen.getByRole('menu', { name: 'Plain' }).className).toBe('');
  expect(screen.getByRole('menuitem', { name: 'B' }).className).toBe('');
  expect(screen.getByRole('img', { name: 'More' }).querySelector('svg')).toBeTruthy();
});
