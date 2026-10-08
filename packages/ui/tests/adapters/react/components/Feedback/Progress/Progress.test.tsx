import type { CSSProperties } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import * as ui from '../../../../../../src/adapters/react/index.ts';

afterEach(cleanup);
it('exports the ready progress', () => expect(ui).toHaveProperty('Progress'));
it('keeps status explicit and merges consumer classes and token overrides', () => {
  expect(ui).toHaveProperty('Progress');
  const { rerender } = render(
    <ui.Progress
      value={100}
      aria-label="Upload"
      className="local"
      slotClassNames={{ track: 't', fill: 'f', label: 'l' }}
      style={{ '--dreadnought-progress-fill': 'purple' } as CSSProperties}
    />,
  );
  const root = screen.getByRole('progressbar', { name: 'Upload' });
  expect(root.dataset.status).toBe('normal');
  expect(root.classList.contains('local')).toBe(true);
  expect(root.classList.length).toBeGreaterThan(1);
  for (const [slot, name] of [
    ['track', 't'],
    ['fill', 'f'],
    ['label', 'l'],
  ]) {
    expect(root.querySelector(`[data-slot="${slot}"]`)!.classList.contains(name)).toBe(true);
    expect(root.querySelector(`[data-slot="${slot}"]`)!.classList.length).toBeGreaterThan(1);
  }
  expect(root.style.getPropertyValue('--dreadnought-progress-fill')).toBe('purple');
  rerender(<ui.Progress value={100} status="error" aria-label="Upload" />);
  expect(root.dataset.status).toBe('error');
  expect(root.getAttribute('aria-valuenow')).toBe('100');
  rerender(<ui.Progress value={25} status="success" showPercent={false} aria-label="Upload" />);
  expect(root.dataset.status).toBe('success');
  expect(root.getAttribute('aria-valuenow')).toBe('25');
  expect(root.querySelector('[data-slot="label"]')).toBeNull();
});
