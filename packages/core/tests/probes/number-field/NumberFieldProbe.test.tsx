import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { NumberFieldProbe } from './NumberFieldProbe.tsx';

afterEach(cleanup);
const input = () => screen.getByRole('spinbutton', { name: 'Quantity' }) as HTMLInputElement;
const increase = () => screen.getByRole('button', { name: 'Increase' });
const decrease = () => screen.getByRole('button', { name: 'Decrease' });
const displayed = () => screen.getByRole('status').textContent;

it('synchronizes custom step buttons with the field and form without submitting', async () => {
  const submit = vi.fn(event => event.preventDefault());
  render(<form onSubmit={submit}><NumberFieldProbe defaultValue={2} min={0} max={6} step={2} /></form>);
  await userEvent.click(increase());
  expect(input().value).toBe('4');
  expect(displayed()).toBe('4');
  expect(new FormData(input().form!).get('quantity')).toBe('4');
  expect(document.activeElement).toBe(input());
  await userEvent.click(decrease());
  expect(input().value).toBe('2');
  expect(displayed()).toBe('2');
  expect(submit).not.toHaveBeenCalled();
});

it('stops at aligned bounds and does not choose an off-step maximum', async () => {
  render(<NumberFieldProbe defaultValue={1} min={1} max={6} step={2} />);
  await userEvent.click(decrease());
  expect(input().value).toBe('1');
  await userEvent.click(increase());
  await userEvent.click(increase());
  await userEvent.click(increase());
  expect(input().value).toBe('5');
  expect(displayed()).toBe('5');
  expect(input().validity.valid).toBe(true);
});

it('steps decimal values without displaying floating point tails', async () => {
  render(<NumberFieldProbe defaultValue={0.1} min={0} max={0.3} step={0.1} />);
  await userEvent.click(increase());
  expect(input().value).toBe('0.2');
  await userEvent.click(increase());
  expect(input().value).toBe('0.3');
  await userEvent.click(increase());
  expect(input().value).toBe('0.3');
  await userEvent.click(decrease());
  expect(displayed()).toBe('0.2');
});

it('marks an invalid draft without silently clamping it and recovers by stepping', async () => {
  render(<NumberFieldProbe defaultValue={1} min={1} max={6} step={2} />);
  await userEvent.clear(input());
  await userEvent.type(input(), '4');
  expect(input().value).toBe('4');
  expect(displayed()).toBe('4');
  expect(input().validity.stepMismatch).toBe(true);
  expect(input().getAttribute('aria-invalid')).toBe('true');
  await userEvent.click(increase());
  expect(input().value).toBe('5');
  expect(input().getAttribute('aria-invalid')).toBe('false');
  await userEvent.clear(input());
  await userEvent.type(input(), '9');
  expect(input().value).toBe('9');
  expect(input().validity.rangeOverflow).toBe(true);
  expect(input().getAttribute('aria-invalid')).toBe('true');
  await userEvent.click(decrease());
  expect(input().value).toBe('5');
  expect(displayed()).toBe('5');
});

it('keeps an empty required value distinct from zero and starts at the minimum', async () => {
  render(<NumberFieldProbe min={5} max={9} step={2} required />);
  expect(input().value).toBe('');
  expect(displayed()).toBe('');
  expect(input().validity.valueMissing).toBe(true);
  expect(input().getAttribute('aria-invalid')).toBe('true');
  await userEvent.click(increase());
  expect(input().value).toBe('5');
  expect(displayed()).toBe('5');
  expect(input().getAttribute('aria-invalid')).toBe('false');
});

it('maps vertical arrows to a single step while preserving cursor keys, IME and cancellation', async () => {
  const view = (cancel: boolean) => <NumberFieldProbe defaultValue={2} min={0} max={6} step={2}
    onKeyDown={cancel ? (event: React.KeyboardEvent<HTMLInputElement>) => event.preventDefault() : undefined} />;
  const { rerender } = render(view(false));
  await userEvent.click(input());
  await userEvent.keyboard('{ArrowUp}');
  expect(displayed()).toBe('4');
  await userEvent.keyboard('{ArrowDown}');
  expect(displayed()).toBe('2');
  for (const key of ['Home', 'End', 'ArrowLeft', 'ArrowRight', 'Escape']) {
    expect(fireEvent.keyDown(input(), { key })).toBe(true);
  }
  expect(fireEvent.keyDown(input(), { key: 'ArrowUp', isComposing: true })).toBe(true);
  for (const key of ['ArrowUp', 'ArrowDown']) {
    for (const modifier of ['ctrlKey', 'altKey', 'metaKey', 'shiftKey']) {
      expect(fireEvent.keyDown(input(), { key, [modifier]: true })).toBe(true);
      expect(displayed()).toBe('2');
    }
  }
  expect(displayed()).toBe('2');
  rerender(view(true));
  await userEvent.keyboard('{ArrowUp}');
  expect(displayed()).toBe('2');
});

it.each(['disabled', 'readOnly'] as const)('does not let step buttons bypass %s', async flag => {
  render(<NumberFieldProbe defaultValue={2} {...{ [flag]: true }} />);
  await userEvent.click(increase());
  await userEvent.click(decrease());
  fireEvent.keyDown(input(), { key: 'ArrowUp' });
  expect(input().value).toBe('2');
  expect(displayed()).toBe('2');
  expect((increase() as HTMLButtonElement).disabled).toBe(true);
});

it('does not bypass a disabled fieldset even through direct keyboard dispatch', () => {
  render(<fieldset disabled><NumberFieldProbe defaultValue={2} /></fieldset>);
  fireEvent.keyDown(input(), { key: 'ArrowUp' });
  fireEvent.click(increase());
  expect(input().value).toBe('2');
  expect(displayed()).toBe('2');
});

it('synchronizes native form reset and respects a cancelled reset', async () => {
  let cancel = false;
  render(<form onReset={event => { if (cancel) event.preventDefault(); }}>
    <NumberFieldProbe defaultValue={2} min={0} max={6} step={2} />
    <button type="reset">Reset</button>
  </form>);
  await userEvent.click(increase());
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(input().value).toBe('2');
  expect(displayed()).toBe('2');
  expect(new FormData(input().form!).get('quantity')).toBe('2');
  await userEvent.click(increase());
  cancel = true;
  await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect(input().value).toBe('4');
  expect(displayed()).toBe('4');
});
