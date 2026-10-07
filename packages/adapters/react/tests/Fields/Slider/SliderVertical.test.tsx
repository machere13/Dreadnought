import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SliderAdapter } from '../../../src/Fields/Slider/SliderAdapter.tsx';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const values = () => screen.getAllByRole('slider').map(node => node.getAttribute('aria-valuenow'));
function geometry(height = 200) {
  vi.spyOn(document.querySelector('[data-slot="rail"]')!, 'getBoundingClientRect').mockReturnValue({
    left: 50, right: 54, width: 4, top: 100, bottom: 100 + height, height, x: 50, y: 100, toJSON() {},
  });
  return document.querySelector('[data-ui="slider"]')!;
}
function pointer(node: Element, type: string, y: number, x = 51) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
  Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true } });
  fireEvent(node, event);
}

it('maps bottom to minimum and top to maximum with clipping outside the rail', () => {
  render(<SliderAdapter orientation="vertical" />);
  const root = geometry();
  expect(screen.getByRole('slider').getAttribute('aria-orientation')).toBe('vertical');
  expect(root.getAttribute('data-orientation')).toBe('vertical');
  pointer(root, 'pointerdown', 250);
  expect(values()).toEqual(['25']);
  pointer(root, 'pointermove', 80);
  expect(values()).toEqual(['100']);
  pointer(root, 'pointermove', 320);
  expect(values()).toEqual(['0']);
});

it('ignores a zero-height vertical rail even when its width is non-zero', () => {
  const changed = vi.fn();
  render(<SliderAdapter orientation="vertical" defaultValue={30} onValueChange={changed} />);
  pointer(geometry(0), 'pointerdown', 100);
  expect(values()).toEqual(['30']);
  expect(changed).not.toHaveBeenCalled();
});

it('does not let horizontal arrows change a vertical value or consume those keys', () => {
  render(<SliderAdapter orientation="vertical" defaultValue={30} step={5} />);
  const thumb = screen.getByRole('slider');
  for (const key of ['ArrowLeft', 'ArrowRight']) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    fireEvent(thumb, event);
    expect(event.defaultPrevented).toBe(false);
  }
  expect(values()).toEqual(['30']);
  fireEvent.keyDown(thumb, { key: 'ArrowUp' });
  expect(values()).toEqual(['35']);
  fireEvent.keyDown(thumb, { key: 'ArrowDown' });
  expect(values()).toEqual(['30']);
  fireEvent.keyDown(thumb, { key: 'End' });
  expect(values()).toEqual(['100']);
  fireEvent.keyDown(thumb, { key: 'Home' });
  expect(values()).toEqual(['0']);
});

it('moves the closest range thumb on vertical pointer input without crossing it', () => {
  render(<SliderAdapter orientation="vertical" range defaultValue={[20, 80]} />);
  const root = geometry();
  const [lower, upper] = screen.getAllByRole('slider');
  pointer(root, 'pointerdown', 160);
  expect(values()).toEqual(['20', '70']);
  expect(document.activeElement).toBe(upper);
  pointer(upper, 'pointermove', 300);
  expect(values()).toEqual(['20', '20']);
  pointer(upper, 'pointerup', 300);
  pointer(root, 'pointerdown', 280);
  expect(values()).toEqual(['10', '20']);
  expect(document.activeElement).toBe(lower);
});

it('uses vertical arrows to choose only marks and restores form defaults', async () => {
  render(<form><SliderAdapter orientation="vertical" step={null} marks={{ 0: 'Low', 30: 'Medium', 100: 'High' }}
    defaultValue={30} name="amount" /></form>);
  const thumb = screen.getByRole('slider');
  fireEvent.keyDown(thumb, { key: 'ArrowUp' });
  expect(values()).toEqual(['100']);
  expect(new FormData(document.querySelector('form')!).get('amount')).toBe('100');
  fireEvent.click(screen.getByRole('button', { name: 'Low' }));
  expect(values()).toEqual(['0']);
  await act(async () => document.querySelector('form')!.reset());
  expect(values()).toEqual(['30']);
});

it('stops pointer capture when the orientation changes', () => {
  const { rerender } = render(<SliderAdapter orientation="vertical" />);
  const root = geometry();
  pointer(root, 'pointerdown', 250);
  expect(values()).toEqual(['25']);
  rerender(<SliderAdapter orientation="horizontal" />);
  pointer(root, 'pointermove', 150, 54);
  expect(values()).toEqual(['25']);
});
