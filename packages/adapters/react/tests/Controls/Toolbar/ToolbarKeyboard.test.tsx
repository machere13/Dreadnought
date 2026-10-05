import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { InputAdapter, SelectAdapter, ToolbarAdapter } from '../../../src/unstyled.ts';
import { ThreeTools, Tool } from './ToolbarFixture.tsx';

afterEach(cleanup);
describe('Toolbar keyboard', () => {
  it('skips disabled tools and remembers the entry point after leaving with Tab', async () => {
    const user = userEvent.setup();
    render(<><ThreeTools /><button>Outside</button></>);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'copy' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'copy' }));
  });
  it('wraps horizontally and supports Home/End without consuming vertical arrows', async () => {
    const user = userEvent.setup();
    render(<ThreeTools />);
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'copy' }));
    await user.keyboard('{ArrowRight}{End}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'copy' }));
    expect(fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })).toBe(true);
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'save' }));
  });
  it('uses vertical arrows and clamps at both edges without loop', async () => {
    const user = userEvent.setup();
    render(<ThreeTools orientation="vertical" loop={false} />);
    await user.tab();
    await user.keyboard('{ArrowUp}{ArrowDown}{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'copy' }));
    expect(fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })).toBe(true);
    await user.keyboard('{Home}{ArrowUp}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'save' }));
  });
  it.each([{ altKey: true }, { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { isComposing: true }])('ignores modified and composing keys %o', async (modifiers) => {
    render(<ThreeTools />);
    await userEvent.tab();
    expect(fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight', ...modifiers })).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'save' }));
  });
  it('lets the consumer cancel navigation and leaves native activation to the button', async () => {
    let clicks = 0;
    render(<ToolbarAdapter aria-label="Commands"><Tool value="first" onKeyDown={(event) => { if (event.key === 'ArrowRight') event.preventDefault(); }} onClick={() => clicks++} /><Tool value="second" /></ToolbarAdapter>);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}{Enter} ');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'first' }));
    expect(clicks).toBe(2);
  });
  it('does not intercept native input cursor keys or Select keyboard selection', async () => {
    const user = userEvent.setup();
    render(<ToolbarAdapter navigation="native" aria-label="Filters"><InputAdapter aria-label="Search" /><SelectAdapter aria-label="Status" options={[{ value: 'a', label: 'Active' }, { value: 'b', label: 'Archived' }]} /><button>Apply</button></ToolbarAdapter>);
    await user.tab();
    await user.keyboard('query');
    const input = screen.getByRole('textbox') as HTMLInputElement;
    input.setSelectionRange(2, 2);
    expect(fireEvent.keyDown(input, { key: 'ArrowLeft' })).toBe(true);
    expect(input.value).toBe('query');
    expect(input.selectionStart).toBe(2);
    await user.tab();
    const select = screen.getByRole('combobox') as HTMLInputElement;
    expect(document.activeElement).toBe(select);
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(select.value).toBe('Archived');
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Apply' }));
  });
  it('isolates nested toolbars', async () => {
    render(<ToolbarAdapter aria-label="Outer"><Tool value="outer" /><ThreeTools /></ToolbarAdapter>);
    await userEvent.click(screen.getByRole('button', { name: 'save' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'copy' }));
    expect(screen.getByRole('button', { name: 'outer' }).tabIndex).toBe(0);
  });
  it('does not handle keys from an independently focusable descendant', () => {
    render(<ToolbarAdapter aria-label="Commands"><Tool value="first"><span tabIndex={0}>Nested control</span></Tool><Tool value="second" /></ToolbarAdapter>);
    const nested = screen.getByText('Nested control');
    nested.focus();
    expect(fireEvent.keyDown(nested, { key: 'ArrowRight' })).toBe(true);
    expect(document.activeElement).toBe(nested);
  });
});
