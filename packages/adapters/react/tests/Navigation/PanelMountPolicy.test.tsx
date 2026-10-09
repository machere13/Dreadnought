import { StrictMode, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { createPortal } from 'react-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { ContentMountPolicy } from '@dreadnought/core';
import { TabsAdapter, AccordionAdapter } from '../../src/unstyled.ts';

afterEach(cleanup);

function Panels({
  kind,
  active,
  policy,
  onActiveChange,
  children,
}: {
  kind: 'tabs' | 'accordion';
  active: boolean;
  policy?: ContentMountPolicy;
  onActiveChange?: (active: boolean) => void;
  children: ReactNode;
}) {
  if (kind === 'tabs') {
    return (
      <TabsAdapter
        value={active ? 'draft' : 'other'}
        onValueChange={(value) => onActiveChange?.(value === 'draft')}
      >
        <TabsAdapter.List aria-label="Sections">
          <TabsAdapter.Tab value="other">Other</TabsAdapter.Tab>
          <TabsAdapter.Tab value="draft">Draft</TabsAdapter.Tab>
        </TabsAdapter.List>
        <TabsAdapter.Panel value="other">Other content</TabsAdapter.Panel>
        <TabsAdapter.Panel value="draft" mountPolicy={policy} data-testid="panel">
          {children}
        </TabsAdapter.Panel>
      </TabsAdapter>
    );
  }
  return (
    <AccordionAdapter
      value={active ? 'draft' : null}
      onValueChange={(value) => onActiveChange?.(value === 'draft')}
    >
      <AccordionAdapter.Item value="draft">
        <AccordionAdapter.Trigger>Draft</AccordionAdapter.Trigger>
        <AccordionAdapter.Panel mountPolicy={policy} data-testid="panel">
          {children}
        </AccordionAdapter.Panel>
      </AccordionAdapter.Item>
    </AccordionAdapter>
  );
}

describe.each(['tabs', 'accordion'] as const)('%s content lifecycle', (kind) => {
  it.each([undefined, 'lazy', 'unmount'] as const)(
    'uses %s without removing the panel shell',
    (policy) => {
      let mounts = 0;
      let cleanups = 0;
      function Draft() {
        useEffect(() => {
          mounts++;
          return () => {
            cleanups++;
          };
        }, []);
        return <input aria-label="Draft text" defaultValue="Initial" />;
      }
      const view = (active: boolean) => (
        <Panels kind={kind} active={active} policy={policy}>
          <Draft />
        </Panels>
      );
      const { rerender, unmount } = render(view(false));
      const panel = screen.getByTestId('panel');
      const trigger = screen.getByRole(kind === 'tabs' ? 'tab' : 'button', { name: 'Draft' });
      expect(panel.hidden).toBe(true);
      expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
      expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id);
      expect(panel.hasAttribute('mountPolicy')).toBe(false);
      expect(mounts).toBe(policy === undefined ? 1 : 0);
      rerender(view(true));
      const input = screen.getByLabelText('Draft text') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Saved' } });
      expect(mounts).toBe(1);
      rerender(view(false));
      expect(screen.getByTestId('panel')).toBe(panel);
      expect(panel.hidden).toBe(true);
      expect(screen.queryByLabelText('Draft text') === null).toBe(policy === 'unmount');
      expect(cleanups).toBe(policy === 'unmount' ? 1 : 0);
      rerender(view(true));
      expect((screen.getByLabelText('Draft text') as HTMLInputElement).value).toBe(
        policy === 'unmount' ? 'Initial' : 'Saved',
      );
      expect(mounts).toBe(policy === 'unmount' ? 2 : 1);
      unmount();
      expect(cleanups).toBe(mounts);
    },
  );

  it('moves focus to a visible trigger before controlled removal of focused content', () => {
    const view = (active: boolean) => (
      <Panels kind={kind} active={active} policy="unmount">
        <input aria-label="Draft text" />
      </Panels>
    );
    const { rerender } = render(view(true));
    screen.getByLabelText('Draft text').focus();
    rerender(view(false));
    expect(document.activeElement).toBe(
      screen.getByRole(kind === 'tabs' ? 'tab' : 'button', {
        name: kind === 'tabs' ? 'Other' : 'Draft',
      }),
    );
    expect(screen.queryByLabelText('Draft text')).toBeNull();
  });

  it('does not steal outside focus when content is removed', () => {
    const view = (active: boolean) => (
      <>
        <Panels kind={kind} active={active} policy="unmount">
          <input aria-label="Draft text" />
        </Panels>
        <button>Outside</button>
      </>
    );
    const { rerender } = render(view(true));
    const outside = screen.getByRole('button', { name: 'Outside' });
    outside.focus();
    rerender(view(false));
    expect(document.activeElement).toBe(outside);
  });

  it('respects parent-document focus when the panel is inside an iframe', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const frameDocument = frame.contentDocument!;
    const view = (active: boolean) => (
      <>
        {createPortal(
          <Panels kind={kind} active={active} policy="unmount">
            <input aria-label="Frame draft" />
          </Panels>,
          frameDocument.body,
        )}
        <button>Outside frame</button>
      </>
    );
    const { rerender, unmount } = render(view(true));
    try {
      (frameDocument.querySelector('input') as HTMLInputElement).focus();
      rerender(view(false));
      expect(frameDocument.activeElement?.textContent).toBe(kind === 'tabs' ? 'Other' : 'Draft');
      rerender(view(true));
      (frameDocument.querySelector('input') as HTMLInputElement).focus();
      const outside = screen.getByRole('button', { name: 'Outside frame' });
      outside.focus();
      rerender(view(false));
      expect(document.activeElement).toBe(outside);
    } finally {
      unmount();
      frame.remove();
    }
  });

  it('keeps keyboard navigation working with lazy content in StrictMode', () => {
    function Example() {
      const [active, setActive] = useState(false);
      return (
        <Panels kind={kind} active={active} onActiveChange={setActive} policy="lazy">
          <input aria-label="Draft text" />
        </Panels>
      );
    }
    render(
      <StrictMode>
        <Example />
      </StrictMode>,
    );
    const trigger = screen.getByRole(kind === 'tabs' ? 'tab' : 'button', {
      name: kind === 'tabs' ? 'Other' : 'Draft',
    });
    trigger.focus();
    if (kind === 'tabs') fireEvent.keyDown(trigger, { key: 'ArrowRight' });
    else fireEvent.click(trigger);
    expect(screen.getByLabelText('Draft text')).toBeTruthy();
    const opened = screen.getByRole(kind === 'tabs' ? 'tab' : 'button', { name: 'Draft' });
    if (kind === 'tabs') fireEvent.keyDown(opened, { key: 'ArrowLeft' });
    else fireEvent.click(opened);
    expect(screen.getByTestId('panel').hidden).toBe(true);
    expect(screen.getByLabelText('Draft text')).toBeTruthy();
  });

  it('renders lazy content on the server only for the active panel', () => {
    const view = (active: boolean) => (
      <Panels kind={kind} active={active} policy="lazy">
        <span>Server content</span>
      </Panels>
    );
    expect(renderToString(view(false))).not.toContain('Server content');
    expect(renderToString(view(true))).toContain('Server content');
  });
});
