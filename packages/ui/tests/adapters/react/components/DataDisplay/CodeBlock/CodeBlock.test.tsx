import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CodeBlockAdapter } from '@dreadnought/react/unstyled';
import { CodeBlock } from '@dreadnought/ui/react';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('CodeBlock', () => {
  it('styles only the ready facade and preserves consumer classes, attrs, and ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<>
      <CodeBlock code="one" language="ts" ref={ref} className="my-root" title="Example"
        slotClassNames={{ header: 'my-header', pre: 'my-pre', code: 'my-code', copyButton: 'my-copy' }} />
      <CodeBlockAdapter code="two" />
    </>);
    const ready = screen.getByText('one').closest('[data-ui="code-block"]');
    const unstyled = screen.getByText('two').closest('[data-ui="code-block"]');
    expect(ref.current).toBe(ready);
    expect(ready?.className).toContain('dreadnought-text-code-block');
    expect(ready?.className).toContain('my-root');
    expect(ready?.getAttribute('title')).toBe('Example');
    expect(ready?.querySelector('[data-slot="header"]')?.className).toContain('my-header');
    expect(ready?.querySelector('pre')?.className).toContain('my-pre');
    expect(ready?.querySelector('code')?.className).toContain('my-code');
    expect(ready?.querySelector('button')?.className).toContain('my-copy');
    expect(unstyled?.className).not.toContain('dreadnought-text-code-block');
    expect(unstyled?.querySelector('pre')?.className).toBe('');
  });

  it('uses the adapter copy behavior without duplicating it', async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    render(<CodeBlock code="const x = 1;" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeTruthy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('const x = 1;');
  });
});
