import { createRef, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccordionAdapter } from '../../../src/Navigation/Accordion/AccordionAdapter.tsx';

afterEach(cleanup);

function pair(value: string, label = value, content = `${value} content`) {
  return <AccordionAdapter.Item value={value}>
    <AccordionAdapter.Trigger>{label}</AccordionAdapter.Trigger>
    <AccordionAdapter.Panel>{content}</AccordionAdapter.Panel>
  </AccordionAdapter.Item>;
}

describe('AccordionAdapter', () => {
  it('protects button type and ARIA from consumer spreads while preserving disabled', async () => {
    const submit = vi.fn(event => event.preventDefault());
    const consumer = { id: 'consumer', type: 'submit' as const,
      'aria-expanded': true, 'aria-controls': 'missing' };
    const view = (disabled: boolean) => <form onSubmit={submit}><AccordionAdapter>
      <AccordionAdapter.Item value="a">
        <AccordionAdapter.Trigger {...consumer} disabled={disabled}>a</AccordionAdapter.Trigger>
        <AccordionAdapter.Panel>Answer</AccordionAdapter.Panel>
      </AccordionAdapter.Item>
    </AccordionAdapter></form>;
    const { rerender } = render(view(false));
    const button = screen.getByRole('button', { name: 'a' });
    const panel = screen.getByText('Answer');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.id).not.toBe('consumer');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(button.id);
    await userEvent.click(button);
    expect(panel.hidden).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(submit).not.toHaveBeenCalled();
    rerender(view(true));
    expect(button.hasAttribute('disabled')).toBe(true);
    await userEvent.click(button);
    expect(panel.hidden).toBe(false);
    expect(submit).not.toHaveBeenCalled();
  });
  it('toggles exactly once with native Enter and Space, without submitting', async () => {
    const change = vi.fn();
    const submit = vi.fn(event => event.preventDefault());
    render(<form onSubmit={submit}><AccordionAdapter onValueChange={change}>{pair('a')}</AccordionAdapter></form>);
    screen.getByRole('button', { name: 'a' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('a content').hidden).toBe(false);
    await userEvent.keyboard(' ');
    expect(screen.getByText('a content').hidden).toBe(true);
    expect(change.mock.calls).toEqual([['a'], [null]]);
    expect(submit).not.toHaveBeenCalled();
  });

  it('honors canceled clicks and leaves a disabled controlled panel open', () => {
    const change = vi.fn();
    const view = (value: string | null, disabled = false) => <AccordionAdapter value={value} onValueChange={change}>
      <AccordionAdapter.Item value="a">
        <AccordionAdapter.Trigger disabled={disabled} onClick={event => event.preventDefault()}>a</AccordionAdapter.Trigger>
        <AccordionAdapter.Panel>Answer</AccordionAdapter.Panel>
      </AccordionAdapter.Item>
    </AccordionAdapter>;
    const { rerender } = render(view(null));
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    expect(change).not.toHaveBeenCalled();
    rerender(view('a', true));
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    expect(screen.getByText('Answer').hidden).toBe(false);
    expect(change).not.toHaveBeenCalled();
  });

  it('does not steal outside focus on controlled close', () => {
    const view = (value: string | null) => <><AccordionAdapter value={value}>{pair('a')}</AccordionAdapter><button>Outside</button></>;
    const { rerender } = render(view('a'));
    const outside = screen.getByRole('button', { name: 'Outside' });
    outside.focus();
    rerender(view(null));
    expect(document.activeElement).toBe(outside);
  });
  it('connects a heading button to a mounted hidden panel and toggles it', () => {
    render(<AccordionAdapter>{pair('a', 'Question', 'Answer')}</AccordionAdapter>);
    const button = screen.getByRole('button', { name: 'Question' });
    const panel = screen.getByText('Answer');
    expect(button.closest('h3')).not.toBeNull();
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(button.id);
    expect(panel.hidden).toBe(true);
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);
    fireEvent.click(button);
    expect(panel.hidden).toBe(true);
  });

  it('uses native keyboard activation and does not submit a form', () => {
    const submit = vi.fn((event: Event) => event.preventDefault());
    render(<form onSubmit={submit}>{<AccordionAdapter>{pair('a')}</AccordionAdapter>}</form>);
    const button = screen.getByRole('button', { name: 'a' });
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.click(button);
    expect(submit).not.toHaveBeenCalled();
  });

  it('allows multiple items and preserves panel state while closed', () => {
    function Counter() {
      const [count, setCount] = useState(0);
      return <button onClick={() => setCount(count + 1)}>count {count}</button>;
    }
    render(<AccordionAdapter multiple>{pair('a')}<AccordionAdapter.Item value="b">
      <AccordionAdapter.Trigger>b</AccordionAdapter.Trigger>
      <AccordionAdapter.Panel><Counter /></AccordionAdapter.Panel>
    </AccordionAdapter.Item></AccordionAdapter>);
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    fireEvent.click(screen.getByRole('button', { name: 'count 0' }));
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    expect(screen.getByRole('button', { name: 'count 1' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'a' }).getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps controlled state external and disabled triggers inert', () => {
    const change = vi.fn();
    const view = (value: string | null) => <AccordionAdapter value={value} onValueChange={change}>
      {pair('a')}
      <AccordionAdapter.Item value="b">
        <AccordionAdapter.Trigger disabled>b</AccordionAdapter.Trigger>
        <AccordionAdapter.Panel>b content</AccordionAdapter.Panel>
      </AccordionAdapter.Item>
    </AccordionAdapter>;
    const { rerender } = render(view(null));
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    expect(change).toHaveBeenCalledExactlyOnceWith('a');
    expect(screen.getByText('a content').hidden).toBe(true);
    rerender(view('a'));
    expect(screen.getByText('a content').hidden).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    expect(change).toHaveBeenCalledTimes(1);
  });

  it('forwards classes and refs to the four owned DOM elements', () => {
    const root = createRef<HTMLDivElement>();
    const item = createRef<HTMLDivElement>();
    const trigger = createRef<HTMLButtonElement>();
    const panel = createRef<HTMLDivElement>();
    render(<AccordionAdapter ref={root} className="root">
      <AccordionAdapter.Item value="a" ref={item} className="item">
        <AccordionAdapter.Trigger ref={trigger} className="trigger" headingLevel={2}>a</AccordionAdapter.Trigger>
        <AccordionAdapter.Panel ref={panel} className="panel" role="region">content</AccordionAdapter.Panel>
      </AccordionAdapter.Item>
    </AccordionAdapter>);
    expect(root.current?.className).toBe('root');
    expect(item.current?.className).toBe('item');
    expect(trigger.current?.className).toBe('trigger');
    expect(trigger.current?.closest('h2')).not.toBeNull();
    expect(panel.current?.className).toBe('panel');
    expect(panel.current?.getAttribute('role')).toBe('region');
  });

  it('rejects empty or repeated item values and incomplete pairs', () => {
    expect(() => render(<AccordionAdapter>{pair('')}</AccordionAdapter>)).toThrow();
    expect(() => render(<AccordionAdapter>{pair('a')}{pair('a')}</AccordionAdapter>)).toThrow();
    expect(() => render(<AccordionAdapter><AccordionAdapter.Item value="a">
      <AccordionAdapter.Trigger>a</AccordionAdapter.Trigger>
    </AccordionAdapter.Item></AccordionAdapter>)).toThrow();
    expect(() => render(<AccordionAdapter><AccordionAdapter.Item value="a">
      <AccordionAdapter.Panel>a</AccordionAdapter.Panel>
    </AccordionAdapter.Item></AccordionAdapter>)).toThrow();
  });

  it('rejects unknown and duplicate selected values', () => {
    expect(() => render(<AccordionAdapter value="missing">{pair('a')}</AccordionAdapter>)).toThrow();
    expect(() => render(<AccordionAdapter multiple value={['a', 'a']}>{pair('a')}</AccordionAdapter>)).toThrow();
    expect(() => render(<AccordionAdapter multiple defaultValue={['missing']}>{pair('a')}</AccordionAdapter>)).toThrow();
  });

  it('isolates nested roots and creates stable IDs for special values', () => {
    const value = 'а %?';
    render(<AccordionAdapter><AccordionAdapter.Item value={value}>
      <AccordionAdapter.Trigger>outer</AccordionAdapter.Trigger>
      <AccordionAdapter.Panel><AccordionAdapter>{pair(value, 'inner')}</AccordionAdapter></AccordionAdapter.Panel>
    </AccordionAdapter.Item></AccordionAdapter>);
    const outer = screen.getByRole('button', { name: 'outer' });
    fireEvent.click(outer);
    const inner = screen.getByRole('button', { name: 'inner' });
    expect(outer.getAttribute('aria-controls')).not.toBe(inner.getAttribute('aria-controls'));
    fireEvent.click(inner);
    expect(outer.getAttribute('aria-expanded')).toBe('true');
    expect(inner.getAttribute('aria-expanded')).toBe('true');
  });

  it('moves focus from a panel closed by a controlled parent to its trigger', () => {
    const view = (value: string | null) => <AccordionAdapter value={value}><AccordionAdapter.Item value="a">
      <AccordionAdapter.Trigger>a</AccordionAdapter.Trigger>
      <AccordionAdapter.Panel><button>inside</button></AccordionAdapter.Panel>
    </AccordionAdapter.Item></AccordionAdapter>;
    const { rerender } = render(view('a'));
    const inside = screen.getByRole('button', { name: 'inside' });
    act(() => inside.focus());
    rerender(view(null));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'a' }));
  });

  it('rejects a Trigger removed by state below Item', () => {
    function DynamicTrigger() {
      const [visible, setVisible] = useState(true);
      return <><button onClick={() => setVisible(false)}>remove trigger</button>
        {visible && <AccordionAdapter.Trigger>answer</AccordionAdapter.Trigger>}</>;
    }
    render(<AccordionAdapter><AccordionAdapter.Item value="a">
      <DynamicTrigger /><AccordionAdapter.Panel>content</AccordionAdapter.Panel>
    </AccordionAdapter.Item></AccordionAdapter>);
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'remove trigger' }))).toThrow();
  });

  it('rejects a selected Item removed by state below the root', () => {
    function DynamicItem() {
      const [visible, setVisible] = useState(true);
      return <><button onClick={() => setVisible(false)}>remove item</button>{visible && pair('a')}</>;
    }
    render(<AccordionAdapter value="a"><DynamicItem /></AccordionAdapter>);
    expect(() => fireEvent.click(screen.getByRole('button', { name: 'remove item' }))).toThrow();
  });

  it('does not let a nested root borrow its outer Item context', () => {
    expect(() => render(<AccordionAdapter><AccordionAdapter.Item value="a">
      <AccordionAdapter.Trigger>outer</AccordionAdapter.Trigger>
      <AccordionAdapter><AccordionAdapter.Panel>orphan</AccordionAdapter.Panel></AccordionAdapter>
    </AccordionAdapter.Item></AccordionAdapter>)).toThrow();
  });

  it('runs callback-ref cleanup for Trigger and Panel on unmount', () => {
    const triggerCleanup = vi.fn();
    const panelCleanup = vi.fn();
    const { unmount } = render(<AccordionAdapter>{<AccordionAdapter.Item value="a">
      <AccordionAdapter.Trigger ref={() => triggerCleanup}>a</AccordionAdapter.Trigger>
      <AccordionAdapter.Panel ref={() => panelCleanup}>content</AccordionAdapter.Panel>
    </AccordionAdapter.Item>}</AccordionAdapter>);
    unmount();
    expect(triggerCleanup).toHaveBeenCalledTimes(1);
    expect(panelCleanup).toHaveBeenCalledTimes(1);
  });

  it('runs old callback-ref cleanup when the consumer replaces a ref', () => {
    const oldCleanup = vi.fn();
    const nextCleanup = vi.fn();
    const oldRef = () => oldCleanup;
    const nextRef = () => nextCleanup;
    const view = (ref: typeof oldRef) => <AccordionAdapter><AccordionAdapter.Item value="a">
      <AccordionAdapter.Trigger ref={ref}>a</AccordionAdapter.Trigger>
      <AccordionAdapter.Panel>content</AccordionAdapter.Panel>
    </AccordionAdapter.Item></AccordionAdapter>;
    const { rerender, unmount } = render(view(oldRef));
    rerender(view(nextRef));
    expect(oldCleanup).toHaveBeenCalledTimes(1);
    expect(nextCleanup).not.toHaveBeenCalled();
    unmount();
    expect(nextCleanup).toHaveBeenCalledTimes(1);
  });
});
