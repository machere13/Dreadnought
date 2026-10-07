import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SliderAdapter } from '../../../src/Fields/Slider/SliderAdapter.tsx';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const marks = { 0: 'Low', 30: 'Medium', 100: 'High' };
const values = () => screen.getAllByRole('slider').map(node => node.getAttribute('aria-valuenow'));

it('selects an off-grid mark without submitting its form and focuses the thumb', () => {
  render(<form><SliderAdapter name="amount" step={20} marks={{ 33: 'Third' }} /></form>);
  fireEvent.click(screen.getByRole('button', { name: 'Third' }));
  expect(values()).toEqual(['33']);
  expect(document.activeElement).toBe(screen.getByRole('slider'));
  expect(new FormData(document.querySelector('form')!).get('amount')).toBe('33');
});

it('gives every mark a unique ID when a common slot ID is supplied', () => {
  render(<SliderAdapter marks={marks} slotProps={{ mark: { id: 'level-mark' } }} />);
  const ids = screen.getAllByRole('button').map(node => node.id);
  expect(new Set(ids).size).toBe(3);
  expect(ids.every(id => id.startsWith('level-mark'))).toBe(true);
});

it('navigates only between irregular marks and resets to the normalized default', async () => {
  render(<form><SliderAdapter step={null} marks={marks} defaultValue={40} name="amount" /></form>);
  const thumb = screen.getByRole('slider');
  expect(values()).toEqual(['30']);
  fireEvent.keyDown(thumb, { key: 'ArrowRight' });
  expect(values()).toEqual(['100']);
  fireEvent.keyDown(thumb, { key: 'ArrowRight' });
  expect(values()).toEqual(['100']);
  fireEvent.keyDown(thumb, { key: 'Home' });
  expect(values()).toEqual(['0']);
  fireEvent.keyDown(thumb, { key: 'ArrowUp' });
  expect(values()).toEqual(['30']);
  fireEvent.keyDown(thumb, { key: 'End' });
  await act(async () => document.querySelector('form')!.reset());
  expect(values()).toEqual(['30']);
});

it('moves the nearest range thumb on mark clicks and preserves non-crossing keyboard input', () => {
  render(<SliderAdapter range step={null} marks={marks} defaultValue={[0, 100]} />);
  const [lower, upper] = screen.getAllByRole('slider');
  fireEvent.click(screen.getByRole('button', { name: 'Medium' }));
  expect(values()).toEqual(['30', '100']);
  expect(document.activeElement).toBe(lower);
  fireEvent.keyDown(lower, { key: 'End' });
  expect(values()).toEqual(['100', '100']);
  fireEvent.keyDown(upper, { key: 'Home' });
  expect(values()).toEqual(['100', '100']);
});

it('respects controlled refusal, disabled and canceled mark clicks', () => {
  const changed = vi.fn();
  const { rerender } = render(<SliderAdapter value={0} marks={marks} onValueChange={changed} />);
  fireEvent.click(screen.getByRole('button', { name: 'High' }));
  expect(changed).toHaveBeenCalledWith(100);
  expect(values()).toEqual(['0']);
  changed.mockClear();
  rerender(<SliderAdapter marks={marks} disabled onValueChange={changed} />);
  fireEvent.click(screen.getByRole('button', { name: 'High' }));
  expect(changed).not.toHaveBeenCalled();
  rerender(<SliderAdapter marks={marks} onValueChange={changed} slotProps={{ mark: { onClick: event => event.preventDefault() } }} />);
  fireEvent.click(screen.getByRole('button', { name: 'High' }));
  expect(changed).not.toHaveBeenCalled();
});

it('snaps pointer input to marks and exposes actual discrete bounds', () => {
  render(<SliderAdapter step={null} marks={{ 10: 'Start', 30: 'Middle', 80: 'End', 200: 'Outside' }} />);
  const thumb = screen.getByRole('slider');
  expect(thumb.getAttribute('aria-valuemin')).toBe('10');
  expect(thumb.getAttribute('aria-valuemax')).toBe('80');
  expect(screen.queryByText('Outside')).toBeNull();
  vi.spyOn(document.querySelector('[data-slot="rail"]')!, 'getBoundingClientRect').mockReturnValue({
    left: 0, width: 100, right: 100, top: 0, bottom: 4, height: 4, x: 0, y: 0, toJSON() {},
  });
  const event = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, clientX: 50, button: 0 });
  Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true } });
  fireEvent(document.querySelector('[data-ui="slider"]')!, event);
  expect(values()).toEqual(['30']);
});
