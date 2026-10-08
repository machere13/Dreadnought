import { useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TabsAdapter } from '../../../src/unstyled.ts';

afterEach(cleanup);

function Sample({ onValueChange }: { onValueChange?: (value: string) => void }) {
  return (
    <TabsAdapter defaultValue="a" onValueChange={onValueChange}>
      <TabsAdapter.List aria-label="Sections">
        <TabsAdapter.Tab value="a">A</TabsAdapter.Tab>
        <TabsAdapter.Tab value="b" disabled>
          B
        </TabsAdapter.Tab>
        <TabsAdapter.Tab value="c">C</TabsAdapter.Tab>
      </TabsAdapter.List>
      <TabsAdapter.Panel value="a">Alpha</TabsAdapter.Panel>
      <TabsAdapter.Panel value="b">Beta</TabsAdapter.Panel>
      <TabsAdapter.Panel value="c">Gamma</TabsAdapter.Panel>
    </TabsAdapter>
  );
}

describe('TabsAdapter', () => {
  it('connects a named tablist, selected tab and matching panel', () => {
    render(<Sample />);
    const tab = screen.getByRole('tab', { name: 'A' });
    const panel = screen.getByRole('tabpanel', { name: 'A' });
    expect(screen.getByRole('tablist', { name: 'Sections' })).toBeTruthy();
    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
    expect(tab.getAttribute('aria-selected')).toBe('true');
    expect(tab.getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('tab', { name: 'C' }).getAttribute('tabindex')).toBe('-1');
    expect(panel.hasAttribute('hidden')).toBe(false);
    expect(screen.getByText('Gamma').hasAttribute('hidden')).toBe(true);
  });

  it('wraps arrow navigation and skips a disabled tab', async () => {
    const onValueChange = vi.fn();
    render(<Sample onValueChange={onValueChange} />);
    const user = userEvent.setup();
    screen.getByRole('tab', { name: 'A' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'C' }).getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'C' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'A' }).getAttribute('aria-selected')).toBe('true');
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it('keeps registration order when tab elements are in disconnected portal roots', () => {
    const roots = Array.from({ length: 3 }, () => document.createElement('div'));
    render(
      <TabsAdapter defaultValue="a">
        <TabsAdapter.List aria-label="Sections">
          {createPortal(<TabsAdapter.Tab value="a">A</TabsAdapter.Tab>, roots[0])}
          {createPortal(<TabsAdapter.Tab value="b">B</TabsAdapter.Tab>, roots[1])}
          {createPortal(<TabsAdapter.Tab value="c">C</TabsAdapter.Tab>, roots[2])}
        </TabsAdapter.List>
        <TabsAdapter.Panel value="a">Alpha</TabsAdapter.Panel>
        <TabsAdapter.Panel value="b">Beta</TabsAdapter.Panel>
        <TabsAdapter.Panel value="c">Gamma</TabsAdapter.Panel>
      </TabsAdapter>,
    );

    const first = roots[0].querySelector('button')!;
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(roots[1].querySelector('button')?.getAttribute('aria-selected')).toBe('true');
  });

  it('handles Home and End without intercepting vertical arrows', async () => {
    render(<Sample />);
    const user = userEvent.setup();
    screen.getByRole('tab', { name: 'A' }).focus();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'C' }).getAttribute('aria-selected')).toBe('true');
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'A' }).getAttribute('aria-selected')).toBe('true');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'A' }).getAttribute('aria-selected')).toBe('true');
  });

  it('selects a clicked tab without submitting a form', async () => {
    const submit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Sample />
      </form>,
    );
    await userEvent.setup().click(screen.getByRole('tab', { name: 'C' }));
    expect(screen.getByRole('tab', { name: 'C' }).getAttribute('aria-selected')).toBe('true');
    expect(submit).not.toHaveBeenCalled();
  });

  it('focuses a clicked tab even when click does not focus buttons natively', () => {
    render(<Sample />);
    const tab = screen.getByRole('tab', { name: 'C' });
    fireEvent.click(tab);
    expect(document.activeElement).toBe(tab);
  });

  it('runs callback-ref cleanup for tab and panel on unmount', () => {
    let cleanedTabs = 0;
    let cleanedPanels = 0;
    const { unmount } = render(
      <TabsAdapter defaultValue="a">
        <TabsAdapter.List aria-label="Sections">
          <TabsAdapter.Tab
            value="a"
            ref={(element) => {
              if (element) {
                return () => {
                  cleanedTabs += 1;
                };
              }
            }}
          >
            A
          </TabsAdapter.Tab>
        </TabsAdapter.List>
        <TabsAdapter.Panel
          value="a"
          ref={(element) => {
            if (element) {
              return () => {
                cleanedPanels += 1;
              };
            }
          }}
        >
          Alpha
        </TabsAdapter.Panel>
      </TabsAdapter>,
    );
    unmount();
    expect(cleanedTabs).toBe(1);
    expect(cleanedPanels).toBe(1);
  });

  it('does not select a disabled tab', () => {
    render(<Sample />);
    fireEvent.click(screen.getByRole('tab', { name: 'B' }));
    expect(screen.getByRole('tab', { name: 'A' }).getAttribute('aria-selected')).toBe('true');
  });

  it('honors a controlled value changed by its owner without emitting a change', () => {
    const onValueChange = vi.fn();
    const view = (value: string) => (
      <TabsAdapter value={value} onValueChange={onValueChange}>
        <TabsAdapter.List aria-label="Sections">
          <TabsAdapter.Tab value="a">A</TabsAdapter.Tab>
          <TabsAdapter.Tab value="c">C</TabsAdapter.Tab>
        </TabsAdapter.List>
        <TabsAdapter.Panel value="a">Alpha</TabsAdapter.Panel>
        <TabsAdapter.Panel value="c">Gamma</TabsAdapter.Panel>
      </TabsAdapter>
    );
    const { rerender } = render(view('a'));
    rerender(view('c'));
    expect(screen.getByRole('tab', { name: 'C' }).getAttribute('aria-selected')).toBe('true');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps inactive panel state mounted', async () => {
    function Counter() {
      const [count, setCount] = useState(0);
      return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
    }
    render(
      <TabsAdapter defaultValue="a">
        <TabsAdapter.List aria-label="Sections">
          <TabsAdapter.Tab value="a">A</TabsAdapter.Tab>
          <TabsAdapter.Tab value="c">C</TabsAdapter.Tab>
        </TabsAdapter.List>
        <TabsAdapter.Panel value="a">
          <Counter />
        </TabsAdapter.Panel>
        <TabsAdapter.Panel value="c">Gamma</TabsAdapter.Panel>
      </TabsAdapter>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Count 0' }));
    await user.click(screen.getByRole('tab', { name: 'C' }));
    await user.click(screen.getByRole('tab', { name: 'A' }));
    expect(screen.getByRole('button', { name: 'Count 1' })).toBeTruthy();
  });

  it('creates matching IDs for unusual values and independent roots', () => {
    render(
      <>
        <TabsAdapter defaultValue="слой %">
          <TabsAdapter.List aria-label="First">
            <TabsAdapter.Tab value="слой %">First</TabsAdapter.Tab>
          </TabsAdapter.List>
          <TabsAdapter.Panel value="слой %">Panel 1</TabsAdapter.Panel>
        </TabsAdapter>
        <TabsAdapter defaultValue="слой %">
          <TabsAdapter.List aria-label="Second">
            <TabsAdapter.Tab value="слой %">Second</TabsAdapter.Tab>
          </TabsAdapter.List>
          <TabsAdapter.Panel value="слой %">Panel 2</TabsAdapter.Panel>
        </TabsAdapter>
      </>,
    );
    const first = screen.getByRole('tab', { name: 'First' });
    const second = screen.getByRole('tab', { name: 'Second' });
    expect(first.id).not.toBe(second.id);
    expect(first.getAttribute('aria-controls')).toBe(
      screen.getByRole('tabpanel', { name: 'First' }).id,
    );
    expect(second.getAttribute('aria-controls')).toBe(
      screen.getByRole('tabpanel', { name: 'Second' }).id,
    );
  });

  it.each(['empty', 'duplicate'])('rejects %s tab values', (name) => {
    const tabs =
      name === 'empty' ? (
        <TabsAdapter.Tab value="">A</TabsAdapter.Tab>
      ) : (
        <>
          <TabsAdapter.Tab value="a">A</TabsAdapter.Tab>
          <TabsAdapter.Tab value="a">B</TabsAdapter.Tab>
        </>
      );
    expect(() =>
      render(
        <TabsAdapter defaultValue="a">
          <TabsAdapter.List aria-label="Sections">{tabs}</TabsAdapter.List>
          <TabsAdapter.Panel value="a">Alpha</TabsAdapter.Panel>
        </TabsAdapter>,
      ),
    ).toThrow();
  });

  it('rejects a missing matching panel', () => {
    expect(() =>
      render(
        <TabsAdapter defaultValue="a">
          <TabsAdapter.List aria-label="Sections">
            <TabsAdapter.Tab value="a">A</TabsAdapter.Tab>
          </TabsAdapter.List>
        </TabsAdapter>,
      ),
    ).toThrow();
  });

  it('rejects an invalid controlled selection instead of choosing another tab', () => {
    expect(() =>
      render(
        <TabsAdapter value="missing">
          <TabsAdapter.List aria-label="Sections">
            <TabsAdapter.Tab value="a">A</TabsAdapter.Tab>
          </TabsAdapter.List>
          <TabsAdapter.Panel value="a">Alpha</TabsAdapter.Panel>
        </TabsAdapter>,
      ),
    ).toThrow();
  });
});
