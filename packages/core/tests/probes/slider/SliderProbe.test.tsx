import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { SliderProbe } from './SliderProbe.tsx';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const slider = () => screen.getByRole('slider', { name: 'Volume' });
const value = () => slider().getAttribute('aria-valuenow');
function geometry(node: HTMLElement, width = 100) {
  vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({
    left: 10,
    width,
    right: 10 + width,
    top: 0,
    bottom: 20,
    height: 20,
    x: 10,
    y: 0,
    toJSON() {},
  });
}
function pointer(node: HTMLElement, type: string, clientX: number, pointerId = 1, button = 0) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, button });
  Object.defineProperties(event, { pointerId: { value: pointerId }, isPrimary: { value: true } });
  return fireEvent(node, event);
}

it('snaps the initial value and publishes the same value to ARIA, output and the form', () => {
  render(
    <form>
      <SliderProbe defaultValue={4} min={1} max={6} step={2} />
    </form>,
  );
  expect(value()).toBe('5');
  expect(slider().getAttribute('aria-valuemin')).toBe('1');
  expect(slider().getAttribute('aria-valuemax')).toBe('5');
  expect(slider().getAttribute('aria-orientation')).toBe('horizontal');
  expect(screen.getByRole('status').textContent).toBe('5');
  expect(new FormData(document.querySelector('form')!).get('volume')).toBe('5');
});

it('uses arrows and Home/End without wrapping or submitting', async () => {
  const submit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={submit}>
      <SliderProbe defaultValue={3} min={1} max={6} step={2} />
    </form>,
  );
  slider().focus();
  await userEvent.keyboard('{ArrowRight}');
  expect(value()).toBe('5');
  await userEvent.keyboard('{ArrowUp}');
  expect(value()).toBe('5');
  await userEvent.keyboard('{ArrowDown}');
  expect(value()).toBe('3');
  await userEvent.keyboard('{ArrowLeft}');
  expect(value()).toBe('1');
  await userEvent.keyboard('{ArrowLeft}');
  expect(value()).toBe('1');
  await userEvent.keyboard('{End}');
  expect(value()).toBe('5');
  await userEvent.keyboard('{Home}');
  expect(value()).toBe('1');
  expect(submit).not.toHaveBeenCalled();
});

it('keeps decimal stepping stable', async () => {
  render(<SliderProbe defaultValue={0.1} min={0} max={0.3} step={0.1} />);
  slider().focus();
  await userEvent.keyboard('{ArrowRight}{ArrowRight}');
  expect(value()).toBe('0.3');
  await userEvent.keyboard('{ArrowLeft}');
  expect(value()).toBe('0.2');
});

it('preserves cancelled, composing, modified and unrelated keys', () => {
  const { rerender } = render(<SliderProbe defaultValue={4} />);
  expect(fireEvent.keyDown(slider(), { key: 'ArrowRight', isComposing: true })).toBe(true);
  for (const modifier of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey']) {
    expect(fireEvent.keyDown(slider(), { key: 'ArrowRight', [modifier]: true })).toBe(true);
  }
  for (const key of ['Tab', 'Escape', 'a', 'Enter']) {
    expect(fireEvent.keyDown(slider(), { key })).toBe(true);
  }
  expect(value()).toBe('4');
  rerender(<SliderProbe defaultValue={4} onKeyDown={(event) => event.preventDefault()} />);
  fireEvent.keyDown(slider(), { key: 'ArrowRight' });
  expect(value()).toBe('4');
});

it('maps track coordinates to steps, follows only the active pointer and stops after release', () => {
  render(<SliderProbe min={1} max={6} step={2} />);
  geometry(slider());
  pointer(slider(), 'pointerdown', 70);
  expect(value()).toBe('5');
  expect(document.activeElement).toBe(slider());
  pointer(slider(), 'pointermove', -50, 2);
  expect(value()).toBe('5');
  pointer(slider(), 'pointermove', -50);
  expect(value()).toBe('1');
  pointer(slider(), 'pointermove', 500);
  expect(value()).toBe('5');
  pointer(slider(), 'pointerup', 500);
  pointer(slider(), 'pointermove', 10);
  expect(value()).toBe('5');
});

it('stops a drag on cancellation or loss of capture and ignores right-click and zero-width tracks', () => {
  render(<SliderProbe defaultValue={2} min={0} max={10} />);
  geometry(slider());
  pointer(slider(), 'pointerdown', 110, 1, 2);
  expect(value()).toBe('2');
  pointer(slider(), 'pointerdown', 60);
  expect(value()).toBe('5');
  pointer(slider(), 'pointercancel', 60);
  pointer(slider(), 'pointermove', 110);
  expect(value()).toBe('5');
  pointer(slider(), 'pointerdown', 80);
  pointer(slider(), 'lostpointercapture', 80);
  pointer(slider(), 'pointermove', 10);
  expect(value()).toBe('7');
  vi.restoreAllMocks();
  geometry(slider(), 0);
  pointer(slider(), 'pointerdown', 110);
  expect(value()).toBe('7');
});

it('blocks disabled interaction, removes the tab stop and omits the value from form submission', () => {
  const { rerender } = render(
    <form>
      <SliderProbe defaultValue={4} disabled />
    </form>,
  );
  geometry(slider());
  fireEvent.keyDown(slider(), { key: 'ArrowRight' });
  pointer(slider(), 'pointerdown', 110);
  expect(value()).toBe('4');
  expect(slider().tabIndex).toBe(-1);
  expect(slider().getAttribute('aria-disabled')).toBe('true');
  expect(new FormData(document.querySelector('form')!).has('volume')).toBe(false);
  rerender(
    <form>
      <SliderProbe defaultValue={4} />
    </form>,
  );
  pointer(slider(), 'pointerdown', 60);
  expect(value()).toBe('50');
  rerender(
    <form>
      <SliderProbe defaultValue={4} disabled />
    </form>,
  );
  pointer(slider(), 'pointermove', 110);
  expect(value()).toBe('50');
});

it('resets to the initial stepped value and respects cancellation', async () => {
  let cancel = false;
  render(
    <form
      onReset={(event) => {
        if (cancel) {
          event.preventDefault();
        }
      }}
    >
      <SliderProbe defaultValue={3} min={1} max={6} step={2} />
      <button type="reset">Reset</button>
    </form>,
  );
  slider().focus();
  await userEvent.keyboard('{End}');
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(value()).toBe('3');
  slider().focus();
  await userEvent.keyboard('{End}');
  cancel = true;
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(value()).toBe('5');
});
