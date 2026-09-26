import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BadgeAdapter } from '../../../src/DataDisplay/Badge/BadgeAdapter.tsx';

afterEach(cleanup);

describe('BadgeAdapter', () => {
  it('renders standalone text including zero and forwards root properties', () => {
    const root = createRef<HTMLSpanElement>();
    render(<BadgeAdapter ref={root} className="custom" data-test-id="count">{0}</BadgeAdapter>);

    expect(root.current?.textContent).toBe('0');
    expect(root.current?.getAttribute('data-mode')).toBe('standalone');
    expect(root.current?.getAttribute('data-test-id')).toBe('count');
    expect(root.current?.className).toBe('custom');
    expect(root.current?.tagName).toBe('SPAN');
  });

  it('places a decorative icon before or after the label', () => {
    const { rerender } = render(<BadgeAdapter icon={<svg data-test-id="icon" />}>Beta</BadgeAdapter>);
    let badge = screen.getByText('Beta').closest('[data-ui="badge"]');
    expect(badge?.children[0]?.getAttribute('data-slot')).toBe('icon');
    expect(badge?.children[0]?.getAttribute('aria-hidden')).toBe('true');
    expect(badge?.children[1]?.getAttribute('data-slot')).toBe('label');

    rerender(<BadgeAdapter icon={<svg data-test-id="icon" />} iconPosition="end">Beta</BadgeAdapter>);
    badge = screen.getByText('Beta').closest('[data-ui="badge"]');
    expect(badge?.children[0]?.getAttribute('data-slot')).toBe('label');
    expect(badge?.children[1]?.getAttribute('data-slot')).toBe('icon');
  });

  it('overlays a target without changing its click or focus behavior', () => {
    const click = vi.fn();
    const root = createRef<HTMLSpanElement>();
    render(
      <BadgeAdapter
        ref={root}
        className="custom"
        data-test-id="inbox-badge"
        target={<button type="button" aria-label="Inbox, 0 unread" onClick={click}>Inbox</button>}
      >
        {0}
      </BadgeAdapter>,
    );

    const button = screen.getByRole('button', { name: 'Inbox, 0 unread' });
    button.focus();
    fireEvent.click(button);

    expect(document.activeElement).toBe(button);
    expect(click).toHaveBeenCalledOnce();
    expect(root.current?.getAttribute('data-mode')).toBe('overlay');
    expect(root.current?.getAttribute('data-test-id')).toBe('inbox-badge');
    expect(root.current?.className).toBe('custom');
    expect(root.current?.hasAttribute('tabindex')).toBe(false);
    expect(root.current?.hasAttribute('aria-live')).toBe(false);
    expect(screen.getByText('0').closest('[data-slot="badge"]')?.getAttribute('aria-hidden')).toBe('true');
  });
});
