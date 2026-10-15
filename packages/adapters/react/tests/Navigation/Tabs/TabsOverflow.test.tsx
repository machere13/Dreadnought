import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TabsAdapter } from '../../../src/Navigation/Tabs/TabsAdapter.tsx';
import type { TabsListAdapterProps } from '../../../src/Navigation/Tabs/TabsListAdapter.tsx';
import { createPortal } from 'react-dom';
import { within } from '@testing-library/react';

let width = 100;
let resizeCallbacks: (() => void)[] = [];
const rect = (left: number, right: number) =>
  ({
    left,
    right,
    top: 0,
    bottom: 44,
    width: right - left,
    height: 44,
    x: left,
    y: 0,
    toJSON() {},
  }) as DOMRect;

beforeEach(() => {
  width = 100;
  resizeCallbacks = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resizeCallbacks.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    if (this.getAttribute('data-slot') === 'list') {
      return this.getAttribute('aria-orientation') === 'vertical'
        ? { ...rect(0, 100), top: 0, bottom: width, height: width }
        : rect(0, width);
    }
    if (this.getAttribute('role') === 'tab') {
      const list = this.closest('[role="tablist"]')!;
      const index = [...list.querySelectorAll('[role="tab"]')].indexOf(this);
      if (list.getAttribute('aria-orientation') === 'vertical') {
        return {
          ...rect(0, 100),
          top: index * 100 - list.scrollTop,
          bottom: (index + 1) * 100 - list.scrollTop,
          height: 100,
        };
      }
      return rect(index * 100 - list.scrollLeft, (index + 1) * 100 - list.scrollLeft);
    }
    return rect(0, 44);
  });
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function () {
    return this.getAttribute('data-slot') === 'list' ? width : 800;
  });
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function () {
    if (this.getAttribute('aria-orientation') === 'vertical') return 100;
    return this.getAttribute('data-slot') === 'list'
      ? this.querySelectorAll('[role="tab"]').length * 100
      : 0;
  });
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function () {
    return this.getAttribute('data-slot') === 'list' ? width : 800;
  });
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function () {
    return this.getAttribute('data-slot') === 'list'
      ? this.querySelectorAll('[role="tab"]').length * 100
      : 0;
  });
  const matches = HTMLElement.prototype.matches;
  vi.spyOn(HTMLElement.prototype, 'matches').mockImplementation(function (selector) {
    return selector === ':popover-open'
      ? this.hasAttribute('data-test-open')
      : matches.call(this, selector);
  });
  // jsdom has no Popover API; emulate its open/close state, not Tabs behavior.
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.setAttribute('data-test-open', '');
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.removeAttribute('data-test-open');
    },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as Partial<HTMLElement>).showPopover;
  delete (HTMLElement.prototype as Partial<HTMLElement>).hidePopover;
});

function Sample({
  value,
  onValueChange,
  last = true,
  orientation,
  listSlots,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  last?: boolean;
  orientation?: 'horizontal' | 'vertical';
  listSlots?: TabsListAdapterProps['slotProps'];
}) {
  const selection = value === undefined ? { defaultValue: 'a' } : { value };
  return (
    <TabsAdapter {...selection} onValueChange={onValueChange} orientation={orientation}>
      <TabsAdapter.List aria-label="Sections" moreLabel="More sections" slotProps={listSlots}>
        <TabsAdapter.Tab value="a">A</TabsAdapter.Tab>
        <TabsAdapter.Tab value="b" disabled>
          B
        </TabsAdapter.Tab>
        <TabsAdapter.Tab value="c">C</TabsAdapter.Tab>
        {last && <TabsAdapter.Tab value="d">D</TabsAdapter.Tab>}
      </TabsAdapter.List>
      <TabsAdapter.Panel value="a">Alpha</TabsAdapter.Panel>
      <TabsAdapter.Panel value="b">Beta</TabsAdapter.Panel>
      <TabsAdapter.Panel value="c">Gamma</TabsAdapter.Panel>
      {last && <TabsAdapter.Panel value="d">Delta</TabsAdapter.Panel>}
    </TabsAdapter>
  );
}

describe('Tabs overflow', () => {
  it('lets a custom blur handler keep the menu open when focus leaves it', () => {
    const blur = vi.fn((event: React.FocusEvent) => event.preventDefault());
    render(
      <>
        <Sample listSlots={{ menu: { onBlur: blur } }} />
        <button>Outside</button>
      </>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'More sections' }));
    act(() => screen.getByRole('button', { name: 'Outside' }).focus());
    expect(blur).toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
  });

  it('forwards native popup toggles and closes after external dismissal', () => {
    const toggle = vi.fn();
    render(<Sample listSlots={{ menu: { onToggle: toggle } }} />);
    const more = screen.getByRole('button', { name: 'More sections' });
    fireEvent.click(more);
    const popup = screen.getByRole('menu').closest('[popover]')!;
    fireEvent(popup, Object.assign(new Event('toggle'), { oldState: 'open', newState: 'closed' }));
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(more);
  });

  it('focuses the first enabled overflow item on click even when a later item is selected', () => {
    render(<Sample value="d" />);
    const list = screen.getByRole('tablist');
    list.scrollLeft = 0;
    fireEvent.scroll(list);
    fireEvent.click(screen.getByRole('button', { name: 'More sections' }));
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'C' }));
    expect(screen.getByRole('menuitemradio', { name: 'D' }).getAttribute('aria-checked')).toBe(
      'true',
    );
  });

  it('preserves custom trigger, menu and item props and their prevented actions', () => {
    const click = vi.fn((event: React.MouseEvent) => event.preventDefault());
    const keyDown = vi.fn((event: React.KeyboardEvent) => event.preventDefault());
    const action = vi.fn((event: React.MouseEvent) => event.preventDefault());
    const view = render(<Sample listSlots={{ more: { onClick: click, onKeyDown: keyDown } }} />);
    const more = screen.getByRole('button', { name: 'More sections' });
    fireEvent.click(more);
    fireEvent.keyDown(more, { key: 'ArrowDown' });
    expect(click).toHaveBeenCalledTimes(1);
    expect(keyDown).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
    view.rerender(
      <Sample
        listSlots={{
          more: { title: 'More title' },
          menu: { className: 'custom-menu', onKeyDown: keyDown },
          item: { title: 'Tab action', onClick: action },
        }}
      />,
    );
    fireEvent.click(more);
    expect(more.title).toBe('More title');
    expect(screen.getByRole('menu').className).toBe('custom-menu');
    const item = screen.getByRole('menuitemradio', { name: 'C' });
    expect(item.title).toBe('Tab action');
    fireEvent.click(item);
    expect(action).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('tab', { name: 'A' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(item, { key: 'Escape' });
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('selects a hidden vertical tab and reveals it along the vertical axis', () => {
    render(<Sample orientation="vertical" />);
    fireEvent.click(screen.getByRole('button', { name: 'More sections' }));
    expect(screen.getAllByRole('menuitemradio').map((item) => item.textContent)).toEqual([
      'B',
      'C',
      'D',
    ]);
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'D' }));
    expect(screen.getByRole('tablist').scrollTop).toBe(300);
    expect(screen.getByRole('tablist').scrollLeft).toBe(0);
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'D' }));
  });

  it('remeasures vertical overflow after resizing and reveals controlled selection', () => {
    const { rerender } = render(<Sample orientation="vertical" value="d" />);
    const list = screen.getByRole('tablist');
    expect(list.scrollTop).toBe(300);
    rerender(<Sample orientation="vertical" value="a" />);
    expect(list.scrollTop).toBe(0);
    width = 500;
    act(() => resizeCallbacks.forEach((callback) => callback()));
    expect(screen.queryByRole('button', { name: 'More sections' })).toBeNull();
  });

  it('positions its menu and follows resize in the iframe document', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const doc = frame.contentDocument!;
    const proto = doc.defaultView!.HTMLElement.prototype;
    vi.spyOn(proto, 'getBoundingClientRect').mockImplementation(
      HTMLElement.prototype.getBoundingClientRect,
    );
    vi.spyOn(proto, 'clientWidth', 'get').mockImplementation(function () {
      return this.getAttribute('data-slot') === 'list' ? width : 120;
    });
    vi.spyOn(proto, 'scrollWidth', 'get').mockImplementation(function () {
      return this.getAttribute('data-slot') === 'list'
        ? this.querySelectorAll('[role="tab"]').length * 100
        : 0;
    });
    Object.defineProperty(proto, 'showPopover', {
      configurable: true,
      value: HTMLElement.prototype.showPopover,
    });
    Object.defineProperty(proto, 'hidePopover', {
      configurable: true,
      value: HTMLElement.prototype.hidePopover,
    });
    vi.spyOn(proto, 'matches').mockImplementation(HTMLElement.prototype.matches);
    Object.defineProperty(doc.documentElement, 'clientWidth', { configurable: true, value: 120 });
    Object.defineProperty(doc.documentElement, 'clientHeight', { configurable: true, value: 160 });
    const { unmount } = render(createPortal(<Sample />, doc.body));
    try {
      const more = within(doc.body).getByRole('button', { name: 'More sections' });
      let right = 144;
      vi.spyOn(more, 'getBoundingClientRect').mockImplementation(() => ({
        ...rect(right - 44, right),
        top: 50,
        bottom: 94,
      }));
      fireEvent.keyDown(more, { key: 'ArrowDown' });
      const menu = within(doc.body).getByRole('menu');
      const popup = menu.closest<HTMLElement>('[popover]')!;
      expect(popup.style.left).toBe('76px');
      right = 84;
      act(() => doc.defaultView!.dispatchEvent(new Event('resize')));
      expect(popup.style.left).toBe('40px');
      fireEvent.keyDown(doc.activeElement!, { key: 'Escape' });
      expect(doc.activeElement).toBe(more);
    } finally {
      unmount();
      frame.remove();
    }
  });
  it('lists offscreen tabs, skips disabled items and selects without submitting', () => {
    const change = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Sample onValueChange={change} />
      </form>,
    );
    const more = screen.getByRole('button', { name: 'More sections' });
    fireEvent.keyDown(more, { key: 'ArrowDown' });
    expect(screen.getAllByRole('menuitemradio').map((item) => item.textContent)).toEqual([
      'B',
      'C',
      'D',
    ]);
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'C' }));
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'D' }));
    const tab = screen.getByRole('tab', { name: 'D' });
    expect(tab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(tab);
    expect(screen.getByRole('tablist').scrollLeft).toBe(300);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(change).toHaveBeenCalledExactlyOnceWith('d');
    expect(submit).not.toHaveBeenCalled();
  });

  it('closes on Escape and restores focus to the overflow button', () => {
    render(<Sample />);
    const more = screen.getByRole('button', { name: 'More sections' });
    fireEvent.keyDown(more, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'D' }));
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(screen.getByRole('menuitemradio', { name: 'C' }));
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(more);
  });

  it('closes when clicking the overflow button again after the menu took focus', async () => {
    render(<Sample />);
    const user = userEvent.setup();
    const more = screen.getByRole('button', { name: 'More sections' });
    await user.click(more);
    expect(screen.getByRole('menu').id).toBe(more.getAttribute('aria-controls'));
    await user.click(more);
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(more);
  });

  it('reveals keyboard and externally controlled selection without emitting extra changes', () => {
    const change = vi.fn();
    const { rerender } = render(<Sample value="a" onValueChange={change} />);
    rerender(<Sample value="d" onValueChange={change} />);
    expect(screen.getByRole('tablist').scrollLeft).toBe(300);
    expect(change).not.toHaveBeenCalled();
    cleanup();
    render(<Sample onValueChange={change} />);
    fireEvent.keyDown(screen.getByRole('tab', { name: 'A' }), { key: 'End' });
    expect(screen.getByRole('tablist').scrollLeft).toBe(300);
    expect(change).toHaveBeenCalledExactlyOnceWith('d');
  });

  it('recomputes after resizing, scrolling and removal of a tab', async () => {
    const { rerender } = render(<Sample />);
    const list = screen.getByRole('tablist');
    list.scrollLeft = 200;
    fireEvent.scroll(list);
    fireEvent.click(screen.getByRole('button', { name: 'More sections' }));
    expect(screen.getAllByRole('menuitemradio').map((item) => item.textContent)).toEqual([
      'A',
      'B',
      'D',
    ]);
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    rerender(<Sample last={false} />);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'More sections' }));
    expect(screen.queryByRole('menuitemradio', { name: 'D' })).toBeNull();
    width = 500;
    await act(async () => {
      resizeCallbacks.forEach((callback) => callback());
    });
    expect(screen.queryByRole('button', { name: 'More sections' })).toBeNull();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('keeps controlled selection owned by the caller when choosing from the menu', () => {
    const change = vi.fn();
    render(<Sample value="a" onValueChange={change} />);
    fireEvent.click(screen.getByRole('button', { name: 'More sections' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'C' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('c');
    expect(screen.getByRole('tab', { name: 'A' }).getAttribute('aria-selected')).toBe('true');
  });
});
