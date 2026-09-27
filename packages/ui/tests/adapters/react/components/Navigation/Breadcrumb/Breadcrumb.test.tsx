import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BreadcrumbAdapter } from '@dreadnought/react/unstyled';
import { Breadcrumb } from '@dreadnought/ui/react';

afterEach(cleanup);

describe('Breadcrumb', () => {
  it('styles the ready component without styling the unstyled adapter', () => {
    render(<>
      <Breadcrumb aria-label="Готовый путь" className="own-root" items={[
        { label: 'Главная', href: '/' }, { label: 'Компоненты' },
      ]} slotClassNames={{ link: 'own-link', current: 'own-current' }} />
      <BreadcrumbAdapter aria-label="Свой путь" items={[{ label: 'Главная', href: '/' }, { label: 'Страница' }]} />
    </>);

    const ready = screen.getByRole('navigation', { name: 'Готовый путь' });
    const plain = screen.getByRole('navigation', { name: 'Свой путь' });
    expect(ready.className).toContain('own-root');
    expect(ready.className).not.toBe('own-root');
    expect(ready.querySelector('ol')?.className).not.toBe('');
    expect(ready.querySelector('a')?.className).toContain('own-link');
    expect(ready.querySelector('[aria-current="page"]')?.className).toContain('own-current');
    expect(plain.className).toBe('');
    expect(plain.querySelector('ol')?.className).toBe('');
    expect(plain.querySelector('a')?.className).toBe('');
  });

  it('preserves adapter semantics and does not create empty navigation', () => {
    const { rerender } = render(<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Current' }]} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' }).querySelector('[aria-current="page"]')?.textContent).toBe('Current');
    rerender(<Breadcrumb items={[]} />);
    expect(screen.queryByRole('navigation')).toBeNull();
  });
});
