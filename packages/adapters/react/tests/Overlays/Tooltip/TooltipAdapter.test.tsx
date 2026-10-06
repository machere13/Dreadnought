import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import * as adapters from '../../../src/index.ts';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
it('repositions after viewport resize and keeps positioning options out of native DOM attributes', () => {
  let height = 300;
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(400);
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockImplementation(() => height);
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return this.tagName === 'BUTTON' ? new DOMRect(100, 250, 80, 40) : new DOMRect(0, 0, 60, 30);
  });
  example({ placement: 'bottom', arrow: { pointAtCenter: true }, autoAdjustOverflow: true });
  fireEvent.focus(screen.getByRole('button'));
  const popup = screen.getByRole('tooltip');
  expect(popup.getAttribute('data-placement')).toBe('top');
  expect(popup.style.top).toBe('220px');
  height = 400;
  fireEvent(window, new Event('resize'));
  expect(popup.getAttribute('data-placement')).toBe('bottom');
  expect(popup.style.top).toBe('290px');
  expect(popup.hasAttribute('arrow')).toBe(false);
  expect(popup.hasAttribute('autoAdjustOverflow')).toBe(false);
});
it('shows a decorative arrow by default and hides it when disabled', () => {
  const { rerender } = example({ defaultOpen: true, placement: 'right' });
  expect(screen.getByRole('tooltip').getAttribute('data-placement')).toBe('right');
  expect(screen.getByRole('tooltip').querySelector('[data-ui="tooltip-arrow"]')?.getAttribute('aria-hidden')).toBe('true');
  rerender(<adapters.TooltipAdapter content="Подсказка" open arrow={false}>{trigger => <button {...trigger}>Цель</button>}</adapters.TooltipAdapter>);
  expect(screen.getByRole('tooltip').querySelector('[data-ui="tooltip-arrow"]')).toBeNull();
});
function example(props = {}) {
  expect(adapters).toHaveProperty('TooltipAdapter');
  return render(<adapters.TooltipAdapter content="Подсказка" {...props}>{trigger => <button {...trigger}>Цель</button>}</adapters.TooltipAdapter>);
}
it('opens on focus and dismisses with Escape until a fresh interaction', () => {
  example();
  const target = screen.getByRole('button');
  fireEvent.focus(target);
  expect(screen.getByRole('tooltip').textContent).toBe('Подсказка');
  expect(target.getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip').id);
  fireEvent.keyDown(target, { key: 'Escape' });
  expect(screen.queryByRole('tooltip')).toBeNull();
  fireEvent.blur(target); fireEvent.focus(target);
  expect(screen.getByRole('tooltip')).toBeTruthy();
});
it('retains hovered content and keeps focus active after pointer departure', () => {
  example(); const target = screen.getByRole('button');
  fireEvent.pointerEnter(target); const popup = screen.getByRole('tooltip');
  fireEvent.pointerEnter(popup); fireEvent.pointerLeave(target, { relatedTarget: popup });
  expect(screen.getByRole('tooltip')).toBeTruthy();
  fireEvent.focus(target); fireEvent.pointerLeave(popup);
  expect(screen.getByRole('tooltip')).toBeTruthy();
});
it('does not open when disabled and preserves controlled ownership', () => {
  const { rerender } = example({ disabled: true });
  fireEvent.focus(screen.getByRole('button')); expect(screen.queryByRole('tooltip')).toBeNull();
  const change = vi.fn();
  rerender(<adapters.TooltipAdapter content="Подсказка" open={false} onOpenChange={change}>{trigger => <button {...trigger}>Цель</button>}</adapters.TooltipAdapter>);
  fireEvent.focus(screen.getByRole('button')); expect(change).toHaveBeenCalledWith(true);
  expect(screen.queryByRole('tooltip')).toBeNull();
});
it('clears popup hover when Escape removes hovered content', () => {
  vi.useFakeTimers(); example(); const target = screen.getByRole('button');
  fireEvent.pointerEnter(target); fireEvent.pointerEnter(screen.getByRole('tooltip'));
  fireEvent.pointerLeave(target); fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.focus(target); expect(screen.getByRole('tooltip')).toBeTruthy();
  fireEvent.blur(target); act(() => vi.advanceTimersByTime(100));
  expect(screen.queryByRole('tooltip')).toBeNull();
});
it('uses current controlled state when a delayed leave closes the popup', () => {
  vi.useFakeTimers(); const change = vi.fn(); const { rerender } = example({ open: false, onOpenChange: change });
  const target = screen.getByRole('button'); fireEvent.pointerEnter(target); fireEvent.pointerLeave(target);
  rerender(<adapters.TooltipAdapter content="Подсказка" open onOpenChange={change}>{trigger => <button {...trigger}>Цель</button>}</adapters.TooltipAdapter>);
  act(() => vi.advanceTimersByTime(100)); expect(change).toHaveBeenLastCalledWith(false);
});
