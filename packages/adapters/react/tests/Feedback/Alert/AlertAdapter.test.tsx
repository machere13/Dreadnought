import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AlertAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);

describe('AlertAdapter', () => {
  it('renders a warning with its content, decorative icon and action', () => {
    render(
      <AlertAdapter
        type="warning"
        title="Careful"
        description="Check tokens"
        action={<button type="button">Fix</button>}
        showIcon
        icon={<svg data-testid="graphic" />}
        slotClassNames={{ title: 'own-title', actions: 'own-actions' }}
        aria-label="Warning note"
      />,
    );

    const alert = screen.getByRole('alert', { name: 'Warning note' });
    expect(alert.getAttribute('data-type')).toBe('warning');
    expect(alert.querySelector('[data-slot="title"]')?.textContent).toBe('Careful');
    expect(alert.querySelector('[data-slot="title"]')?.className).toContain('own-title');
    expect(alert.querySelector('[data-slot="description"]')?.textContent).toBe('Check tokens');
    expect(alert.querySelector('[data-slot="icon"]')?.getAttribute('aria-hidden')).toBe('true');
    expect(alert.querySelector('[data-slot="actions"]')?.className).toContain('own-actions');
    expect(screen.getByRole('button', { name: 'Fix' })).not.toBeNull();
    expect([...alert.querySelectorAll('[data-slot]')].map((node) => node.getAttribute('data-slot')))
      .toEqual(['icon', 'title', 'description', 'actions']);
  });

  it('defaults to status and omits absent parts and hidden icons', () => {
    render(<AlertAdapter description="Saved" icon={<svg />} showIcon={false} />);

    const alert = screen.getByRole('status');
    expect(alert.getAttribute('data-type')).toBe('info');
    expect(alert.querySelector('[data-slot="title"]')).toBeNull();
    expect(alert.querySelector('[data-slot="icon"]')).toBeNull();
    expect(alert.querySelector('[data-slot="actions"]')).toBeNull();
    expect(alert.querySelector('[data-slot="description"]')?.textContent).toBe('Saved');
  });

  it('preserves an explicit role, native attributes, className and ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<AlertAdapter title="Notice" role="note" aria-label="Custom note" data-test="own" className="consumer" ref={ref} />);

    const alert = screen.getByRole('note', { name: 'Custom note' });
    expect(alert.getAttribute('data-test')).toBe('own');
    expect(alert.className).toBe('consumer');
    expect(ref.current).toBe(alert);
    expect(alert.querySelector('[data-slot="description"]')).toBeNull();
  });
});
