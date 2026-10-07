import { createRef, type CSSProperties } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import * as ui from '../../../../../../src/adapters/react/index.ts';

afterEach(cleanup);

it('merges themed slots, native nav properties and local tokens', () => {
  const ref = createRef<HTMLElement>();
  const view = render(<ui.Pagination total={200} current={10} className="custom-root" ref={ref}
    slotClassNames={{ button: 'custom-button', summary: 'custom-summary', ellipsis: 'custom-ellipsis' }}
    style={{ '--dreadnought-pagination-size': '40px' } as CSSProperties} />);
  const nav = screen.getByRole('navigation');
  expect(ref.current).toBe(nav);
  expect(nav.classList.contains('custom-root')).toBe(true);
  expect(nav.classList.length).toBeGreaterThan(1);
  expect(nav.style.getPropertyValue('--dreadnought-pagination-size')).toBe('40px');
  const button = screen.getByRole('button', { name: 'Страница 10' });
  expect(button.getAttribute('aria-current')).toBe('page');
  expect(button.classList.contains('custom-button')).toBe(true);
  expect(button.classList.length).toBeGreaterThan(1);
  expect(nav.querySelectorAll('.custom-ellipsis')).toHaveLength(2);
  expect(nav.querySelector('.custom-ellipsis')!.classList.length).toBeGreaterThan(1);
  view.rerender(<ui.Pagination total={200} simple slotClassNames={{ summary: 'custom-summary' }} />);
  expect(screen.getByText('1 / 20').classList.contains('custom-summary')).toBe(true);
  expect(screen.getByText('1 / 20').classList.length).toBeGreaterThan(1);
});
