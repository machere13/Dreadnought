import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import * as logic from '../../../src/logic.ts';
import { ToastAdapter } from '../../../src/Feedback/Toast/ToastAdapter.tsx';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('keeps batched additions with distinct ids and independent queues', () => {
  const first = renderHook(() => logic.useToastQueue(), { wrapper: StrictMode });
  const second = renderHook(() => logic.useToastQueue());
  let ids: string[] = [];
  act(() => {
    ids = [
      first.result.current.add({ title: 'First' }),
      first.result.current.add({ title: 'Second' }),
    ];
    ids.push(second.result.current.add({ title: 'Other' }));
  });
  expect(new Set(ids).size).toBe(3);
  expect(first.result.current.items.map((item) => item.props.title)).toEqual(['First', 'Second']);
  expect(second.result.current.items.map((item) => item.props.title)).toEqual(['Other']);
});

it('updates by id in the same batch without replacing other properties', () => {
  const { result } = renderHook(() => logic.useToastQueue());
  let id = '';
  act(() => {
    id = result.current.add({ title: 'Saving', description: 'Document', duration: 0 });
    result.current.update(id, { title: 'Saved', type: 'success' });
  });
  expect(result.current.items[0].id).toBe(id);
  expect(result.current.items[0].props).toMatchObject({
    title: 'Saved',
    description: 'Document',
    duration: 0,
    type: 'success',
  });
});

it('removes only the requested item and clears the whole queue', () => {
  const { result } = renderHook(() => logic.useToastQueue());
  let id = '';
  act(() => {
    id = result.current.add({ title: 'First' });
    result.current.add({ title: 'Second' });
  });
  act(() => result.current.remove(id));
  expect(result.current.items.map((item) => item.props.title)).toEqual(['Second']);
  act(() => {
    result.current.update(id, { title: 'Missing' });
    result.current.remove('missing');
  });
  expect(result.current.items).toHaveLength(1);
  act(() => result.current.clear());
  expect(result.current.items).toEqual([]);
});

it('evicts oldest items and never restores them when the limit increases', () => {
  const { result, rerender } = renderHook(({ maxCount }) => logic.useToastQueue({ maxCount }), {
    initialProps: { maxCount: 2 },
  });
  act(() => {
    result.current.add({ title: 'First' });
    result.current.add({ title: 'Second' });
    result.current.add({ title: 'Third' });
  });
  expect(result.current.items.map((item) => item.props.title)).toEqual(['Second', 'Third']);
  rerender({ maxCount: 1 });
  expect(result.current.items.map((item) => item.props.title)).toEqual(['Third']);
  rerender({ maxCount: 3 });
  expect(result.current.items.map((item) => item.props.title)).toEqual(['Third']);
});

it.each([0, -1, 1.5, NaN, Infinity])('rejects invalid maxCount %s', (maxCount) => {
  expect(() => renderHook(() => logic.useToastQueue({ maxCount }))).toThrow(RangeError);
});

it('enforces a changed limit even through a previously captured add callback', () => {
  const { result, rerender } = renderHook(({ maxCount }) => logic.useToastQueue({ maxCount }), {
    initialProps: { maxCount: 3 },
  });
  const add = result.current.add;
  rerender({ maxCount: 1 });
  act(() => {
    add({ title: 'First' });
    add({ title: 'Second' });
  });
  expect(result.current.items.map((item) => item.props.title)).toEqual(['Second']);
  rerender({ maxCount: 3 });
  expect(result.current.items.map((item) => item.props.title)).toEqual(['Second']);
});

function QueueDemo() {
  const queue = logic.useToastQueue({ maxCount: 2 });
  return (
    <>
      <button onClick={() => queue.add({ title: 'Temporary', duration: 1000 })}>Add</button>
      <button onClick={() => queue.clear()}>Clear</button>
      <button onClick={() => queue.update(queue.items[0].id, { title: 'Updated' })}>Update</button>
      <button onClick={() => queue.update(queue.items[0].id, { duration: 2000 })}>Extend</button>
      {queue.items.map(({ id, props }) => (
        <ToastAdapter key={id} {...props} />
      ))}
    </>
  );
}

it('uses an increased limit through a previously captured add callback', () => {
  const { result, rerender } = renderHook(({ maxCount }) => logic.useToastQueue({ maxCount }), {
    initialProps: { maxCount: 1 },
  });
  const add = result.current.add;
  act(() => add({ title: 'First' }));
  rerender({ maxCount: 3 });
  act(() => {
    add({ title: 'Second' });
    add({ title: 'Third' });
  });
  expect(result.current.items.map((item) => item.props.title)).toEqual([
    'First',
    'Second',
    'Third',
  ]);
});

it('removes expired and manually closed notifications from rendered items', () => {
  vi.useFakeTimers();
  render(<QueueDemo />);
  fireEvent.click(screen.getByText('Add'));
  fireEvent.click(screen.getByText('Add'));
  fireEvent.click(screen.getAllByRole('button', { name: 'Close notification' })[0]);
  expect(screen.getAllByRole('status')).toHaveLength(1);
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.queryByRole('status')).toBeNull();
});

it('cancels notification timers when cleared or unmounted', () => {
  vi.useFakeTimers();
  const { unmount } = render(<QueueDemo />);
  fireEvent.click(screen.getByText('Add'));
  fireEvent.click(screen.getByText('Clear'));
  expect(vi.getTimerCount()).toBe(0);
  fireEvent.click(screen.getByText('Add'));
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('preserves the existing countdown when updating content', () => {
  vi.useFakeTimers();
  render(<QueueDemo />);
  fireEvent.click(screen.getByText('Add'));
  const toast = screen.getByRole('status');
  act(() => vi.advanceTimersByTime(500));
  fireEvent.click(screen.getByText('Update'));
  expect(screen.getByRole('status')).toBe(toast);
  expect(toast.textContent).toContain('Updated');
  act(() => vi.advanceTimersByTime(499));
  expect(screen.getByRole('status')).toBe(toast);
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByRole('status')).toBeNull();
});

it('starts a new countdown when duration changes', () => {
  vi.useFakeTimers();
  render(<QueueDemo />);
  fireEvent.click(screen.getByText('Add'));
  act(() => vi.advanceTimersByTime(500));
  fireEvent.click(screen.getByText('Extend'));
  act(() => vi.advanceTimersByTime(1999));
  expect(screen.getByRole('status')).toBeTruthy();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByRole('status')).toBeNull();
});

it('preserves focus and its countdown pause during an update', () => {
  vi.useFakeTimers();
  render(<QueueDemo />);
  fireEvent.click(screen.getByText('Add'));
  const close = screen.getByRole('button', { name: 'Close notification' });
  act(() => close.focus());
  fireEvent.click(screen.getByText('Update'));
  expect(document.activeElement).toBe(close);
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.getByRole('status').textContent).toContain('Updated');
});
