import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import * as unstyled from '../../../src/unstyled.ts';

afterEach(cleanup);
it('exports the unstyled progress adapter', () => {
  expect(unstyled).toHaveProperty('ProgressAdapter');
});
it('keeps exact geometry, core ARIA and ref while updating', () => {
  expect(unstyled).toHaveProperty('ProgressAdapter');
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(<unstyled.ProgressAdapter value={3} max={8} ref={ref} aria-label="Загрузка"
    id="upload" aria-describedby="hint" aria-valuetext="Три из восьми" className="local"
    slotClassNames={{ fill: 'my-fill', label: 'my-label' }} />);
  const root = screen.getByRole('progressbar', { name: 'Загрузка' });
  expect(ref.current).toBe(root);
  expect(root.getAttribute('aria-valuenow')).toBe('3');
  expect(root.getAttribute('aria-valuemax')).toBe('8');
  expect(root.getAttribute('aria-describedby')).toBe('hint');
  expect(root.getAttribute('aria-valuetext')).toBe('Три из восьми');
  expect(root.id).toBe('upload');
  expect(root.className).toBe('local');
  expect(root.querySelector<HTMLElement>('[data-slot="fill"]')!.style.width).toBe('37.5%');
  expect(root.querySelector('[data-slot="fill"]')!.className).toBe('my-fill');
  expect(root.querySelector('[data-slot="label"]')!.className).toBe('my-label');
  expect(root.textContent).toBe('38%');
  rerender(<unstyled.ProgressAdapter value={20} max={8} aria-label="Загрузка" showPercent={false} />);
  expect(root.getAttribute('aria-valuenow')).toBe('8');
  expect(root.querySelector<HTMLElement>('[data-slot="fill"]')!.style.width).toBe('100%');
  expect(root.querySelector('[data-slot="label"]')).toBeNull();
  rerender(<unstyled.ProgressAdapter value={-1} max={8} aria-label="Загрузка" />);
  expect(root.getAttribute('aria-valuenow')).toBe('0');
  expect(root.querySelector<HTMLElement>('[data-slot="fill"]')!.style.width).toBe('0%');
});
it('cannot replace core semantics through untyped props', () => {
  expect(unstyled).toHaveProperty('ProgressAdapter');
  const bad = { role: 'button', 'aria-valuenow': 99, 'aria-valuemax': 200, 'aria-valuemin': -5 } as any;
  render(<unstyled.ProgressAdapter {...bad} value={3} max={8} aria-label="Загрузка" />);
  const root = screen.getByRole('progressbar');
  expect(root.getAttribute('aria-valuenow')).toBe('3');
  expect(root.getAttribute('aria-valuemax')).toBe('8');
  expect(root.getAttribute('aria-valuemin')).toBe('0');
});
it('defaults to zero with a visible percent and no theme classes', () => {
  expect(unstyled).toHaveProperty('ProgressAdapter');
  render(<unstyled.ProgressAdapter aria-label="Загрузка" />);
  const root = screen.getByRole('progressbar');
  expect(root.getAttribute('aria-valuenow')).toBe('0');
  expect(root.getAttribute('aria-valuemax')).toBe('100');
  expect(root.textContent).toBe('0%');
  expect(root.className).toBe('');
  expect(root.querySelector('[data-slot="track"]')!.getAttribute('aria-hidden')).toBe('true');
});
