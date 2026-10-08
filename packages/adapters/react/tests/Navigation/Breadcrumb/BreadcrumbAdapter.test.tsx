import { createRef } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BreadcrumbAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);

describe('BreadcrumbAdapter', () => {
  it('renders ordered navigation and marks the last item as the current page', () => {
    render(
      <BreadcrumbAdapter
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Документация', href: '/docs' },
          { label: 'Компоненты' },
        ]}
      />,
    );

    const navigation = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const items = within(navigation).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Главная',
      'Документация',
      'Компоненты',
    ]);
    expect(within(navigation).getByRole('link', { name: 'Главная' }).getAttribute('href')).toBe(
      '/',
    );
    expect(
      within(navigation).getByRole('link', { name: 'Документация' }).getAttribute('href'),
    ).toBe('/docs');
    expect(within(navigation).queryByRole('link', { name: 'Компоненты' })).toBeNull();
    expect(items[2]?.querySelector('[aria-current="page"]')?.textContent).toBe('Компоненты');
    expect(items[0]?.querySelector('[aria-current]')).toBeNull();
  });

  it('keeps an explicitly linked last item current without discarding its link', () => {
    render(
      <BreadcrumbAdapter
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Аккаунт', href: '/account' },
        ]}
      />,
    );
    const current = screen.getByRole('link', { name: 'Аккаунт' });
    expect(current.getAttribute('href')).toBe('/account');
    expect(current.getAttribute('aria-current')).toBe('page');
  });

  it('forwards nav props, ref and slot classes while allowing custom link content', () => {
    const ref = createRef<HTMLElement>();
    render(
      <BreadcrumbAdapter
        aria-label="Путь"
        data-test="trail"
        className="own-root"
        ref={ref}
        slotClassNames={{
          list: 'own-list',
          item: 'own-item',
          link: 'own-link',
          current: 'own-current',
        }}
        items={[{ label: <strong>Раздел</strong>, href: '/section' }, { label: 'Страница' }]}
      />,
    );

    const navigation = screen.getByRole('navigation', { name: 'Путь' });
    expect(ref.current).toBe(navigation);
    expect(navigation.getAttribute('data-test')).toBe('trail');
    expect(navigation.className).toBe('own-root');
    expect(navigation.querySelector('ol')?.className).toBe('own-list');
    expect(navigation.querySelector('li')?.className).toBe('own-item');
    expect(navigation.querySelector('a')?.className).toBe('own-link');
    expect(navigation.querySelector('[aria-current="page"]')?.className).toBe('own-current');
    expect(screen.getByText('Раздел').tagName).toBe('STRONG');
  });

  it('omits navigation when the item list is empty', () => {
    const { container } = render(<BreadcrumbAdapter items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
