import { createRef, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { ToolbarAdapter } from '../../../src/unstyled.ts';
import { useToolbarRegistry } from '../../../src/Controls/Toolbar/useToolbarRegistry.ts';
import { Tool } from './ToolbarFixture.tsx';

afterEach(cleanup);
describe('Toolbar lifecycle', () => {
  it('navigates in DOM order after keyed children are rearranged', async () => {
    const view = render(<ToolbarAdapter aria-label="Commands"><Tool key="a" value="a" /><Tool key="b" value="b" /><Tool key="c" value="c" /></ToolbarAdapter>);
    view.rerender(<ToolbarAdapter aria-label="Commands"><Tool key="b" value="b" /><Tool key="a" value="a" /><Tool key="c" value="c" /></ToolbarAdapter>);
    await userEvent.click(screen.getByRole('button', { name: 'b' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'a' }));
  });
  it('recovers focus when the focused participant is removed', async () => {
    const view = render(<ToolbarAdapter aria-label="Commands"><Tool value="a" /><Tool value="b" /></ToolbarAdapter>);
    await userEvent.click(screen.getByRole('button', { name: 'b' }));
    view.rerender(<ToolbarAdapter aria-label="Commands"><Tool value="a" /></ToolbarAdapter>);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'a' }));
  });
  it('recovers focus when the focused participant is disabled', async () => {
    const view = render(<ToolbarAdapter aria-label="Commands"><Tool value="a" /><Tool value="b" /></ToolbarAdapter>);
    await userEvent.click(screen.getByRole('button', { name: 'b' }));
    view.rerender(<ToolbarAdapter aria-label="Commands"><Tool value="a" /><Tool value="b" disabled /></ToolbarAdapter>);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'a' }));
  });
  it('falls back to programmatic root focus with no enabled participants', async () => {
    const view = render(<ToolbarAdapter aria-label="Commands"><Tool value="a" /></ToolbarAdapter>);
    await userEvent.click(screen.getByRole('button'));
    view.rerender(<ToolbarAdapter aria-label="Commands" />);
    expect(document.activeElement).toBe(screen.getByRole('toolbar'));
    expect((document.activeElement as HTMLElement).tabIndex).toBe(-1);
  });
  it('never steals focus after the user leaves the toolbar', async () => {
    const view = render(<><ToolbarAdapter aria-label="Commands"><Tool value="a" /><Tool value="b" /></ToolbarAdapter><button>Outside</button></>);
    await userEvent.click(screen.getByRole('button', { name: 'b' }));
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    const outside = document.activeElement;
    view.rerender(<><ToolbarAdapter aria-label="Commands"><Tool value="a" /></ToolbarAdapter><button>Outside</button></>);
    expect(document.activeElement).toBe(outside);
  });
  it('does not focus on mount or when an unfocused active key becomes unavailable', () => {
    const before = document.activeElement;
    const view = render(<ToolbarAdapter aria-label="Commands"><Tool value="a" /><Tool value="b" /></ToolbarAdapter>);
    expect(document.activeElement).toBe(before);
    view.rerender(<ToolbarAdapter aria-label="Commands"><Tool value="a" disabled /><Tool value="b" /></ToolbarAdapter>);
    expect(document.activeElement).toBe(before);
    expect(screen.getByRole('button', { name: 'b' }).tabIndex).toBe(0);
  });
  it('uses native fieldset availability without a hook disabled flag', async () => {
    const view = render(<fieldset><ToolbarAdapter aria-label="Commands"><Tool value="a" /></ToolbarAdapter></fieldset>);
    await userEvent.click(screen.getByRole('button'));
    await act(async () => { view.container.querySelector('fieldset')!.disabled = true; });
    await waitFor(() => expect(screen.getByRole('button').tabIndex).toBe(-1));
    expect(document.activeElement).toBe(screen.getByRole('toolbar'));
    await act(async () => { view.container.querySelector('fieldset')!.disabled = false; });
    await waitFor(() => expect(screen.getByRole('button').tabIndex).toBe(0));
  });
  it('observes native disabled changes on a registered node', async () => {
    render(<ToolbarAdapter aria-label="Commands"><Tool value="a" /><Tool value="b" /></ToolbarAdapter>);
    const first = screen.getByRole('button', { name: 'a' }) as HTMLButtonElement;
    await userEvent.click(first);
    await act(async () => { first.disabled = true; });
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'b' })));
    expect(first.tabIndex).toBe(-1);
  });
  it('keeps one registration through StrictMode, ref and node replacement', async () => {
    const first = createRef<HTMLButtonElement>();
    const second = createRef<HTMLButtonElement>();
    const view = render(<StrictMode><ToolbarAdapter aria-label="Commands"><Tool key="old" value="same" itemRef={first} /></ToolbarAdapter></StrictMode>);
    view.rerender(<StrictMode><ToolbarAdapter aria-label="Commands"><Tool key="new" value="same" itemRef={second} /></ToolbarAdapter></StrictMode>);
    expect(first.current).toBeNull();
    expect(second.current).toBe(screen.getByRole('button'));
    expect(second.current?.tabIndex).toBe(0);
    await userEvent.tab();
    expect(document.activeElement).toBe(second.current);
  });
  it('does not let a stale cleanup remove a newer registration', async () => {
    let registry: ReturnType<typeof useToolbarRegistry>;
    const root = createRef<HTMLDivElement>();
    function Fixture() { registry = useToolbarRegistry(root, 'roving'); return <div ref={root} />; }
    render(<Fixture />);
    const element = document.createElement('button');
    document.body.append(element);
    let oldCleanup: () => void;
    let newCleanup: () => void;
    await act(async () => {
      oldCleanup = registry!.register({ value: 'same', disabled: false, element });
      newCleanup = registry!.register({ value: 'same', disabled: true, element });
      oldCleanup!();
    });
    expect(registry!.items.map(({ value, disabled }) => ({ value, disabled }))).toEqual([{ value: 'same', disabled: true }]);
    await act(async () => { newCleanup!(); });
    expect(registry!.items).toEqual([]);
    element.remove();
  });
  it('switches modes without grabbing external focus', async () => {
    const view = render(<><ToolbarAdapter aria-label="Commands"><Tool value="a" /></ToolbarAdapter><button>Outside</button></>);
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    const outside = document.activeElement;
    view.rerender(<><ToolbarAdapter navigation="native" aria-label="Commands"><Tool value="a" /></ToolbarAdapter><button>Outside</button></>);
    expect(screen.getByRole('group').getAttribute('aria-orientation')).toBeNull();
    expect(screen.getByRole('button', { name: 'a' }).getAttribute('tabindex')).toBeNull();
    view.rerender(<><ToolbarAdapter aria-label="Commands"><Tool value="a" /></ToolbarAdapter><button>Outside</button></>);
    expect(screen.getByRole('button', { name: 'a' }).tabIndex).toBe(0);
    expect(document.activeElement).toBe(outside);
  });
  it('renders on the server without reading participant DOM', () => {
    expect(renderToString(<ToolbarAdapter aria-label="Commands"><Tool value="a" /></ToolbarAdapter>)).toContain('role="toolbar"');
  });
});
