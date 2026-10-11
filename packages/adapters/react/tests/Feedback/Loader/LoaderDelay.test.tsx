import { act, cleanup, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LoaderAdapter } from '../../../src/Feedback/Loader/LoaderAdapter.tsx';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('blocks content immediately but waits for the delay before showing the indicator', () => {
  render(
    <LoaderAdapter delay={200}>
      <button>Save</button>
    </LoaderAdapter>,
  );
  const button = screen.getByText('Save');
  expect(button.parentElement?.hasAttribute('inert')).toBe(true);
  expect(button.closest('[data-ui="loader"]')?.getAttribute('aria-busy')).toBe('true');
  expect(screen.queryByRole('status')).toBeNull();
  act(() => vi.advanceTimersByTime(199));
  expect(screen.queryByRole('status')).toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole('status')).toBeTruthy();
});

it('never shows an indicator for a completed fast request and restarts for the next request', () => {
  const { rerender } = render(<LoaderAdapter delay={200} />);
  act(() => vi.advanceTimersByTime(100));
  rerender(<LoaderAdapter loading={false} delay={200} />);
  act(() => vi.advanceTimersByTime(200));
  expect(screen.queryByRole('status')).toBeNull();
  rerender(<LoaderAdapter loading delay={200} />);
  act(() => vi.advanceTimersByTime(199));
  expect(screen.queryByRole('status')).toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole('status')).toBeTruthy();
});

it('hides immediately and unlocks the same mounted content when loading ends', () => {
  const { rerender } = render(
    <LoaderAdapter delay={100}>
      <button>Save</button>
    </LoaderAdapter>,
  );
  const button = screen.getByText('Save');
  act(() => vi.advanceTimersByTime(100));
  expect(screen.getByRole('status')).toBeTruthy();
  rerender(
    <LoaderAdapter loading={false} delay={100}>
      <button>Save</button>
    </LoaderAdapter>,
  );
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.getByRole('button')).toBe(button);
  expect(button.parentElement?.hasAttribute('inert')).toBe(false);
  expect(button.closest('[data-ui="loader"]')?.getAttribute('aria-busy')).toBe('false');
});

it('cancels the previous timer when delay changes while waiting', () => {
  const { rerender } = render(<LoaderAdapter delay={200} />);
  act(() => vi.advanceTimersByTime(100));
  rerender(<LoaderAdapter delay={300} />);
  act(() => vi.advanceTimersByTime(299));
  expect(screen.queryByRole('status')).toBeNull();
  act(() => vi.advanceTimersByTime(1));
  expect(screen.getByRole('status')).toBeTruthy();
});

it('shows immediately if the pending delay is changed to zero', () => {
  const { rerender } = render(<LoaderAdapter delay={200} />);
  rerender(<LoaderAdapter delay={0} />);
  expect(screen.getByRole('status')).toBeTruthy();
  expect(vi.getTimerCount()).toBe(0);
});

it('cancels timers on unmount and survives StrictMode effect replay', () => {
  const { unmount } = render(
    <StrictMode>
      <LoaderAdapter delay={200} />
    </StrictMode>,
  );
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  act(() => vi.advanceTimersByTime(200));
  expect(screen.queryByRole('status')).toBeNull();
});
