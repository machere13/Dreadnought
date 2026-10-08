import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LayoutAdapter } from '@dreadnought/react/unstyled';
import { Layout } from '@dreadnought/ui/react';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function setMobileViewport() {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

describe('Layout', () => {
  it('starts the ready Sidebar collapsed on mobile and opens it on demand', () => {
    setMobileViewport();
    const { container } = render(
      <Layout direction="horizontal">
        <Layout.Sidebar aria-label="Sections">
          <a href="/docs">Docs</a>
        </Layout.Sidebar>
        <Layout.Content>Content</Layout.Content>
      </Layout>,
    );
    const sidebar = screen.getByRole('complementary', { name: 'Sections' });
    expect(sidebar.getAttribute('data-collapsed')).toBe('true');
    expect(sidebar.getAttribute('data-mobile')).toBe('true');
    expect(container.querySelector('[data-slot="body"]')?.hasAttribute('hidden')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
    expect(sidebar.getAttribute('data-collapsed')).toBe('false');
    expect(container.querySelector('[data-slot="body"]')?.hasAttribute('hidden')).toBe(false);
  });

  it('styles each ready part while leaving the plain adapter unstyled', () => {
    render(
      <>
        <Layout className="own-layout">
          <Layout.Header className="own-header">Header</Layout.Header>
          <Layout direction="horizontal">
            <Layout.Sidebar
              aria-label="Sections"
              className="own-sidebar"
              slotClassNames={{ body: 'own-body', trigger: 'own-trigger' }}
            >
              Navigation
            </Layout.Sidebar>
            <Layout.Content className="own-content">Content</Layout.Content>
          </Layout>
          <Layout.Footer className="own-footer">Footer</Layout.Footer>
        </Layout>
        <LayoutAdapter data-testid="plain" />
      </>,
    );

    const ready = screen.getByText('Header').closest('[data-ui="layout"]') as HTMLElement;
    const sidebar = screen.getByRole('complementary', { name: 'Sections' });
    expect(ready.className).toContain('own-layout');
    expect(ready.className).not.toBe('own-layout');
    for (const [selector, ownClass] of [
      ['header', 'own-header'],
      ['main', 'own-content'],
      ['footer', 'own-footer'],
      ['aside', 'own-sidebar'],
    ]) {
      const node = ready.querySelector(selector) as HTMLElement;
      expect(node.className).toContain(ownClass);
      expect(node.className).not.toBe(ownClass);
    }
    expect(sidebar.querySelector('[data-slot="body"]')?.className).toContain('own-body');
    expect(sidebar.querySelector('[data-slot="trigger"]')?.className).toContain('own-trigger');
    expect(sidebar.querySelector('[data-slot="body"]')?.className).not.toBe('own-body');
    expect(screen.getByTestId('plain').className).toBe('');
  });

  it('uses the same Sidebar behavior as the adapter', () => {
    const { container } = render(
      <Layout>
        <Layout.Sidebar defaultCollapsed aria-label="Sections">
          <a href="/docs">Docs</a>
        </Layout.Sidebar>
      </Layout>,
    );
    const button = screen.getByRole('button', { name: 'Expand sidebar' });
    const body = container.querySelector('[data-slot="body"]') as HTMLDivElement;
    expect(button.querySelector('svg')).not.toBeNull();
    expect(button.textContent).toBe('');
    expect(button.getAttribute('aria-label')).toBe('Expand sidebar');
    expect(body.hidden).toBe(true);
    fireEvent.click(button);
    expect(
      screen.getByRole('button', { name: 'Collapse sidebar' }).querySelector('svg'),
    ).not.toBeNull();
    expect(body.hidden).toBe(false);
    expect(body.querySelector('a')?.getAttribute('href')).toBe('/docs');
  });
});
