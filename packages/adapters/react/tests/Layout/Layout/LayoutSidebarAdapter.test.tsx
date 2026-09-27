import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LayoutSidebarAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);

describe('LayoutSidebarAdapter', () => {
  it('starts open and toggles its mounted body without submitting a form', () => {
    const submit = vi.fn((event: Event) => event.preventDefault());
    const change = vi.fn();
    const { container } = render(<form onSubmit={submit}>
      <LayoutSidebarAdapter onCollapsedChange={change}>
        <a href="/docs">Docs</a>
      </LayoutSidebarAdapter>
    </form>);
    const trigger = screen.getByRole('button', { name: 'Collapse sidebar' });
    const body = container.querySelector('[data-slot="body"]') as HTMLDivElement;
    expect(trigger.getAttribute('type')).toBe('button');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(body.id);
    expect(body.hidden).toBe(false);
    fireEvent.click(trigger);
    expect(change).toHaveBeenCalledExactlyOnceWith(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(body.hidden).toBe(true);
    expect(body.querySelector('a')?.getAttribute('href')).toBe('/docs');
    expect(submit).not.toHaveBeenCalled();
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.click(trigger);
    expect(body.hidden).toBe(false);
  });

  it('defaults to collapsed but gives an explicit controlled false precedence', () => {
    const { rerender, container } = render(<LayoutSidebarAdapter collapsed={false} defaultCollapsed>Sections</LayoutSidebarAdapter>);
    const body = container.querySelector('[data-slot="body"]') as HTMLDivElement;
    expect(body.hidden).toBe(false);
    rerender(<LayoutSidebarAdapter defaultCollapsed>Sections</LayoutSidebarAdapter>);
    expect(body.hidden).toBe(true);
  });

  it('requests a change without mutating controlled state until the parent rerenders', () => {
    const change = vi.fn();
    const { rerender, container } = render(<LayoutSidebarAdapter collapsed={false} onCollapsedChange={change}>Sections</LayoutSidebarAdapter>);
    const trigger = screen.getByRole('button', { name: 'Collapse sidebar' });
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(change.mock.calls).toEqual([[true], [true]]);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    rerender(<LayoutSidebarAdapter collapsed onCollapsedChange={change}>Sections</LayoutSidebarAdapter>);
    expect(container.querySelector('[data-slot="body"]')?.hasAttribute('hidden')).toBe(true);
  });

  it('forwards aside props/ref and consumer slot classes with custom trigger labels', () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<LayoutSidebarAdapter ref={ref} id="sidebar" aria-label="Sections" className="own-aside"
      slotClassNames={{ body: 'own-body', trigger: 'own-trigger' }} expandLabel="Open" collapseLabel="Close">
      Content
    </LayoutSidebarAdapter>);
    expect(ref.current).toBe(screen.getByRole('complementary', { name: 'Sections' }));
    expect(ref.current?.id).toBe('sidebar');
    expect(ref.current?.className).toBe('own-aside');
    expect(screen.getByRole('button', { name: 'Close' }).className).toBe('own-trigger');
    expect(container.querySelector('[data-slot="body"]')?.className).toBe('own-body');
  });

  it('accepts a decorative compact trigger without losing its accessible name', () => {
    render(<LayoutSidebarAdapter defaultCollapsed triggerIcon={<span>symbol</span>}>Content</LayoutSidebarAdapter>);
    const trigger = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(trigger.getAttribute('aria-label')).toBe('Expand sidebar');
    expect(trigger.textContent).toBe('symbol');
    expect(trigger.querySelector('span')?.getAttribute('aria-hidden')).toBe('true');
  });
});
