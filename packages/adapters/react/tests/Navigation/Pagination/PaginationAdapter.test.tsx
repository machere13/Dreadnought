import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { PaginationAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);

it('uses named native buttons and keyboard interaction without submitting a form', async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const submitted = vi.fn(event => event.preventDefault());
  render(<form onSubmit={submitted}><PaginationAdapter total={100} onChange={changed} /></form>);
  expect(screen.getByRole('navigation', { name: 'Пагинация' })).toBeTruthy();
  const first = screen.getByRole('button', { name: 'Страница 1' });
  expect(first.getAttribute('aria-current')).toBe('page');
  expect((first as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(first);
  expect(changed).not.toHaveBeenCalled();
  await user.tab();
  expect(document.activeElement).toBe(first);
  await user.tab();
  await user.keyboard('{Enter}');
  expect(changed).toHaveBeenLastCalledWith(2, 10);
  screen.getByRole('button', { name: 'Следующая страница' }).focus();
  await user.keyboard(' ');
  expect(changed).toHaveBeenLastCalledWith(3, 10);
  expect(submitted).not.toHaveBeenCalled();
});

it('keeps a controlled page until the parent accepts it', () => {
  const changed = vi.fn();
  const view = render(<PaginationAdapter total={100} current={3} onChange={changed} />);
  fireEvent.click(screen.getByRole('button', { name: 'Страница 4' }));
  expect(changed).toHaveBeenCalledExactlyOnceWith(4, 10);
  expect(screen.getByRole('button', { name: 'Страница 3' }).getAttribute('aria-current')).toBe('page');
  view.rerender(<PaginationAdapter total={100} current={4} onChange={changed} />);
  expect(screen.getByRole('button', { name: 'Страница 4' }).getAttribute('aria-current')).toBe('page');
});

it('blocks all disabled buttons', () => {
  const changed = vi.fn();
  render(<PaginationAdapter total={100} defaultCurrent={3} disabled onChange={changed} />);
  for (const button of screen.getAllByRole('button')) {
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
  }
  expect(changed).not.toHaveBeenCalled();
});

it('renders the empty simple summary and disabled boundaries', () => {
  render(<PaginationAdapter total={0} simple />);
  expect(screen.getByText('1 / 1')).toBeTruthy();
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getAllByRole('button')).toHaveLength(2);
  expect(screen.getAllByRole('button').every(button => (button as HTMLButtonElement).disabled)).toBe(true);
});

it('forwards nav properties/ref and keeps library props out of the DOM', () => {
  const ref = createRef<HTMLElement>();
  const view = render(<PaginationAdapter total={200} current={10} pageSize={10} ref={ref}
    aria-label="Results" id="pages" className="root" slotClassNames={{ button: 'b', summary: 's', ellipsis: 'e' }} />);
  const nav = screen.getByRole('navigation', { name: 'Results' });
  expect(ref.current).toBe(nav);
  expect(nav.id).toBe('pages');
  expect(nav.className).toBe('root');
  for (const name of ['total', 'current', 'defaultcurrent', 'pagesize', 'simple', 'slotclassnames']) expect(nav.hasAttribute(name)).toBe(false);
  expect(screen.getAllByRole('button').every(button => button.className === 'b')).toBe(true);
  const ellipses = nav.querySelectorAll('.e');
  expect(ellipses).toHaveLength(2);
  expect([...ellipses].every(element => element.getAttribute('aria-hidden') === 'true' && element.tagName === 'SPAN')).toBe(true);
  view.rerender(<PaginationAdapter total={200} simple slotClassNames={{ summary: 's' }} />);
  expect(screen.getByText('1 / 20').className).toBe('s');
});

it('keeps a million-page result bounded', () => {
  render(<PaginationAdapter total={1000000} pageSize={1} current={500000} />);
  expect(screen.getAllByRole('button')).toHaveLength(9);
  expect(screen.getByRole('button', { name: 'Страница 500000' }).getAttribute('aria-current')).toBe('page');
});
