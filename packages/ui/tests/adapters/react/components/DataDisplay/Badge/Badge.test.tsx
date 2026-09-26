import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Badge } from '@dreadnought/ui/react';

afterEach(cleanup);

describe('Badge', () => {
  it('styles a standalone label with the solid appearance by default', () => {
    const root = createRef<HTMLSpanElement>();
    render(<Badge ref={root} className="custom" data-test-id="release">Beta</Badge>);

    expect(root.current?.textContent).toBe('Beta');
    expect(root.current?.getAttribute('data-mode')).toBe('standalone');
    expect(root.current?.getAttribute('data-appearance')).toBe('solid');
    expect(root.current?.getAttribute('data-test-id')).toBe('release');
    expect(root.current?.className).toContain('custom');
    expect(root.current?.className).toContain('dreadnought-text-badge');
  });

  it('places an outlined badge over an interactive target without changing its action', () => {
    const onClick = vi.fn();
    render(
      <Badge appearance="outline" target={<button type="button" aria-label="Inbox, 0 unread" onClick={onClick}>Inbox</button>}>
        {0}
      </Badge>,
    );

    const button = screen.getByRole('button', { name: 'Inbox, 0 unread' });
    button.focus();
    fireEvent.click(button);

    expect(document.activeElement).toBe(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByText('0').closest('[data-slot="badge"]')?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('0').closest('[data-ui="badge"]')?.getAttribute('data-appearance')).toBe('outline');
  });

  it('keeps icon placement in the styled facade', () => {
    render(<Badge icon={<svg />} iconPosition="end">New</Badge>);

    const badge = screen.getByText('New').closest('[data-ui="badge"]');
    expect(badge?.children[0]?.getAttribute('data-slot')).toBe('label');
    expect(badge?.children[1]?.getAttribute('data-slot')).toBe('icon');
  });
});
