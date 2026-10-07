import { createRef } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SliderAdapter } from '../../../src/Fields/Slider/SliderAdapter.tsx';

afterEach(cleanup);

function pointer(node: Element, type: string, x: number, id = 1, extra: MouseEventInit = {}) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, button: 0, ...extra });
  Object.defineProperties(event, { pointerId: { value: id }, isPrimary: { value: id === 1 } });
  fireEvent(node, event);
}
function geometry(width = 100) {
  const root = document.querySelector('[data-ui="slider"]') as HTMLDivElement;
  const rail = document.querySelector('[data-slot="rail"]')!;
  vi.spyOn(rail, 'getBoundingClientRect').mockReturnValue({ left: 0, right: width, top: 0, bottom: 4, width, height: 4, x: 0, y: 0, toJSON() {} });
  return root;
}
const current = () => screen.getByRole('slider').getAttribute('aria-valuenow');

it('uses one primary pointer, focuses the thumb and clips coordinates', () => {
  render(<SliderAdapter max={10} />);
  const root = geometry();
  pointer(root, 'pointerdown', 40);
  pointer(root, 'pointermove', 90, 2);
  expect(current()).toBe('4');
  expect(document.activeElement).toBe(screen.getByRole('slider'));
  pointer(root, 'pointermove', 200);
  expect(current()).toBe('10');
  pointer(root, 'pointermove', -10);
  expect(current()).toBe('0');
});

it.each(['pointerup', 'pointercancel', 'lostpointercapture'])('stops drag after %s', event => {
  render(<SliderAdapter max={10} />);
  const root = geometry();
  pointer(root, 'pointerdown', 40);
  pointer(root, event, 40);
  pointer(root, 'pointermove', 90);
  expect(current()).toBe('4');
});

it('stops drag on blur and reset without rolling back accepted input', async () => {
  render(<form><SliderAdapter max={10} defaultValue={2} /></form>);
  const root = geometry();
  pointer(root, 'pointerdown', 40);
  fireEvent.blur(screen.getByRole('slider'));
  pointer(root, 'pointermove', 90);
  expect(current()).toBe('4');
  pointer(root, 'pointerdown', 50);
  await act(async () => document.querySelector('form')!.reset());
  pointer(root, 'pointermove', 90);
  expect(current()).toBe('2');
});

it('keeps disabled input out of forms and stops an ongoing drag', () => {
  const changed = vi.fn();
  const { rerender } = render(<form><SliderAdapter name="v" max={10} onValueChange={changed} /></form>);
  const root = geometry();
  pointer(root, 'pointerdown', 40);
  rerender(<form><SliderAdapter disabled name="v" max={10} onValueChange={changed} /></form>);
  pointer(root, 'pointermove', 90);
  expect(current()).toBe('4');
  expect(changed.mock.calls).toEqual([[4]]);
  expect(new FormData(document.querySelector('form')!).has('v')).toBe(false);
});

it('does not change on a zero-width rail or non-left press', () => {
  render(<SliderAdapter max={10} defaultValue={2} />);
  const root = geometry(0);
  pointer(root, 'pointerdown', 40);
  expect(current()).toBe('2');
  vi.restoreAllMocks();
  geometry();
  pointer(root, 'pointerdown', 40, 1, { button: 2 });
  expect(current()).toBe('2');
});

it('honors thumb and root consumer cancellation with composed handlers', () => {
  const calls: string[] = [];
  render(<SliderAdapter defaultValue={2} onPointerDown={event => { calls.push('thumb'); event.preventDefault(); }}
    onKeyDown={() => calls.push('key')} slotProps={{ root: { onPointerDown: () => calls.push('root') },
      thumb: { onPointerDown: () => calls.push('slot'), onKeyDown: event => event.preventDefault() } }} />);
  geometry();
  pointer(screen.getByRole('slider'), 'pointerdown', 40);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  expect(calls).toEqual(['thumb', 'slot', 'root', 'key']);
  expect(current()).toBe('2');
});

it('does not start drag when the root handler cancels', () => {
  render(<SliderAdapter max={10} slotProps={{ root: { onPointerDown: event => event.preventDefault() } }} />);
  const root = geometry();
  pointer(root, 'pointerdown', 50);
  pointer(root, 'pointermove', 90);
  expect(current()).toBe('0');
});

it('reflects dynamic fieldset disabled semantics and re-enables input', async () => {
  render(<form><fieldset><SliderAdapter name="v" defaultValue={2} /></fieldset></form>);
  const fieldset = document.querySelector('fieldset')!;
  await act(async () => { fieldset.disabled = true; });
  await waitFor(() => expect(screen.getByRole('slider').getAttribute('tabindex')).toBe('-1'));
  expect(screen.getByRole('slider').getAttribute('aria-disabled')).toBe('true');
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  expect(current()).toBe('2');
  expect(new FormData(document.querySelector('form')!).has('v')).toBe(false);
  await act(async () => { fieldset.disabled = false; });
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  expect(current()).toBe('3');
  expect(screen.getByRole('slider').getAttribute('tabindex')).toBe('0');
});

it('honors the first-legend exception but not nested disabled fieldsets', () => {
  const { rerender } = render(<fieldset disabled><legend><SliderAdapter defaultValue={2} /></legend></fieldset>);
  expect(screen.getByRole('slider').getAttribute('aria-disabled')).toBe('false');
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
  expect(current()).toBe('3');
  rerender(<fieldset disabled><legend><fieldset disabled><SliderAdapter defaultValue={2} /></fieldset></legend></fieldset>);
  expect(screen.getByRole('slider').getAttribute('aria-disabled')).toBe('true');
});

it('releases pointer capture when fieldset is disabled during drag', async () => {
  render(<fieldset><SliderAdapter max={10} /></fieldset>);
  const root = geometry();
  let captured = false;
  for (const node of [root, screen.getByRole('slider') as HTMLDivElement]) {
    node.setPointerCapture = () => { captured = true; };
    node.hasPointerCapture = () => captured;
    node.releasePointerCapture = () => { captured = false; };
  }
  pointer(root, 'pointerdown', 40);
  expect(captured).toBe(true);
  await act(async () => { document.querySelector('fieldset')!.disabled = true; });
  pointer(root, 'pointermove', 90);
  expect(captured).toBe(false);
  expect(current()).toBe('4');
});

it('preserves the thumb callback ref and its cleanup across updates', () => {
  const nodes: (HTMLDivElement | null)[] = [];
  let cleanups = 0;
  const ref = (node: HTMLDivElement | null) => { nodes.push(node); return () => { cleanups++; }; };
  const { rerender, unmount } = render(<SliderAdapter ref={ref} value={2} />);
  const thumb = screen.getByRole('slider');
  rerender(<SliderAdapter ref={ref} value={3} />);
  expect(nodes).toEqual([thumb]);
  unmount();
  expect(cleanups).toBe(1);
});

it('enforces semantics and the hidden field value despite slot overrides', () => {
  const ref = createRef<HTMLDivElement>();
  render(<form><SliderAdapter ref={ref} id="v" aria-label="Volume" name="v" defaultValue={2}
    slotProps={{ thumb: { role: 'button', 'aria-valuenow': 99, tabIndex: 8 }, field: { type: 'text', value: 90, name: 'other' } }}
    renderThumb={props => <div {...props} data-custom="yes" />} /></form>);
  expect(ref.current).toBe(screen.getByRole('slider', { name: 'Volume' }));
  expect(current()).toBe('2');
  expect(ref.current?.getAttribute('tabindex')).toBe('0');
  expect(new FormData(document.querySelector('form')!).get('v')).toBe('2');
  expect(screen.queryByRole('textbox')).toBeNull();
});

it('keeps public and thumb-slot handlers on the actual pointer capture target', () => {
  const calls: string[] = [];
  render(<SliderAdapter max={10} onPointerMove={event => { calls.push('move'); event.preventDefault(); }}
    onPointerUp={() => calls.push('up')} onPointerCancel={() => calls.push('cancel')}
    onLostPointerCapture={() => calls.push('lost')}
    slotProps={{ thumb: { onPointerMove: () => calls.push('slot-move'), onPointerUp: () => calls.push('slot-up'),
      onPointerCancel: () => calls.push('slot-cancel'), onLostPointerCapture: () => calls.push('slot-lost') } }} />);
  const root = geometry();
  const thumb = screen.getByRole('slider') as HTMLDivElement;
  let capturedTarget: Element = root;
  root.setPointerCapture = () => { capturedTarget = root; };
  thumb.setPointerCapture = () => { capturedTarget = thumb; };
  pointer(thumb, 'pointerdown', 40);
  pointer(capturedTarget, 'pointermove', 90);
  expect(current()).toBe('4');
  pointer(capturedTarget, 'pointerup', 90);
  pointer(thumb, 'pointerdown', 40);
  pointer(capturedTarget, 'pointercancel', 40);
  pointer(thumb, 'pointerdown', 40);
  pointer(capturedTarget, 'lostpointercapture', 40);
  expect(calls).toEqual(['move', 'slot-move', 'up', 'slot-up', 'cancel', 'slot-cancel', 'lost', 'slot-lost']);
});

it('does not duplicate public callbacks when pointer events originate on the thumb', () => {
  const calls: string[] = [];
  render(<SliderAdapter max={10} onPointerMove={() => calls.push('move')} onPointerUp={() => calls.push('up')} />);
  geometry();
  const thumb = screen.getByRole('slider');
  pointer(thumb, 'pointerdown', 40);
  pointer(thumb, 'pointermove', 50);
  pointer(thumb, 'pointerup', 50);
  expect(calls).toEqual(['move', 'up']);
});
