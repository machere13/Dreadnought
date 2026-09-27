# CodeBlock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable code display component with optional built-in copying for the landing page and documentation.

**Architecture:** Reuse `@dreadnought/core`'s existing `copy(text)` action; do not invent a `CodeBlockCore`. The unstyled React adapter owns `<pre><code>`, copy state and accessibility. The ready UI facade adds CSS Module classes and default-theme tokens without duplicating behavior.

**Tech Stack:** TypeScript, React 19, CSS Modules, CSS Custom Properties, Vitest, Testing Library, Storybook 10, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-27-code-block-design.md`

## Global Constraints

- First version: no syntax highlighting, line numbers, execution, or range highlighting.
- `code: string` is copied exactly; empty strings and trailing newlines are valid.
- `copyable` defaults to `true`; no toolbar appears when both copying and language are absent.
- No new core action or empty `CodeBlockCore`; layer 2 imports no CSS or theme.
- Ready styling uses a local CSS Module, component tokens and existing global tokens, without `!important`.
- New component names and folders use PascalCase; functions and hooks use camelCase; tests mirror `src/` under `tests/`.
- Preserve the unrelated deletion of `packages/core/src/behaviors/.keep`; do not stage it.

## Review Focus

- Clipboard API absent: clicking copy shows failure and calls `onCopyError`, without an uncaught rejection (Task 1 test).
- Clipboard promise rejects: the exact error reaches `onCopyError`, and a later retry may succeed (Task 1 test).
- Code changes during a pending copy: the stale completion does not mark the new code as copied (Task 1 test).
- Rapid repeated clicks while copying: only one Clipboard write occurs (Task 1 test).
- Empty code, HTML-like text and trailing newline: rendered text is escaped and the copied string is byte-for-byte unchanged (Task 1 test).

---

## File map

- `packages/adapters/react/src/DataDisplay/CodeBlock/CodeBlockAdapter.tsx`: semantic structure, props/ref forwarding and copy button.
- `packages/adapters/react/src/DataDisplay/CodeBlock/useCodeBlockCopy.ts`: operation state, stale-result suppression and core `copy` call; internal to adapter.
- `packages/adapters/react/src/DataDisplay/CodeBlock/index.ts` and `src/unstyled.ts`: local and public exports.
- `packages/adapters/react/tests/DataDisplay/CodeBlock/CodeBlockAdapter.test.tsx`: behavior and accessibility tests.
- `packages/ui/src/presentation/DataDisplay/CodeBlock/{CodeBlock.module.css,codeBlockPresentation.ts,index.ts}`: framework-neutral classes and styles.
- `packages/ui/src/adapters/react/components/DataDisplay/CodeBlock/{CodeBlock.tsx,index.ts}`: ready facade and exports.
- `packages/themes/src/default/tokens/components/DataDisplay/CodeBlock/`: relevant token categories and local `index.css`.
- `packages/themes/src/default/components/DataDisplay/CodeBlock/{typography.css,index.css}`: text roles and theme entry.
- `packages/themes/src/default/tokens/global/typography.tokens.css`: shared monospace font-family token.
- `apps/storybook/stories/CodeBlock.stories.tsx`, `docs/components/codeblock.md`, `docs/site-components.md`, `examples/react/src/main.tsx`: working examples and usage guidance.

### Task 1: Unstyled adapter and copy behavior

**Files:** Create the adapter, internal hook, local index and mirrored test listed above; modify `packages/adapters/react/src/unstyled.ts`.

**Interfaces:** Consumes `copy(text: string): Promise<void>` from `@dreadnought/core` and `ButtonAdapter` in layer 2. Produces `CodeBlockAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'onCopy'> & { code: string; language?: string; copyable?: boolean; copyLabels?: { copy: string; copied: string; error: string }; onCopy?: (code: string) => void; onCopyError?: (error: unknown) => void; slotClassNames?: { header?: string; pre?: string; code?: string; copyButton?: string } }`, and `CodeBlockAdapter(props)`.

- [ ] **Step 1: Write failing tests** in `packages/adapters/react/tests/DataDisplay/CodeBlock/CodeBlockAdapter.test.tsx`. Mock only the browser boundary, not `copy` or the adapter. Cover native root attributes/ref, escaped code text, optional toolbar, exact Clipboard argument, success/error labels and callbacks, `type="button"` inside a form, pending duplicate clicks, missing Clipboard API, and stale completion after a `code` prop change. Use a controlled deferred promise for the pending/stale cases:

```tsx
let resolveWrite!: () => void;
const writeText = vi.fn(() => new Promise<void>((resolve) => { resolveWrite = resolve; }));
Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
const { container } = render(<CodeBlockAdapter code={'<b>one</b>\n'} />);
expect(container.querySelector('code')?.textContent).toBe('<b>one</b>\n');
await user.click(screen.getByRole('button', { name: 'Copy' }));
expect(writeText).toHaveBeenCalledWith('<b>one</b>\n');
resolveWrite();
await screen.findByRole('button', { name: 'Copied' });
```

- [ ] **Step 2: Verify red.** Run `pnpm exec vitest run packages/adapters/react/tests/DataDisplay/CodeBlock/CodeBlockAdapter.test.tsx`; expect failure because `CodeBlockAdapter` is not exported. If Windows blocks esbuild with `spawn EPERM`, rerun the same command with sandbox escalation.
- [ ] **Step 3: Implement the minimal adapter.** `useCodeBlockCopy.ts` holds `'idle' | 'pending' | 'copied' | 'error'`, calls `await copy(code)` inside `try/catch`, prevents a second call while pending, invalidates completion when `code` changes or the component unmounts, and invokes the matching callback. `CodeBlockAdapter.tsx` forwards root props/ref to `<div data-ui="code-block">`; its optional `<div data-slot="header">` contains plain language text and `<ButtonAdapter type="button">`; `<pre data-slot="pre"><code data-slot="code">{code}</code></pre>` is always present. Put consumer `slotClassNames` on their named slots without adding styling in layer 2. Add local and public exports.

```tsx
// The adapter's structural JSX; useCodeBlockCopy supplies status and handleCopy.
<div {...rootProps} ref={ref} data-ui="code-block">
  {(language !== undefined || copyable) && <div data-slot="header" className={slotClassNames?.header}>
    {language !== undefined && <span data-slot="language">{language}</span>}
    {copyable && <ButtonAdapter type="button" loading={status === 'pending'}
      className={slotClassNames?.copyButton} onClick={handleCopy}>
      {status === 'copied' ? labels.copied : status === 'error' ? labels.error : labels.copy}
    </ButtonAdapter>}
  </div>}
  <pre data-slot="pre" className={slotClassNames?.pre}><code data-slot="code" className={slotClassNames?.code}>{code}</code></pre>
</div>
```
- [ ] **Step 4: Verify green.** Run the focused test, then `pnpm --filter @dreadnought/react typecheck` and `pnpm --filter @dreadnought/react build`. Confirm the package build verifier still passes.
- [ ] **Step 5: Commit only Task 1 files.** `git commit -m "feat: add unstyled CodeBlock adapter"`.

### Task 2: Ready component, tokens and theme

**Files:** Create the UI presentation/facade and theme files in the map; modify `packages/ui/src/presentation/index.ts`, `packages/ui/src/adapters/react/components/index.ts`, `packages/themes/src/default/index.css`, and global typography tokens. Add `packages/ui/tests/adapters/react/components/DataDisplay/CodeBlock/CodeBlock.test.tsx`; extend theme and public type tests where their explicit export lists require it.

**Interfaces:** Consumes `CodeBlockAdapterProps`/`CodeBlockAdapter` from `@dreadnought/react/unstyled`. Produces `codeBlockPresentation` from `@dreadnought/ui`, and `CodeBlockProps`/`CodeBlock` from `@dreadnought/ui/react`. No new behavior is added in the facade.

- [ ] **Step 1: Write failing tests.** In the ready-component test, render `CodeBlock` and `CodeBlockAdapter` together: verify only the ready root and slots receive library classes, user root/slot classes survive, and the ready button still calls Clipboard via Task 1. Add type examples for both public imports; assert `CodeBlockProps` requires `code` and accepts `copyable`, labels and slot classes.

```tsx
render(<><CodeBlock code="one" slotClassNames={{ pre: 'my-pre' }} /><CodeBlockAdapter code="two" /></>);
expect(screen.getByText('one').closest('[data-ui="code-block"]')?.className).toContain('dreadnought-text-code-block');
expect(screen.getByText('one').parentElement?.className).toContain('my-pre');
expect(screen.getByText('two').closest('[data-ui="code-block"]')?.className).not.toContain('dreadnought-text-code-block');
```

- [ ] **Step 2: Verify red.** Run `pnpm exec vitest run packages/ui/tests/adapters/react/components/DataDisplay/CodeBlock/CodeBlock.test.tsx`; expect missing public `CodeBlock`/presentation exports.
- [ ] **Step 3: Implement the ready facade and styling.** Use `#presentation/DataDisplay/CodeBlock/codeBlockPresentation.ts`, merging presentation classes into `slotClassNames` while preserving consumer classes. In `CodeBlock.module.css`, style root/header/pre/code/copy button under `@layer dreadnought`; keep `white-space: pre` and `overflow-x: auto` on `<pre>`. Define component color, spacing, sizing and typography token files only for values used, each referring to an existing global token where appropriate. Add `--dreadnought-font-family-monospace: ui-monospace, monospace` to global typography and a `dreadnought-text-code-block` class in the component theme. The header and copy button use theme colors, not raw hex/rgb in the component CSS.

```tsx
// CodeBlock.tsx: the facade only composes classes, never handles copying.
const join = (library: string, consumer?: string) => [library, consumer].filter(Boolean).join(' ');
return <CodeBlockAdapter {...props}
  className={join(codeBlockPresentation.root, className)}
  slotClassNames={{
    header: join(codeBlockPresentation.header, slotClassNames?.header),
    pre: join(codeBlockPresentation.pre, slotClassNames?.pre),
    code: join(codeBlockPresentation.code, slotClassNames?.code),
    copyButton: join(codeBlockPresentation.copyButton, slotClassNames?.copyButton),
  }} />;
```

```css
/* colors.tokens.css and spacing.tokens.css provide the values; the module consumes them. */
:root {
  --dreadnought-code-block-bg: var(--dreadnought-color-surface-default);
  --dreadnought-code-block-text: var(--dreadnought-color-text-primary);
  --dreadnought-code-block-padding: var(--dreadnought-spacing-x4);
}
@layer dreadnought {
  .pre { overflow-x: auto; white-space: pre; padding: var(--dreadnought-code-block-padding); }
  .code { font-family: var(--dreadnought-font-family-monospace); }
}
```
- [ ] **Step 4: Verify green.** Run the focused UI test, `pnpm --filter @dreadnought/ui build`, `pnpm exec vitest run packages/themes/tests/default/theme.test.ts`, and `pnpm typecheck`. Inspect built `dist/style.css` and declarations for public CodeBlock names and absence of unpublished source aliases.
- [ ] **Step 5: Commit only Task 2 files.** `git commit -m "feat: add themed CodeBlock component"`.

### Task 3: Consumer examples and release checks

**Files:** Create `apps/storybook/stories/CodeBlock.stories.tsx` and `docs/components/codeblock.md`; modify `docs/site-components.md` and `examples/react/src/main.tsx`.

**Interfaces:** Uses `CodeBlock` from `@dreadnought/ui/react`, `CodeBlockAdapter` from `@dreadnought/react/unstyled`, and `copy` from `@dreadnought/core` in documentation examples. Storybook exposes serializable controls for `code`, `language`, and `copyable`; `copyLabels` is shown as an object control.

- [ ] **Step 1: Add consumer examples.** Storybook has Default (multiline), NoCopy, and Empty stories; the example page renders a TSX snippet and demonstrates changing code. The guide shows ready, unstyled and core-action usage, states that no syntax highlighting is present yet, and explains the optional copy button and slot classes. Mark CodeBlock implemented in `docs/site-components.md`.

```tsx
const meta = {
  title: 'DataDisplay/CodeBlock',
  component: CodeBlock,
  args: { code: "import { Button } from '@dreadnought/ui/react';", language: 'tsx', copyable: true },
  argTypes: { code: { control: 'text' }, language: { control: 'text' }, copyable: { control: 'boolean' }, copyLabels: { control: 'object' } },
} satisfies Meta<typeof CodeBlock>;
```

- [ ] **Step 2: Check the public build.** Run `pnpm storybook:build`, `pnpm typecheck`, `pnpm test`, and `pnpm build` sequentially, not concurrently (the type check reads generated declarations). Verify Storybook's catalog contains `DataDisplay/CodeBlock` and the example compiles using only public imports.
- [ ] **Step 3: Review the diff and commit.** Run `git diff --check` and `git status --short`; stage only Task 3 files, preserving `.keep`. Commit with `git commit -m "docs: demonstrate CodeBlock usage"`.
