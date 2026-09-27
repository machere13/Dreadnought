import { createRef } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeBlockAdapter } from '../../../src/unstyled.ts';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function clipboard(writeText: (text: string) => Promise<void>) {
  vi.stubGlobal('navigator', { clipboard: { writeText } });
}

describe('CodeBlockAdapter', () => {
  it('renders code as text, forwards root props/ref, and accepts slot classes', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <CodeBlockAdapter code={'<b>one</b>\n'} language="tsx" ref={ref} className="custom" title="Example"
        slotClassNames={{ header: 'h', pre: 'p', code: 'c', copyButton: 'b' }} />,
    );
    expect(ref.current?.getAttribute('data-ui')).toBe('code-block');
    expect(ref.current?.getAttribute('title')).toBe('Example');
    expect(ref.current?.className).toBe('custom');
    expect(container.querySelector('code')?.textContent).toBe('<b>one</b>\n');
    expect(container.querySelector('code b')).toBeNull();
    expect(container.querySelector('[data-slot="header"]')?.className).toBe('h');
    expect(container.querySelector('pre')?.className).toBe('p');
    expect(container.querySelector('code')?.className).toBe('c');
    expect(screen.getByRole('button', { name: 'Copy' }).className).toBe('b');
    expect(screen.getByText('tsx').getAttribute('data-slot')).toBe('language');
  });

  it('omits the toolbar when neither language nor copying is requested', () => {
    const { container } = render(<CodeBlockAdapter code="" copyable={false} />);
    expect(container.querySelector('[data-slot="header"]')).toBeNull();
    expect(container.querySelector('code')?.textContent).toBe('');
  });

  it('shows language without a button if copying is disabled', () => {
    render(<CodeBlockAdapter code="hello" language="txt" copyable={false} />);
    expect(screen.getByText('txt')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('copies exact text, reports success, and cannot submit a parent form', async () => {
    const writeText = vi.fn(async () => {});
    clipboard(writeText);
    const onCopy = vi.fn();
    const submit = vi.fn((event: Event) => event.preventDefault());
    render(<form onSubmit={submit}><CodeBlockAdapter code={'a\n'} onCopy={onCopy} copyLabels={{ copy: 'Копировать', copied: 'Готово', error: 'Ошибка' }} /></form>);
    const button = screen.getByRole('button', { name: 'Копировать' });
    expect(button.getAttribute('type')).toBe('button');
    fireEvent.click(button);
    expect(await screen.findByRole('button', { name: 'Готово' })).toBeTruthy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('a\n');
    expect(onCopy).toHaveBeenCalledExactlyOnceWith('a\n');
    expect(submit).not.toHaveBeenCalled();
  });

  it('shows failure and allows retry after clipboard rejection', async () => {
    const failure = new Error('denied');
    const writeText = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce(undefined);
    clipboard(writeText);
    const onCopyError = vi.fn();
    render(<CodeBlockAdapter code="retry" onCopyError={onCopyError} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(await screen.findByRole('button', { name: 'Copy failed' })).toBeTruthy();
    expect(onCopyError).toHaveBeenCalledExactlyOnceWith(failure);
    fireEvent.click(screen.getByRole('button', { name: 'Copy failed' }));
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeTruthy();
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it('handles an absent Clipboard API as an error', async () => {
    vi.stubGlobal('navigator', {});
    const onCopyError = vi.fn();
    render(<CodeBlockAdapter code="x" onCopyError={onCopyError} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(await screen.findByRole('button', { name: 'Copy failed' })).toBeTruthy();
    expect(onCopyError).toHaveBeenCalledOnce();
  });

  it('ignores repeated clicks while a write is pending', async () => {
    let resolveWrite!: () => void;
    const writeText = vi.fn(() => new Promise<void>((resolve) => { resolveWrite = resolve; }));
    clipboard(writeText);
    render(<CodeBlockAdapter code="once" />);
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(writeText).toHaveBeenCalledOnce();
    resolveWrite();
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeTruthy();
  });

  it('does not apply a stale result after the code changes', async () => {
    let resolveWrite!: () => void;
    const writeText = vi.fn(() => new Promise<void>((resolve) => { resolveWrite = resolve; }));
    clipboard(writeText);
    const onCopy = vi.fn();
    const { rerender } = render(<CodeBlockAdapter code="old" onCopy={onCopy} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    rerender(<CodeBlockAdapter code="new" onCopy={onCopy} />);
    resolveWrite();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copy' })).toBeTruthy());
    expect(onCopy).not.toHaveBeenCalled();
  });
});
