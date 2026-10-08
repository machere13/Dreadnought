import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ButtonAdapter as Button } from '../../../src/Controls/Button/ButtonAdapter.tsx';
import { ToolbarAdapter } from '../../../src/unstyled.ts';
import { useToolbarItem } from '../../../src/logic.ts';
import { ThreeTools, Tool } from './ToolbarFixture.tsx';

afterEach(cleanup);
describe('ToolbarAdapter', () => {
  it('provides one enabled tab stop without visual classes', () => {
    render(<ThreeTools />);
    const root = screen.getByRole('toolbar');
    expect(root.getAttribute('aria-orientation')).toBe('horizontal');
    expect(root.className).toBe('');
    expect(screen.getByRole('button', { name: 'save' }).tabIndex).toBe(0);
    expect(screen.getByRole('button', { name: 'copy' }).tabIndex).toBe(-1);
    expect(screen.getByRole('button', { name: 'blocked' }).tabIndex).toBe(-1);
  });
  it('forwards native properties, callbacks and root ref in native mode', () => {
    const ref = createRef<HTMLDivElement>();
    let clicks = 0;
    render(
      <ToolbarAdapter
        ref={ref}
        navigation="native"
        orientation="vertical"
        aria-label="Filters"
        className="custom"
        tabIndex={2}
        data-purpose="filters"
        onClick={() => clicks++}
      >
        <input aria-label="Search" />
      </ToolbarAdapter>,
    );
    expect(screen.getByRole('group')).toBe(ref.current);
    expect(ref.current?.className).toBe('custom');
    expect(ref.current?.getAttribute('aria-orientation')).toBeNull();
    expect(ref.current?.getAttribute('data-purpose')).toBe('filters');
    expect(ref.current?.tabIndex).toBe(2);
    expect(screen.getByRole('textbox').getAttribute('tabindex')).toBeNull();
    fireEvent.click(screen.getByRole('textbox'));
    expect(clicks).toBe(1);
  });
  it('keeps consumer object and cleanup callback refs', () => {
    const ref = createRef<HTMLButtonElement>();
    let attached: HTMLButtonElement | null = null;
    function Custom() {
      const { itemProps } = useToolbarItem<HTMLButtonElement>({
        value: 'library',
        ref: (node) => {
          attached = node;
          return () => {
            attached = null;
          };
        },
      });
      return <Button {...itemProps}>Library</Button>;
    }
    const view = render(
      <ToolbarAdapter aria-label="Commands">
        <Tool value="own" itemRef={ref} />
        <Custom />
      </ToolbarAdapter>,
    );
    expect(ref.current).toBe(screen.getByRole('button', { name: 'own' }));
    expect(attached).toBe(screen.getByRole('button', { name: 'Library' }));
    view.unmount();
    expect(ref.current).toBeNull();
    expect(attached).toBeNull();
  });
  it('honors consumer cancellation of focus activation', () => {
    render(
      <ToolbarAdapter aria-label="Commands">
        <Tool value="first" />
        <Tool value="second" onFocus={(event) => event.preventDefault()} />
      </ToolbarAdapter>,
    );
    fireEvent.focus(screen.getByRole('button', { name: 'second' }));
    expect(screen.getByRole('button', { name: 'first' }).tabIndex).toBe(0);
  });
  it('leaves optional native participants without a tabindex override', () => {
    render(
      <ToolbarAdapter navigation="native" aria-label="Commands">
        <Tool value="own" />
      </ToolbarAdapter>,
    );
    expect(screen.getByRole('button').getAttribute('tabindex')).toBeNull();
  });
  it('reports a hook outside its provider', () => {
    expect(() => render(<Tool value="outside" />)).toThrow(/inside Toolbar/);
  });
  it('reports duplicate participant keys', () => {
    expect(() =>
      render(
        <ToolbarAdapter aria-label="Commands">
          <Tool value="same" />
          <Tool value="same" />
        </ToolbarAdapter>,
      ),
    ).toThrow(/duplicate.*same/i);
  });
});
