import { createPortal } from 'react-dom';
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SelectAdapter } from '../../../src/Fields/Select/SelectAdapter.tsx';
import { useAnchoredPopover } from '../../../src/shared/useAnchoredPopover.ts';
import { useRef } from 'react';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('repositions a retained anchor after its geometry changes without a resize or scroll event', () => {
  function Sample({ position }: { position: number }) {
    const anchor = useRef<HTMLButtonElement>(null), popup = useRef<HTMLDivElement>(null);
    useAnchoredPopover(true, anchor, popup);
    return <><button style={{ top: position }} ref={element => {
      anchor.current = element;
      if (element) element.getBoundingClientRect = () => ({ left: 0, top: Number.parseFloat(element.style.top), bottom: Number.parseFloat(element.style.top) + 20, width: 20 }) as DOMRect;
    }}>Anchor</button><div ref={popup} data-testid="moving-popup" /></>;
  }
  const { rerender, getByTestId } = render(<Sample position={10} />);
  rerender(<Sample position={20} />);
  expect(getByTestId('moving-popup').style.top).toBe('20px');
  rerender(<Sample position={100} />);
  expect(getByTestId('moving-popup').style.top).toBe('100px');
});

it('passes the real invoker to the native API when the popup is portaled outside its parent', () => {
  let invoker: HTMLElement | undefined;
  const show = function (this: HTMLElement, options?: { source?: HTMLElement }) { invoker = options?.source; };
  Object.defineProperty(HTMLElement.prototype, 'showPopover', { configurable: true, value: show });
  function Sample() {
    const anchor = useRef<HTMLButtonElement>(null);
    const popup = useRef<HTMLDivElement>(null);
    useAnchoredPopover(true, anchor, popup);
    return <div popover="auto"><button ref={anchor}>Open child</button>
      {createPortal(<div ref={popup} popover="auto">Child</div>, document.body)}</div>;
  }
  try {
    const { unmount } = render(<Sample />);
    expect(invoker).toBe(document.querySelector('button'));
    unmount();
  } finally { delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover; }
});

it('positions and updates a Select using its iframe viewport and window', () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument!;
  const { unmount } = render(createPortal(<SelectAdapter aria-label="People" options={[{ value: 'a', label: 'Anna' }]} />, doc.body));
  try {
    Object.defineProperty(doc.documentElement, 'clientWidth', { configurable: true, value: 120 });
    Object.defineProperty(doc.documentElement, 'clientHeight', { configurable: true, value: 160 });
    const root = doc.querySelector<HTMLElement>('[data-ui="select"]')!;
    const popup = doc.querySelector<HTMLElement>('[data-slot="popup"]')!;
    let bottom = 150;
    vi.spyOn(root, 'getBoundingClientRect').mockImplementation(() => ({ left: 100, top: bottom - 20, bottom, width: 100 }) as DOMRect);
    vi.spyOn(popup, 'getBoundingClientRect').mockReturnValue({ width: 80, height: 60 } as DOMRect);
    fireEvent.click(within(doc.body).getByRole('combobox'));
    expect(popup.style.left).toBe('40px');
    expect(popup.style.top).toBe('70px');
    bottom = 60;
    act(() => doc.defaultView!.dispatchEvent(new Event('resize')));
    expect(popup.style.top).toBe('60px');
    bottom = 100;
    act(() => doc.defaultView!.dispatchEvent(new Event('scroll')));
    expect(popup.style.top).toBe('100px');
  } finally { unmount(); frame.remove(); }
});

it('scrolls the active option in the popup document, not the parent document', () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument!;
  const { unmount } = render(createPortal(<SelectAdapter aria-label="People" options={[{ value: 'a', label: 'Anna' }]} />, doc.body));
  try {
    const option = doc.querySelector<HTMLElement>('[role="option"]')!;
    const scroll = vi.fn();
    option.scrollIntoView = scroll;
    fireEvent.click(within(doc.body).getByRole('combobox'));
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest' });
  } finally { unmount(); frame.remove(); }
});
