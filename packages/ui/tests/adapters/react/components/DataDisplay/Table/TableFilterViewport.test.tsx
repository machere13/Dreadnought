import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Table } from '@dreadnought/ui/react';
import { TableAdapter } from '@dreadnought/react/unstyled';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each(['adapter', 'styled'] as const)(
  'keeps an open table filter inside the viewport after its anchor scrolls out of view (%s)',
  (variant) => {
    let anchorTop = 80;
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(390);
    const viewportHeight = vi
      .spyOn(document.documentElement, 'clientHeight', 'get')
      .mockReturnValue(280);
    const originalRect = HTMLElement.prototype.getBoundingClientRect;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      if (this.dataset.slot === 'filter-trigger') return new DOMRect(350, anchorTop, 20, 20);
      if (this.dataset.slot === 'filter-menu') return new DOMRect(0, 0, 240, 120);
      return originalRect.call(this);
    });
    const props = {
      pagination: false as const,
      columns: [
        {
          key: 'name',
          title: 'Имя',
          dataIndex: 'name' as const,
          filters: [{ text: 'Анна', value: 'anna' }],
        },
      ],
      dataSource: [{ key: 1, name: 'Анна' }],
    };
    render(variant === 'styled' ? <Table {...props} /> : <TableAdapter {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Фильтр Имя' }));
    const popup = screen.getByRole('dialog', { name: 'Фильтр Имя' });
    expect(popup.style.left).toBe('150px');
    expect(popup.style.top).toBe('100px');

    anchorTop = 500;
    act(() => window.dispatchEvent(new Event('scroll')));
    expect(popup.style.top).toBe('160px');

    anchorTop = -200;
    act(() => window.dispatchEvent(new Event('scroll')));
    expect(popup.style.top).toBe('0px');

    anchorTop = 500;
    viewportHeight.mockReturnValue(90);
    act(() => window.dispatchEvent(new Event('resize')));
    expect(popup.style.top).toBe('0px');
  },
);
