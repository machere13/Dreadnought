import { createRef, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { SliderAdapter } from '../../../src/Fields/Slider/SliderAdapter.tsx';
import { useSlider } from '../../../src/Fields/Slider/useSlider.ts';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function pointer(node: Element, type: string, x: number, id = 1) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, button: 0 });
  Object.defineProperties(event, { pointerId: { value: id }, isPrimary: { value: id === 1 } });
  fireEvent(node, event);
}
function geometry() {
  vi.spyOn(document.querySelector('[data-slot="rail"]')!, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 100, top: 0, bottom: 4, width: 100, height: 4, x: 0, y: 0, toJSON() {},
  });
  return document.querySelector('[data-ui="slider"]')!;
}
const values = () => screen.getAllByRole('slider').map(node => node.getAttribute('aria-valuenow'));
const labels = { thumb: [{ 'aria-label': 'From' }, { 'aria-label': 'To' }] } as const;

it('exposes two independent thumb and field bindings through the existing hook', () => {
  function Probe() {
    const slider = useSlider({ range: true, defaultValue: [20, 80], name: 'interval' });
    return <form>{slider.thumbs.map((thumb, index) => <div key={index}>
      <div {...thumb.thumbProps} /><input {...thumb.fieldProps} />
    </div>)}</form>;
  }
  render(<Probe />);
  expect(values()).toEqual(['20', '80']);
  expect(new FormData(document.querySelector('form')!).getAll('interval')).toEqual(['20', '80']);
});

it('normalizes both values, labels the endpoints separately and forwards ref to the first', async () => {
  const ref = createRef<HTMLDivElement>();
  render(<form><SliderAdapter range ref={ref} id="interval" min={-2} max={3} step={2}
    defaultValue={[3, -1]} name="interval" slotProps={labels} /></form>);
  const [lower, upper] = screen.getAllByRole('slider');
  expect(values()).toEqual(['0', '2']);
  expect(ref.current).toBe(lower);
  expect(lower.getAttribute('aria-valuemax')).toBe('2');
  expect(upper.getAttribute('aria-valuemin')).toBe('0');
  expect(lower.id).toBe('interval');
  expect(upper.id).toBe('interval-end');
  expect(screen.getByRole('slider', { name: 'To' })).toBe(upper);
  expect(new FormData(document.querySelector('form')!).getAll('interval')).toEqual(['0', '2']);
  await userEvent.tab();
  expect(document.activeElement).toBe(lower);
  await userEvent.tab();
  expect(document.activeElement).toBe(upper);
});

it('moves only the focused endpoint and updates the accessible bounds without crossing', () => {
  const changed = vi.fn();
  render(<SliderAdapter range defaultValue={[2, 8]} max={10} step={2} onValueChange={changed} />);
  const [lower, upper] = screen.getAllByRole('slider');
  fireEvent.keyDown(lower, { key: 'ArrowRight' });
  expect(values()).toEqual(['4', '8']);
  expect(upper.getAttribute('aria-valuemin')).toBe('4');
  fireEvent.keyDown(lower, { key: 'End' });
  fireEvent.keyDown(lower, { key: 'ArrowRight' });
  expect(values()).toEqual(['8', '8']);
  fireEvent.keyDown(upper, { key: 'Home' });
  expect(changed.mock.calls).toEqual([[[4, 8]], [[8, 8]]]);
  fireEvent.keyDown(lower, { key: 'Home' });
  fireEvent.keyDown(upper, { key: 'ArrowLeft' });
  expect(values()).toEqual(['0', '6']);
});

it('selects the nearest thumb on the rail and retains its identity during crossing drag', () => {
  render(<SliderAdapter range defaultValue={[2, 8]} max={10} />);
  const root = geometry();
  const [lower, upper] = screen.getAllByRole('slider');
  pointer(root, 'pointerdown', 30);
  expect(values()).toEqual(['3', '8']);
  expect(document.activeElement).toBe(lower);
  pointer(lower, 'pointermove', 90);
  expect(values()).toEqual(['8', '8']);
  pointer(lower, 'pointerup', 90);
  pointer(root, 'pointerdown', 100);
  expect(values()).toEqual(['8', '10']);
  expect(document.activeElement).toBe(upper);
  pointer(upper, 'pointermove', -10);
  expect(values()).toEqual(['8', '8']);
});

it('honors the pressed thumb even when the other thumb is nearer', () => {
  render(<SliderAdapter range defaultValue={[4, 5]} max={10} />);
  geometry();
  const [lower, upper] = screen.getAllByRole('slider');
  pointer(lower, 'pointerdown', 52);
  pointer(lower, 'pointermove', 20);
  expect(values()).toEqual(['2', '5']);
  expect(document.activeElement).toBe(lower);
  pointer(lower, 'pointerup', 20);
  pointer(upper, 'pointerdown', 22);
  pointer(upper, 'pointermove', 80);
  expect(values()).toEqual(['2', '8']);
});

it('allows coincident endpoints to separate in either direction', () => {
  render(<SliderAdapter range defaultValue={[5, 5]} max={10} />);
  const root = geometry();
  pointer(root, 'pointerdown', 70);
  expect(values()).toEqual(['5', '7']);
  pointer(root, 'pointerup', 70);
  pointer(root, 'pointerdown', 30);
  expect(values()).toEqual(['3', '7']);
});

it('keeps the accepted pair, track and form when controlled updates are refused', () => {
  const changed = vi.fn();
  render(<form><SliderAdapter range value={[2, 8]} max={10} name="interval" onValueChange={changed} /></form>);
  fireEvent.keyDown(screen.getAllByRole('slider')[1], { key: 'ArrowLeft' });
  expect(changed.mock.calls).toEqual([[[2, 7]]]);
  expect(values()).toEqual(['2', '8']);
  expect((document.querySelector('[data-ui="slider"]') as HTMLElement).style.getPropertyValue('--dreadnought-slider-start')).toBe('20%');
  expect(new FormData(document.querySelector('form')!).getAll('interval')).toEqual(['2', '8']);
});

it('accepts controlled tuple updates and does not mutate the parent value', () => {
  function Controlled() {
    const [value, setValue] = useState<[number, number]>([2, 8]);
    return <SliderAdapter range value={Object.freeze(value)} onValueChange={setValue} />;
  }
  render(<Controlled />);
  fireEvent.keyDown(screen.getAllByRole('slider')[0], { key: 'ArrowRight' });
  expect(values()).toEqual(['3', '8']);
});

it('resets the original pair on the current grid and stops drag without notification', async () => {
  const changed = vi.fn();
  const { rerender } = render(<form><SliderAdapter range defaultValue={[3, 9]} max={10} onValueChange={changed} /></form>);
  const root = geometry();
  pointer(root, 'pointerdown', 50);
  rerender(<form><SliderAdapter range defaultValue={[0, 2]} max={8} step={2} onValueChange={changed} /></form>);
  await act(async () => document.querySelector('form')!.reset());
  pointer(root, 'pointermove', 90);
  expect(values()).toEqual(['4', '8']);
  expect(changed.mock.calls).toEqual([[[5, 9]]]);
});

it('cancels per-thumb input and excludes both fields when disabled through fieldset', async () => {
  const calls: string[] = [];
  render(<form><fieldset><SliderAdapter range defaultValue={[2, 8]} name="interval" onKeyDown={() => calls.push('public')}
    slotProps={{ thumb: [{}, { onKeyDown: event => { calls.push('slot'); event.preventDefault(); } }] }} /></fieldset></form>);
  fireEvent.keyDown(screen.getAllByRole('slider')[1], { key: 'ArrowLeft' });
  expect(values()).toEqual(['2', '8']);
  expect(calls).toEqual(['public', 'slot']);
  await act(async () => { document.querySelector('fieldset')!.disabled = true; });
  expect(screen.getAllByRole('slider').map(node => node.tabIndex)).toEqual([-1, -1]);
  expect(new FormData(document.querySelector('form')!).getAll('interval')).toEqual([]);
});

it('renders each custom thumb once with its endpoint index and accepted value', () => {
  render(<SliderAdapter range defaultValue={[2, 8]} renderThumb={(props, value, index) =>
    <div {...props} data-endpoint={index}>{value}</div>} />);
  expect(screen.getAllByRole('slider').map(node => node.textContent)).toEqual(['2', '8']);
  expect(screen.getAllByRole('slider').map(node => node.getAttribute('data-endpoint'))).toEqual(['0', '1']);
});

it('starts an unspecified range at the grid edges and generates distinct shared slot IDs', () => {
  render(<SliderAdapter range min={1} max={6} step={2} slotProps={{ thumb: { id: 'thumb' }, field: { id: 'field' } }} />);
  expect(values()).toEqual(['1', '5']);
  expect(screen.getAllByRole('slider').map(node => node.id)).toEqual(['thumb', 'thumb-end']);
  expect(Array.from(document.querySelectorAll('input')).map(node => node.id)).toEqual(['field', 'field-end']);
});

it('uses explicit per-endpoint IDs unchanged', () => {
  render(<SliderAdapter range slotProps={{ thumb: [{ id: 'from' }, { id: 'to' }], field: [{ id: 'start' }, { id: 'end' }] }} />);
  expect(screen.getAllByRole('slider').map(node => node.id)).toEqual(['from', 'to']);
  expect(Array.from(document.querySelectorAll('input')).map(node => node.id)).toEqual(['start', 'end']);
});

it('does not reset canceled or controlled pairs through external forms', async () => {
  const { rerender } = render(<><form id="owner" onReset={event => event.preventDefault()} /><form id="second" />
    <SliderAdapter range form="owner" defaultValue={[2, 8]} name="interval" /></>);
  fireEvent.keyDown(screen.getAllByRole('slider')[0], { key: 'ArrowRight' });
  await act(async () => (document.getElementById('owner') as HTMLFormElement).reset());
  expect(values()).toEqual(['3', '8']);
  rerender(<><form id="old" /><form id="owner" /><SliderAdapter range form="owner" defaultValue={[2, 8]} name="interval" /></>);
  await act(async () => (document.getElementById('old') as HTMLFormElement).reset());
  expect(values()).toEqual(['3', '8']);
  await act(async () => (document.getElementById('owner') as HTMLFormElement).reset());
  expect(values()).toEqual(['2', '8']);
  rerender(<><form id="old" /><form id="owner" /><SliderAdapter range form="owner" value={[4, 7]} name="interval" /></>);
  await act(async () => (document.getElementById('owner') as HTMLFormElement).reset());
  expect(values()).toEqual(['4', '7']);
});

it.each(['pointerup', 'pointercancel', 'lostpointercapture'])('stops upper endpoint drag after %s', type => {
  render(<SliderAdapter range max={10} defaultValue={[2, 8]} />);
  const root = geometry();
  const upper = screen.getAllByRole('slider')[1];
  pointer(root, 'pointerdown', 90);
  pointer(upper, type, 90);
  pointer(root, 'pointermove', 60);
  expect(values()).toEqual(['2', '9']);
});

it('releases the upper captured thumb when disabled and removes both fields from submission', async () => {
  render(<form><fieldset><SliderAdapter range max={10} defaultValue={[2, 8]} name="interval" /></fieldset></form>);
  const root = geometry();
  const upper = screen.getAllByRole('slider')[1] as HTMLDivElement;
  let captured = false;
  upper.setPointerCapture = () => { captured = true; };
  upper.hasPointerCapture = () => captured;
  upper.releasePointerCapture = () => { captured = false; };
  pointer(root, 'pointerdown', 90);
  expect(captured).toBe(true);
  await act(async () => { document.querySelector('fieldset')!.disabled = true; });
  pointer(upper, 'pointermove', 60);
  expect(captured).toBe(false);
  expect(values()).toEqual(['2', '9']);
  expect(new FormData(document.querySelector('form')!).getAll('interval')).toEqual([]);
});
