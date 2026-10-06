import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TabsAdapter, MenuAdapter, SelectAdapter, CheckboxAdapter, CheckboxGroupAdapter, RadioGroupAdapter, ToastAdapter, CodeBlockAdapter, TooltipAdapter, TextAreaAdapter } from '../../src/unstyled.ts';
import { useAccordion } from '../../src/Navigation/Accordion/useAccordion.ts';

afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
const options = [{ value: 'a', label: 'Anna' }, { value: 'b', label: 'Boris' }];

describe('audit: regression invariants', () => {
  it('TextArea adapter publishes functional bounds without UI theme variables', () => {
    render(<TextAreaAdapter minRows={2} maxRows={6} />);
    const area = screen.getByRole('textbox');
    expect(area.style.getPropertyValue('--dreadnought-text-area-min-rows')).toBe('');
    expect(area.style.getPropertyValue('--dreadnought-text-area-max-rows')).toBe('');
  });

  it('TextArea cleans up replaced refs exactly once in StrictMode', () => {
    const first = vi.fn(), second = vi.fn();
    const oldRef = (node: HTMLTextAreaElement | null) => { if (node) return first; };
    const newRef = (node: HTMLTextAreaElement | null) => { if (node) return second; };
    const { rerender, unmount } = render(<StrictMode><TextAreaAdapter ref={oldRef} /></StrictMode>);
    const initial = first.mock.calls.length;
    rerender(<StrictMode><TextAreaAdapter ref={newRef} /></StrictMode>);
    expect(first).toHaveBeenCalledTimes(initial + 1);
    const replacement = second.mock.calls.length;
    unmount();
    expect(first).toHaveBeenCalledTimes(initial + 1);
    expect(second).toHaveBeenCalledTimes(replacement + 1);
  });

  it('Accordion batching publishes each transition once in StrictMode', () => {
    const change = vi.fn();
    const { result } = renderHook(() => useAccordion({ multiple: true, onValueChange: change }), { wrapper: StrictMode });
    act(() => { result.current.toggle('a'); result.current.toggle('b'); result.current.toggle('a'); });
    expect(result.current.value).toEqual(['b']);
    expect(change.mock.calls).toEqual([[['a']], [['a', 'b']], [['b']]]);
  });

  it('Accordion respects rejected controlled selection, including null', () => {
    const change = vi.fn();
    const { result } = renderHook(() => useAccordion({ value: null, onValueChange: change }));
    act(() => { result.current.toggle('a'); result.current.toggle('a'); });
    expect(result.current.value).toBeNull();
    expect(change.mock.calls).toEqual([['a'], ['a']]);
  });

  it('Select invalid events identify the input and honor cancellation of focus', () => {
    let target: EventTarget | undefined, currentTarget: EventTarget | undefined;
    const slotInvalid = vi.fn();
    const { container } = render(<><button>Outside</button><SelectAdapter options={options} required
      onInvalid={event => { target = event.target; currentTarget = event.currentTarget; event.preventDefault(); }}
      slotProps={{ control: { onInvalid: slotInvalid } }} /></>);
    const outside = screen.getByRole('button');
    outside.focus();
    fireEvent.invalid(container.querySelector('select')!);
    expect(target).toBe(screen.getByRole('combobox'));
    expect(currentTarget).toBe(target);
    expect(slotInvalid).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(outside);
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe('true');
  });

  it('Select canceled form reset preserves selection, popup, and validation', async () => {
    const { container } = render(<form onReset={event => event.preventDefault()}><SelectAdapter options={options} required defaultValue="a" /></form>);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Boris' }));
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.invalid(container.querySelector('select')!);
    await act(async () => { container.querySelector('form')!.reset(); });
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Boris');
    expect(screen.getByRole('combobox').getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe('true');
  });

  it('Select detaches reset from the old form and keeps explicit invalid', async () => {
    function Page({ form }: { form: string }) {
      return <><form id="one" /><form id="two" /><SelectAdapter options={options} invalid form={form} defaultValue="a" /></>;
    }
    const { container, rerender } = render(<Page form="one" />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Boris' }));
    rerender(<Page form="two" />);
    await act(async () => { (container.querySelector('#one') as HTMLFormElement).reset(); });
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Boris');
    await act(async () => { (container.querySelector('#two') as HTMLFormElement).reset(); });
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Anna');
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe('true');
  });

  it.each(['checkbox', 'radio'] as const)('%s group resets only through its current form', async kind => {
    function Page({ form }: { form: string }) {
      return <><form id="one" /><form id="two" />{kind === 'checkbox'
        ? <CheckboxGroupAdapter options={options} form={form} defaultValue={['a']} />
        : <RadioGroupAdapter options={options} form={form} defaultValue="a" />}</>;
    }
    const { container, rerender } = render(<Page form="one" />);
    fireEvent.click(screen.getByRole(kind, { name: 'Boris' }));
    rerender(<Page form="two" />);
    await act(async () => { (container.querySelector('#one') as HTMLFormElement).reset(); });
    expect((screen.getByRole(kind, { name: 'Boris' }) as HTMLInputElement).checked).toBe(true);
    await act(async () => { (container.querySelector('#two') as HTMLFormElement).reset(); });
    expect((screen.getByRole(kind, { name: 'Boris' }) as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole(kind, { name: 'Anna' }) as HTMLInputElement).checked).toBe(true);
  });
  it('D01 Tabs must not navigate during IME composition', () => {
    const change = vi.fn();
    render(<TabsAdapter defaultValue="a" onValueChange={change}>
      <TabsAdapter.List><TabsAdapter.Tab value="a">Anna</TabsAdapter.Tab><TabsAdapter.Tab value="b">Boris</TabsAdapter.Tab></TabsAdapter.List>
      <TabsAdapter.Panel value="a">A</TabsAdapter.Panel><TabsAdapter.Panel value="b">B</TabsAdapter.Panel>
    </TabsAdapter>);
    const tab = screen.getByRole('tab', { name: 'Anna' });
    tab.focus();
    const accepted = fireEvent.keyDown(tab, { key: 'ArrowRight', isComposing: true });
    expect(change).not.toHaveBeenCalled();
    expect(accepted).toBe(true);
    expect(document.activeElement).toBe(tab);
  });

  it('D02 Menu must leave IME arrow keys to the input method', () => {
    render(<MenuAdapter items={options} />);
    const first = screen.getByRole('menuitem', { name: 'Anna' });
    first.focus();
    const accepted = fireEvent.keyDown(first, { key: 'ArrowDown', isComposing: true });
    expect(document.activeElement).toBe(first);
    expect(accepted).toBe(true);
  });

  it('D03 Select must deliver the declared control onInvalid callback', () => {
    const invalid = vi.fn();
    const { container } = render(<SelectAdapter options={options} required onInvalid={invalid} />);
    fireEvent.invalid(container.querySelector('select')!);
    expect(invalid).toHaveBeenCalledOnce();
  });

  it('D04 Select must preserve an accessible name supplied by the popup slot', () => {
    render(<SelectAdapter options={options} aria-label="Owner" slotProps={{ popup: { 'aria-label': 'Available owners' } }} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Owner' }));
    expect(screen.getByRole('listbox', { name: 'Available owners' })).toBeTruthy();
  });

  it('D05 Select must follow a changed native form association when resetting', async () => {
    function Page({ form }: { form: string }) {
      return <><form id="one" /><form id="two" /><SelectAdapter options={options} aria-label="Owner" form={form} defaultValue="a" /></>;
    }
    const { rerender, container } = render(<Page form="one" />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Boris' }));
    rerender(<Page form="two" />);
    await act(async () => { (container.querySelector('#two') as HTMLFormElement).reset(); });
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('Anna');
  });

  it('D06 two uncontrolled Accordion toggles in one action must both be applied', () => {
    const { result } = renderHook(() => useAccordion({ multiple: true }));
    act(() => { result.current.toggle('a'); result.current.toggle('b'); });
    expect(result.current.value).toEqual(['a', 'b']);
  });

  it('D07 controlled Select validity must reflect a valid value supplied after validation', () => {
    const { rerender, container } = render(<SelectAdapter options={options} required value={null} />);
    fireEvent.invalid(container.querySelector('select')!);
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBe('true');
    rerender(<SelectAdapter options={options} required value="a" />);
    expect(container.querySelector('select')!.validity.valid).toBe(true);
    expect(screen.getByRole('combobox').getAttribute('aria-invalid')).toBeNull();
  });

  it('D08 TextArea must run the cleanup returned by a React 19 consumer ref', () => {
    const dispose = vi.fn();
    const { unmount } = render(<TextAreaAdapter ref={element => { if (element) return dispose; }} />);
    unmount();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it('control: Accordion toggles separated by commits accumulate correctly', () => {
    const { result } = renderHook(() => useAccordion({ multiple: true }));
    act(() => result.current.toggle('a'));
    act(() => result.current.toggle('b'));
    expect(result.current.value).toEqual(['a', 'b']);
  });

  it('control: rejected controlled Select changes do not overwrite caller state', () => {
    const change = vi.fn();
    render(<SelectAdapter options={options} multiple value={['a']} onValueChange={change} />);
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Boris' }));
    fireEvent.click(screen.getByRole('option', { name: 'Boris' }));
    expect(change.mock.calls).toEqual([[['a', 'b']], [['a', 'b']]]);
    expect(screen.getByRole('option', { name: 'Boris' }).getAttribute('aria-selected')).toBe('false');
  });

  it('control: Tooltip timer uses new props, surviving sibling unmount without cross-instance state', () => {
    vi.useFakeTimers();
    const oldChange = vi.fn(), newChange = vi.fn();
    function Page({ latest = false, sibling = true }) {
      return <StrictMode><TooltipAdapter content="first" onOpenChange={latest ? newChange : oldChange}>
        {props => <button {...props}>First</button>}
      </TooltipAdapter>{sibling && <TooltipAdapter content="second">{props => <button {...props}>Second</button>}</TooltipAdapter>}</StrictMode>;
    }
    const { rerender, unmount } = render(<Page />);
    fireEvent.pointerEnter(screen.getByRole('button', { name: 'First' }));
    fireEvent.pointerLeave(screen.getByRole('button', { name: 'First' }));
    rerender(<Page latest sibling={false} />);
    act(() => vi.advanceTimersByTime(100));
    expect(newChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(oldChange).toHaveBeenCalledExactlyOnceWith(true);
    expect(screen.queryByRole('tooltip')).toBeNull();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('control: Checkbox keeps a controlled indeterminate flag after native form reset', () => {
    const { container } = render(<form><CheckboxAdapter indeterminate aria-label="All" /></form>);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    act(() => (container.querySelector('form') as HTMLFormElement).reset());
    expect(input.indeterminate).toBe(true);
  });

  it('control: StrictMode Toast duration replacement cancels the old deadline', () => {
    vi.useFakeTimers();
    const change = vi.fn();
    const { rerender, unmount } = render(<StrictMode><ToastAdapter title="Timer" open duration={1000} onOpenChange={change} /></StrictMode>);
    act(() => vi.advanceTimersByTime(900));
    rerender(<StrictMode><ToastAdapter title="Timer" open duration={2000} onOpenChange={change} /></StrictMode>);
    act(() => vi.advanceTimersByTime(1999));
    expect(change).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(change).toHaveBeenCalledExactlyOnceWith(false);
    unmount();
    act(() => vi.runAllTimers());
    expect(change).toHaveBeenCalledOnce();
  });

  it('control: reversed clipboard completion and unmount cannot publish stale results', async () => {
    let oldDone!: () => void, newDone!: () => void;
    const write = vi.fn().mockImplementationOnce(() => new Promise<void>(resolve => { oldDone = resolve; }))
      .mockImplementationOnce(() => new Promise<void>(resolve => { newDone = resolve; }));
    vi.stubGlobal('navigator', { clipboard: { writeText: write } });
    const copied = vi.fn();
    const { rerender, unmount } = render(<StrictMode><CodeBlockAdapter code="old" onCopy={copied} /></StrictMode>);
    fireEvent.click(screen.getByRole('button'));
    rerender(<StrictMode><CodeBlockAdapter code="new" onCopy={copied} /></StrictMode>);
    fireEvent.click(screen.getByRole('button'));
    await act(async () => { newDone(); });
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
    unmount();
    await act(async () => { oldDone(); });
    expect(copied).toHaveBeenCalledExactlyOnceWith('new');
  });
});
