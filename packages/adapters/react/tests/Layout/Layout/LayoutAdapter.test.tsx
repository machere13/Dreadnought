import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LayoutAdapter, LayoutHeaderAdapter, LayoutContentAdapter, LayoutFooterAdapter, LayoutSidebarAdapter } from '@dreadnought/react/unstyled';

afterEach(cleanup);

describe('Layout adapters', () => {
  it('keeps header, sidebar, content and footer in the supplied order', () => {
    render(<LayoutAdapter data-testid="outer">
      <LayoutHeaderAdapter>Heading</LayoutHeaderAdapter>
      <LayoutAdapter direction="horizontal" data-testid="inner">
        <LayoutSidebarAdapter aria-label="Sections">Sections</LayoutSidebarAdapter>
        <LayoutContentAdapter>Article</LayoutContentAdapter>
      </LayoutAdapter>
      <LayoutFooterAdapter>Legal</LayoutFooterAdapter>
    </LayoutAdapter>);

    const outer = screen.getByTestId('outer');
    const inner = screen.getByTestId('inner');
    expect(outer.getAttribute('data-direction')).toBe('vertical');
    expect(inner.getAttribute('data-direction')).toBe('horizontal');
    expect(outer.querySelector('header')?.textContent).toBe('Heading');
    expect(outer.querySelector('aside')?.getAttribute('aria-label')).toBe('Sections');
    expect(outer.querySelectorAll('main')).toHaveLength(1);
    expect(outer.querySelector('footer')?.textContent).toBe('Legal');
    expect(Array.from(outer.querySelectorAll('header, aside, main, footer')).map((node) => node.tagName)).toEqual(['HEADER', 'ASIDE', 'MAIN', 'FOOTER']);
  });

  it('forwards native props, classes and refs without adding presentation classes', () => {
    const rootRef = createRef<HTMLDivElement>();
    const headerRef = createRef<HTMLElement>();
    const mainRef = createRef<HTMLElement>();
    const footerRef = createRef<HTMLElement>();
    render(<LayoutAdapter ref={rootRef} className="own-root" title="Shell">
      <LayoutHeaderAdapter ref={headerRef} className="own-header" id="top">Top</LayoutHeaderAdapter>
      <LayoutContentAdapter ref={mainRef} className="own-main" id="content">Content</LayoutContentAdapter>
      <LayoutFooterAdapter ref={footerRef} className="own-footer" id="bottom">Bottom</LayoutFooterAdapter>
    </LayoutAdapter>);

    expect(rootRef.current?.className).toBe('own-root');
    expect(rootRef.current?.title).toBe('Shell');
    expect(headerRef.current?.id).toBe('top');
    expect(headerRef.current?.className).toBe('own-header');
    expect(mainRef.current?.id).toBe('content');
    expect(mainRef.current?.className).toBe('own-main');
    expect(footerRef.current?.id).toBe('bottom');
    expect(footerRef.current?.className).toBe('own-footer');
  });
});
