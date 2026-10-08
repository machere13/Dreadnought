import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import * as adapter from '../../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('starts a fresh countdown when a hovered controlled toast reopens', () => {
  vi.useFakeTimers();
  const changes: boolean[] = [];
  const { rerender } = render(
    <adapter.ToastAdapter
      title="Готово"
      open
      duration={1000}
      onOpenChange={(open) => changes.push(open)}
    />,
  );
  fireEvent.mouseEnter(screen.getByRole('status'));
  rerender(
    <adapter.ToastAdapter
      title="Готово"
      open={false}
      duration={1000}
      onOpenChange={(open) => changes.push(open)}
    />,
  );
  rerender(
    <adapter.ToastAdapter
      title="Готово"
      open
      duration={1000}
      onOpenChange={(open) => changes.push(open)}
    />,
  );
  act(() => vi.advanceTimersByTime(1000));
  expect(changes).toEqual([false]);
});

it('rejects durations that browser timers cannot represent', () => {
  expect(() =>
    render(<adapter.ToastAdapter title="Некорректный таймер" duration={Infinity} />),
  ).toThrow();
  expect(() =>
    render(<adapter.ToastAdapter title="Некорректный таймер" duration={2147483648} />),
  ).toThrow();
});

it('pauses the remaining countdown on hover and keyboard focus', () => {
  expect(adapter).toHaveProperty('ToastAdapter');
  vi.useFakeTimers();
  render(<adapter.ToastAdapter title="Сохранено" duration={3000} closable />);
  const toast = screen.getByRole('status');
  act(() => vi.advanceTimersByTime(1000));
  fireEvent.mouseEnter(toast);
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.getByText('Сохранено')).toBeTruthy();
  fireEvent.focus(screen.getByRole('button'));
  fireEvent.mouseLeave(toast);
  act(() => vi.advanceTimersByTime(5000));
  expect(screen.getByText('Сохранено')).toBeTruthy();
  fireEvent.blur(screen.getByRole('button'), { relatedTarget: document.body });
  act(() => vi.advanceTimersByTime(1999));
  expect(screen.getByText('Сохранено')).toBeTruthy();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.queryByText('Сохранено')).toBeNull();
});

it('requests controlled closing once without removing externally controlled content', () => {
  expect(adapter).toHaveProperty('ToastAdapter');
  vi.useFakeTimers();
  const changes: boolean[] = [];
  const { rerender } = render(
    <adapter.ToastAdapter
      title="Ошибка"
      type="error"
      open
      duration={1000}
      onOpenChange={(open) => changes.push(open)}
    />,
  );
  expect(screen.getByRole('alert')).toBeTruthy();
  act(() => vi.advanceTimersByTime(1000));
  expect(changes).toEqual([false]);
  rerender(
    <adapter.ToastAdapter
      title="Ошибка"
      type="error"
      open
      duration={1000}
      onOpenChange={(open) => changes.push(open)}
    />,
  );
  act(() => vi.advanceTimersByTime(5000));
  expect(changes).toEqual([false]);
  expect(screen.getByText('Ошибка')).toBeTruthy();
});

it('allows persistent notifications to be dismissed and cleans up pending timers', () => {
  expect(adapter).toHaveProperty('ToastAdapter');
  vi.useFakeTimers();
  render(<adapter.ToastAdapter title="Постоянное" duration={0} closable />);
  act(() => vi.advanceTimersByTime(10000));
  fireEvent.click(screen.getByRole('button'));
  expect(screen.queryByText('Постоянное')).toBeNull();
  const changes: boolean[] = [];
  const { unmount } = render(
    <adapter.ToastAdapter title="Временное" onOpenChange={(open) => changes.push(open)} />,
  );
  unmount();
  act(() => vi.advanceTimersByTime(10000));
  expect(changes).toEqual([]);
});
