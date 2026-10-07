import { useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { useSlider } from '../../../src/Fields/Slider/useSlider.ts';
import type { UseSliderOptions } from '../../../src/Fields/Slider/slider.types.ts';

afterEach(cleanup);

function Probe(props: UseSliderOptions) {
  const slider = useSlider(props);
  return <><div {...slider.thumbProps} /><input {...slider.fieldProps} /><output>{slider.progress}</output></>;
}

it('uses decimal steps in keyboard input and form submission', async () => {
  render(<form><Probe aria-label="Volume" name="volume" min={0} max={0.4} step={0.1} defaultValue={0.2} /></form>);
  await userEvent.click(screen.getByRole('slider'));
  await userEvent.keyboard('{ArrowRight}');
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('0.3');
  expect(new FormData(document.querySelector('form')!).get('volume')).toBe('0.3');
});

it('normalizes negative values and an off-grid maximum without wrapping', () => {
  const changed = vi.fn();
  render(<Probe min={-2} max={3} step={2} defaultValue={-1} onValueChange={changed} />);
  const thumb = screen.getByRole('slider');
  expect(thumb.getAttribute('aria-valuenow')).toBe('0');
  expect(thumb.getAttribute('aria-valuemax')).toBe('2');
  fireEvent.keyDown(thumb, { key: 'End' });
  fireEvent.keyDown(thumb, { key: 'ArrowUp' });
  expect(changed.mock.calls).toEqual([[2]]);
  fireEvent.keyDown(thumb, { key: 'Home' });
  fireEvent.keyDown(thumb, { key: 'ArrowDown' });
  expect(thumb.getAttribute('aria-valuenow')).toBe('-2');
});

it('keeps fixed values finite and never emits an update', () => {
  const changed = vi.fn();
  render(<Probe min={4} max={4} defaultValue={8} onValueChange={changed} />);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' });
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('4');
  expect(screen.getByRole('status').textContent).toBe('0');
  expect(changed).not.toHaveBeenCalled();
});

it.each([{ min: NaN }, { max: Infinity }, { defaultValue: NaN }, { step: 0 }, { min: 4, max: 2 }])('rejects an invalid grid or value %o', props => {
  expect(() => render(<Probe {...props} />)).toThrow();
});

it('keeps the accepted controlled value, progress and form field when refused', () => {
  const changed = vi.fn();
  render(<form><Probe name="volume" value={2} onValueChange={changed} /></form>);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  expect(changed.mock.calls).toEqual([[3]]);
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('2');
  expect(screen.getByRole('status').textContent).toBe('0.02');
  expect(new FormData(document.querySelector('form')!).get('volume')).toBe('2');
});

it('updates when the controlled parent accepts', () => {
  function Controlled() {
    const [value, setValue] = useState(2);
    return <Probe value={value} onValueChange={setValue} />;
  }
  render(<Controlled />);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowUp' });
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('3');
});

it.each(['ctrlKey', 'altKey', 'shiftKey', 'metaKey', 'isComposing'])('does not intercept %s input', modifier => {
  render(<Probe defaultValue={2} />);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight', [modifier]: true });
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('2');
});

it('honors consumer cancellation and disabled input', () => {
  const { rerender } = render(<Probe defaultValue={2} onKeyDown={event => event.preventDefault()} />);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('2');
  rerender(<Probe disabled name="volume" defaultValue={2} />);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  expect(screen.getByRole('slider').getAttribute('tabindex')).toBe('-1');
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('2');
});

it('resets the original default on the current grid without notification', async () => {
  const changed = vi.fn();
  const { rerender } = render(<form><Probe defaultValue={3} onValueChange={changed} /></form>);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' });
  rerender(<form><Probe defaultValue={80} min={0} max={10} step={2} onValueChange={changed} /></form>);
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('10');
  await act(async () => document.querySelector('form')!.reset());
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('4');
  expect(changed.mock.calls).toEqual([[100]]);
});

it('ignores canceled resets and controlled resets', async () => {
  const changed = vi.fn();
  const { rerender } = render(<form onReset={event => event.preventDefault()}><Probe defaultValue={2} onValueChange={changed} /></form>);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  await act(async () => document.querySelector('form')!.reset());
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('3');
  rerender(<form><Probe value={8} onValueChange={changed} /></form>);
  await act(async () => document.querySelector('form')!.reset());
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('8');
  expect(changed.mock.calls).toEqual([[3]]);
});

it('resets only through the current external form owner', async () => {
  const { rerender } = render(<><form id="first" /><form id="second" /><Probe form="first" name="volume" defaultValue={2} /></>);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  expect(new FormData(document.getElementById('first') as HTMLFormElement).get('volume')).toBe('3');
  rerender(<><form id="first" /><form id="second" /><Probe form="second" name="volume" defaultValue={2} /></>);
  await act(async () => (document.getElementById('first') as HTMLFormElement).reset());
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('3');
  await act(async () => (document.getElementById('second') as HTMLFormElement).reset());
  expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('2');
});
