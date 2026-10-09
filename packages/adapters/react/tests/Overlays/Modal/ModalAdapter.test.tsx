import { StrictMode, useEffect, useState } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as adapters from '../../../src/unstyled.ts';

beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value() {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value() {
        this.open = false;
        this.dispatchEvent(new Event('close'));
      },
    },
  });
});
afterEach(() => {
  cleanup();
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
});

function Example(props: Partial<adapters.ModalAdapterProps> = {}) {
  expect(adapters).toHaveProperty('ModalAdapter');
  return (
    <adapters.ModalAdapter
      aria-label="Profile"
      content={({ close }) => (
        <>
          <input aria-label="Name" />
          <button type="button" onClick={close}>
            Done
          </button>
        </>
      )}
      {...props}
    >
      {(trigger) => <button {...trigger}>Edit</button>}
    </adapters.ModalAdapter>
  );
}
const opener = () => screen.getByRole('button', { name: 'Edit' });
const panel = () => screen.getByRole('dialog', { name: 'Profile' }) as HTMLDialogElement;

describe.each(['ModalAdapter', 'DrawerAdapter'] as const)('%s content lifecycle', (name) => {
  const Overlay = adapters[name];

  it.each([undefined, 'lazy', 'unmount'] as const)(
    'uses %s while retaining the dialog shell',
    (mountPolicy) => {
      let mounts = 0;
      let cleanups = 0;
      let contentCalls = 0;
      function Draft() {
        useEffect(() => {
          mounts++;
          return () => {
            cleanups++;
          };
        }, []);
        return <input aria-label="Draft" defaultValue="Initial" />;
      }
      const { container, unmount } = render(
        <Overlay
          aria-label="Draft window"
          mountPolicy={mountPolicy}
          content={({ close }) => {
            contentCalls++;
            return (
              <>
                <Draft />
                <button onClick={close}>Done</button>
              </>
            );
          }}
        >
          {(trigger) => <button {...trigger}>Edit draft</button>}
        </Overlay>,
      );
      const dialog = container.querySelector('dialog')!;
      const trigger = screen.getByRole('button', { name: 'Edit draft' });
      expect(dialog.open).toBe(false);
      expect(dialog.hasAttribute('mountPolicy')).toBe(false);
      expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
      expect(mounts).toBe(mountPolicy === undefined ? 1 : 0);
      if (mountPolicy !== undefined) expect(contentCalls).toBe(0);
      trigger.focus();
      fireEvent.click(trigger);
      expect(dialog.open).toBe(true);
      expect(document.documentElement.style.overflow).toBe('hidden');
      const input = screen.getByLabelText('Draft') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Saved' } });
      input.focus();
      fireEvent.click(screen.getByRole('button', { name: 'Done' }));
      expect(container.querySelector('dialog')).toBe(dialog);
      expect(dialog.open).toBe(false);
      expect(document.activeElement).toBe(trigger);
      expect(document.documentElement.style.overflow).not.toBe('hidden');
      expect(screen.queryByLabelText('Draft') === null).toBe(mountPolicy === 'unmount');
      expect(cleanups).toBe(mountPolicy === 'unmount' ? 1 : 0);
      fireEvent.click(trigger);
      expect((screen.getByLabelText('Draft') as HTMLInputElement).value).toBe(
        mountPolicy === 'unmount' ? 'Initial' : 'Saved',
      );
      expect(mounts).toBe(mountPolicy === 'unmount' ? 2 : 1);
      unmount();
      expect(cleanups).toBe(mounts);
    },
  );

  it('retains unmount content until a controlled close is accepted', () => {
    const requests: boolean[] = [];
    const view = (open: boolean) => (
      <Overlay
        open={open}
        mountPolicy="unmount"
        aria-label="Draft window"
        onOpenChange={(next) => requests.push(next)}
        content={<input aria-label="Draft" />}
      >
        {(trigger) => <button {...trigger}>Edit draft</button>}
      </Overlay>
    );
    const { rerender } = render(view(true));
    const input = screen.getByLabelText('Draft');
    fireEvent.change(input, { target: { value: 'Saved' } });
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(requests).toEqual([false]);
    expect(screen.getByLabelText('Draft')).toBe(input);
    expect((input as HTMLInputElement).value).toBe('Saved');
    rerender(view(false));
    expect(screen.queryByLabelText('Draft')).toBeNull();
  });

  it('does not steal outside focus when unmount content closes', () => {
    const view = (open: boolean) => (
      <>
        <Overlay
          open={open}
          mountPolicy="unmount"
          aria-label="Draft window"
          content={<input aria-label="Draft" />}
        >
          {(trigger) => <button {...trigger}>Edit draft</button>}
        </Overlay>
        <button>Outside</button>
      </>
    );
    const { rerender } = render(view(true));
    const outside = screen.getByRole('button', { name: 'Outside' });
    outside.focus();
    rerender(view(false));
    expect(document.activeElement).toBe(outside);
    expect(screen.queryByLabelText('Draft')).toBeNull();
  });

  it('mounts initially open lazy content under StrictMode', () => {
    render(
      <StrictMode>
        <Overlay
          defaultOpen
          mountPolicy="lazy"
          aria-label="Draft window"
          content={<input aria-label="Draft" />}
        >
          {(trigger) => <button {...trigger}>Edit draft</button>}
        </Overlay>
      </StrictMode>,
    );
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByLabelText('Draft')).toBeTruthy();
  });

  it.each(['lazy', 'unmount'] as const)(
    'does not evaluate closed %s content during SSR',
    (mountPolicy) => {
      let calls = 0;
      const view = (open: boolean) => (
        <Overlay
          open={open}
          mountPolicy={mountPolicy}
          content={() => {
            calls++;
            return <span>Server draft</span>;
          }}
        >
          {(trigger) => <button {...trigger}>Edit draft</button>}
        </Overlay>
      );
      expect(renderToString(view(false))).not.toContain('Server draft');
      expect(calls).toBe(0);
      expect(renderToString(view(true))).toContain('Server draft');
      expect(calls).toBe(1);
    },
  );
});
function pointer(
  node: HTMLElement,
  type: 'pointerdown' | 'pointerup',
  clientX: number,
  clientY: number,
) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX,
    clientY,
  });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  fireEvent(node, event);
}

it('opens and closes through native cancel without submitting a form', async () => {
  let submissions = 0;
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submissions++;
      }}
    >
      <Example />
    </form>,
  );
  await userEvent.click(opener());
  expect(panel().open).toBe(true);
  expect(panel().getAttribute('aria-modal')).toBe('true');
  fireEvent(panel(), new Event('cancel', { cancelable: true }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener());
  expect(submissions).toBe(0);
});

it('keeps a controlled dialog open until the parent accepts the request', async () => {
  const requests: boolean[] = [];
  const { rerender } = render(<Example open onOpenChange={(open) => requests.push(open)} />);
  fireEvent(panel(), new Event('cancel', { cancelable: true }));
  expect(panel().open).toBe(true);
  expect(requests).toEqual([false]);
  rerender(<Example open={false} />);
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('honors prevented cancel and closeOnEscape', () => {
  const { rerender } = render(<Example defaultOpen onCancel={(event) => event.preventDefault()} />);
  fireEvent(panel(), new Event('cancel', { cancelable: true }));
  expect(panel().open).toBe(true);
  rerender(<Example closeOnEscape={false} />);
  fireEvent(panel(), new Event('cancel', { cancelable: true }));
  expect(panel().open).toBe(true);
});

it('supports explicit close and repeated cycles under StrictMode', async () => {
  render(
    <StrictMode>
      <Example />
    </StrictMode>,
  );
  for (let cycle = 0; cycle < 2; cycle++) {
    await userEvent.click(opener());
    fireEvent(panel(), new Event('close'));
    expect(panel().open).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener());
  }
});

it('synchronizes native close and reopens after a controlled refusal', () => {
  const { rerender } = render(<Example defaultOpen />);
  act(() => panel().close());
  expect(screen.queryByRole('dialog')).toBeNull();
  const requests: boolean[] = [];
  rerender(<Example open onOpenChange={(open) => requests.push(open)} />);
  act(() => panel().close());
  expect(panel().open).toBe(true);
  expect(requests).toEqual([false]);
});

it('suppresses disabled opening and releases resources when unmounted', async () => {
  const { rerender, unmount } = render(<Example disabled />);
  await userEvent.click(opener());
  expect(screen.queryByRole('dialog')).toBeNull();
  rerender(<Example open />);
  expect(document.documentElement.style.overflow).toBe('hidden');
  unmount();
  expect(document.documentElement.style.overflow).toBe('');
});

it('keeps scroll locked until both modals close and restores the previous value', () => {
  document.documentElement.style.overflow = 'scroll';
  const { rerender } = render(
    <>
      <Example open />
      <Example open />
    </>,
  );
  expect(document.documentElement.style.overflow).toBe('hidden');
  rerender(
    <>
      <Example open={false} />
      <Example open />
    </>,
  );
  expect(document.documentElement.style.overflow).toBe('hidden');
  rerender(
    <>
      <Example open={false} />
      <Example open={false} />
    </>,
  );
  expect(document.documentElement.style.overflow).toBe('scroll');
  document.documentElement.style.overflow = '';
});

it('dismisses only a backdrop-origin gesture and respects prevented events', () => {
  const { rerender } = render(<Example defaultOpen />);
  const node = panel();
  Object.defineProperty(node, 'getBoundingClientRect', {
    value: () => ({ left: 20, right: 120, top: 20, bottom: 120 }),
  });
  pointer(node, 'pointerdown', 40, 40);
  pointer(node, 'pointerup', 0, 0);
  expect(panel().open).toBe(true);
  rerender(<Example onPointerDown={(event) => event.preventDefault()} />);
  pointer(node, 'pointerdown', 0, 0);
  pointer(node, 'pointerup', 0, 0);
  expect(panel().open).toBe(true);
  rerender(<Example />);
  pointer(node, 'pointerdown', 0, 0);
  pointer(node, 'pointerup', 0, 0);
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('does not restore focus over a deliberate external focus transfer', async () => {
  const { rerender } = render(
    <>
      <Example open />
      <button>Outside</button>
    </>,
  );
  screen.getByRole('textbox').focus();
  screen.getByRole('button', { name: 'Outside' }).focus();
  rerender(
    <>
      <Example open={false} />
      <button>Outside</button>
    </>,
  );
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Outside' }));
});

it('restores focus after accepted controlled closure and ignores removed openers', async () => {
  const { rerender, unmount } = render(<Example />);
  await userEvent.click(opener());
  screen.getByRole('textbox').focus();
  rerender(<Example open={false} />);
  expect(document.activeElement).toBe(opener());
  rerender(<Example open />);
  screen.getByRole('textbox').focus();
  unmount();
  expect(document.activeElement).toBe(document.body);
});

it('reads current callbacks and composes native handlers', async () => {
  const requests: string[] = [];
  const { rerender } = render(<Example open onOpenChange={() => requests.push('old')} />);
  rerender(
    <Example
      open
      onOpenChange={() => requests.push('new')}
      onCancel={() => requests.push('cancel')}
    />,
  );
  screen.getByRole('textbox').focus();
  fireEvent(panel(), new Event('cancel', { cancelable: true }));
  expect(requests).toEqual(['cancel', 'new']);
  expect(document.activeElement).toBe(screen.getByRole('textbox'));
});

it('does not serialize nonmodal open markup during SSR', () => {
  const html = renderToString(<Example open />);
  expect(html).toContain('<dialog');
  expect(html).not.toMatch(/<dialog[^>]*\sopen(?:=|\s|>)/);
});

it('wraps Tab at the visible controls without hijacking interior or prevented navigation', async () => {
  render(
    <Example
      defaultOpen
      content={({ close }) => (
        <>
          <div hidden>
            <button>Hidden</button>
          </div>
          <button disabled>Disabled</button>
          <input aria-label="First" />
          <button type="button" onClick={close}>
            Last
          </button>
        </>
      )}
    />,
  );
  const first = screen.getByRole('textbox', { name: 'First' });
  const last = screen.getByRole('button', { name: 'Last' });
  first.focus();
  await userEvent.tab();
  expect(document.activeElement).toBe(last);
  await userEvent.tab();
  expect(document.activeElement).toBe(first);
  await userEvent.tab({ shift: true });
  expect(document.activeElement).toBe(last);
  for (const flags of [
    { isComposing: true },
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
  ]) {
    expect(fireEvent.keyDown(last, { key: 'Tab', ...flags })).toBe(true);
  }
});

it('honors consumer keydown cancellation at the focus boundary', () => {
  render(<Example defaultOpen onKeyDown={(event) => event.preventDefault()} />);
  const last = screen.getByRole('button', { name: 'Done' });
  last.focus();
  fireEvent.keyDown(last, { key: 'Tab' });
  expect(document.activeElement).toBe(last);
});

it('uses the checked radio as the group tab stop at either boundary', async () => {
  render(
    <Example
      defaultOpen
      content={
        <>
          <input type="radio" name="choice" aria-label="A" />
          <input type="radio" name="choice" aria-label="B" defaultChecked />
          <button type="button">Last</button>
        </>
      }
    />,
  );
  const checked = screen.getByRole('radio', { name: 'B' });
  const last = screen.getByRole('button', { name: 'Last' });
  last.focus();
  await userEvent.tab();
  expect(document.activeElement).toBe(checked);
  await userEvent.tab({ shift: true });
  expect(document.activeElement).toBe(last);
});

it('respects positive tabindex order at focus boundaries', async () => {
  render(
    <Example
      defaultOpen
      content={
        <>
          <input aria-label="Second" tabIndex={2} />
          <input aria-label="First" tabIndex={1} />
          <button type="button">Last</button>
        </>
      }
    />,
  );
  screen.getByRole('button', { name: 'Last' }).focus();
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'First' }));
});

it('filters queued stale close notifications before consumer handlers', () => {
  const pending: (() => void)[] = [];
  const notifications: string[] = [];
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() {
      this.open = false;
      pending.push(() => this.dispatchEvent(new Event('close')));
    },
  });
  function Controlled() {
    const [open, setOpen] = useState(true);
    return (
      <Example
        open={open}
        onOpenChange={setOpen}
        onClose={() => {
          notifications.push('close');
          setOpen(false);
        }}
      />
    );
  }
  render(
    <StrictMode>
      <Controlled />
    </StrictMode>,
  );
  expect(panel().open).toBe(true);
  expect(pending).toHaveLength(1);
  act(() => pending.shift()!());
  expect(panel().open).toBe(true);
  expect(notifications).toEqual([]);
});

it('delivers native close handlers for an actual completed closure', () => {
  const pending: (() => void)[] = [];
  const notifications: string[] = [];
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() {
      this.open = false;
      pending.push(() => this.dispatchEvent(new Event('close')));
    },
  });
  const props = { onClose: () => notifications.push('close') };
  const { rerender } = render(<Example open {...props} />);
  rerender(<Example open={false} {...props} />);
  act(() => pending.shift()!());
  expect(notifications).toEqual(['close']);
  expect(screen.queryByRole('dialog')).toBeNull();
});
