import { createPortal } from 'react-dom';
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SelectAdapter } from '../../../src/Fields/Select/SelectAdapter.tsx';
import { useAnchoredPopover } from '../../../src/shared/useAnchoredPopover.ts';
import { useRef } from 'react';

function mockGeometry(top = 100, left = 100) {
  vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(500);
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    if (this.matches('[data-ui="select"]')) return new DOMRect(left, top, 100, 30);
    if (this.matches('[data-slot="popup"]')) return new DOMRect(0, 0, 160, 60);
    return new DOMRect();
  });
}

it.each([
  ['bottomLeft', '100px', '130px'],
  ['bottomRight', '40px', '130px'],
  ['topLeft', '100px', '40px'],
  ['topRight', '40px', '40px'],
] as const)(
  'opens Select at %s without leaking configuration to its input',
  (placement, left, top) => {
    mockGeometry();
    const { getByRole } = render(
      <SelectAdapter
        options={[]}
        aria-label="People"
        placement={placement}
        autoAdjustOverflow={false}
      />,
    );
    const control = getByRole('combobox');
    fireEvent.click(control);
    const popup = getByRole('listbox');
    expect(popup.style.left).toBe(left);
    expect(popup.style.top).toBe(top);
    expect(popup.dataset.placement).toBe(placement);
    expect(control.hasAttribute('placement')).toBe(false);
    expect(control.hasAttribute('autoadjustoverflow')).toBe(false);
  },
);

it('flips the default Select above the anchor and keeps its popup inside the viewport', () => {
  mockGeometry(350, 470);
  const { getByRole } = render(<SelectAdapter options={[]} defaultOpen />);
  const popup = getByRole('listbox');
  expect(popup.style.left).toBe('340px');
  expect(popup.style.top).toBe('290px');
  expect(popup.dataset.placement).toBe('topLeft');
});

it('preserves the requested Select placement at screen edges when adjustment is disabled', () => {
  mockGeometry(350, 470);
  const { getByRole } = render(
    <SelectAdapter options={[]} defaultOpen placement="bottomLeft" autoAdjustOverflow={false} />,
  );
  const popup = getByRole('listbox');
  expect(popup.style.left).toBe('470px');
  expect(popup.style.top).toBe('380px');
  expect(popup.dataset.placement).toBe('bottomLeft');
});

it('repositions an open Select when placement changes and the viewport resizes', () => {
  mockGeometry();
  const { getByRole, rerender } = render(
    <SelectAdapter options={[]} defaultOpen placement="bottomLeft" />,
  );
  rerender(<SelectAdapter options={[]} defaultOpen placement="topRight" />);
  const popup = getByRole('listbox');
  expect(popup.style.left).toBe('40px');
  expect(popup.style.top).toBe('40px');
  vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(120);
  rerender(<SelectAdapter options={[]} defaultOpen placement="bottomRight" />);
  act(() => window.dispatchEvent(new Event('resize')));
  expect(popup.style.top).toBe('40px');
  expect(popup.dataset.placement).toBe('topRight');
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('repositions a retained anchor after its geometry changes without a resize or scroll event', () => {
  function Sample({ position }: { position: number }) {
    const anchor = useRef<HTMLButtonElement>(null);
    const popup = useRef<HTMLDivElement>(null);
    useAnchoredPopover(true, anchor, popup);
    return (
      <>
        <button
          style={{ top: position }}
          ref={(element) => {
            anchor.current = element;
            if (element) {
              element.getBoundingClientRect = () =>
                ({
                  left: 0,
                  top: Number.parseFloat(element.style.top),
                  bottom: Number.parseFloat(element.style.top) + 20,
                  width: 20,
                }) as DOMRect;
            }
          }}
        >
          Anchor
        </button>
        <div ref={popup} data-testid="moving-popup" />
      </>
    );
  }
  const { rerender, getByTestId } = render(<Sample position={10} />);
  rerender(<Sample position={20} />);
  expect(getByTestId('moving-popup').style.top).toBe('20px');
  rerender(<Sample position={100} />);
  expect(getByTestId('moving-popup').style.top).toBe('100px');
});

it('passes the real invoker to the native API when the popup is portaled outside its parent', () => {
  let invoker: HTMLElement | undefined;
  const show = function (this: HTMLElement, options?: { source?: HTMLElement }) {
    invoker = options?.source;
  };
  Object.defineProperty(HTMLElement.prototype, 'showPopover', { configurable: true, value: show });
  function Sample() {
    const anchor = useRef<HTMLButtonElement>(null);
    const popup = useRef<HTMLDivElement>(null);
    useAnchoredPopover(true, anchor, popup);
    return (
      <div popover="auto">
        <button ref={anchor}>Open child</button>
        {createPortal(
          <div ref={popup} popover="auto">
            Child
          </div>,
          document.body,
        )}
      </div>
    );
  }
  try {
    const { unmount } = render(<Sample />);
    expect(invoker).toBe(document.querySelector('button'));
    unmount();
  } finally {
    delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
  }
});

it('positions and updates a Select using its iframe viewport and window', () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument!;
  const { unmount } = render(
    createPortal(
      <SelectAdapter aria-label="People" options={[{ value: 'a', label: 'Anna' }]} />,
      doc.body,
    ),
  );
  try {
    Object.defineProperty(doc.documentElement, 'clientWidth', { configurable: true, value: 120 });
    Object.defineProperty(doc.documentElement, 'clientHeight', { configurable: true, value: 160 });
    const root = doc.querySelector<HTMLElement>('[data-ui="select"]')!;
    const popup = doc.querySelector<HTMLElement>('[data-slot="popup"]')!;
    let bottom = 150;
    vi.spyOn(root, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(100, bottom - 20, 100, 20),
    );
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
  } finally {
    unmount();
    frame.remove();
  }
});

it('scrolls the active option in the popup document, not the parent document', () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  const doc = frame.contentDocument!;
  const { unmount } = render(
    createPortal(
      <SelectAdapter aria-label="People" options={[{ value: 'a', label: 'Anna' }]} />,
      doc.body,
    ),
  );
  try {
    const option = doc.querySelector<HTMLElement>('[role="option"]')!;
    const scroll = vi.fn();
    option.scrollIntoView = scroll;
    fireEvent.click(within(doc.body).getByRole('combobox'));
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest' });
  } finally {
    unmount();
    frame.remove();
  }
});
