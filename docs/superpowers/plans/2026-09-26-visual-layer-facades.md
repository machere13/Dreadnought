# Visual-Layer Facades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move ready React components into layer 3 while keeping layer-2 adapters free of library styling on the same page.

**Architecture:** `@dreadnought/react` depends only on `core` and exports hooks plus unstyled adapters. `@dreadnought/ui/react` composes that adapter with existing CSS Module class maps and loads common CSS plus the default theme. The root `@dreadnought/ui` stays a framework-neutral presentation-map export; framework adapters are optional peers of the UI package rather than compulsory dependencies for users of its root entrypoint.

**Tech Stack:** TypeScript, React 19, CSS Modules, Vite library build, Vitest, pnpm workspace.

**Spec:** `docs/superpowers/specs/2026-09-26-layered-adapters-design.md`

## Global Constraints

- `core` must not import React, Angular, CSS, or theme code.
- Layer 2 must not import `@dreadnought/ui`, CSS, or theme code.
- `ButtonAdapter`, `InputAdapter`, and `TextAreaAdapter` must remain unstyled beside ready components.
- CSS Modules and tokens are shared; do not replace them with global component selectors.
- Ready `Button`, `Input`, and `TextArea` are exported from `@dreadnought/ui/react` and import standard CSS/theme for the consumer.
- Do not alter the unrelated deletion of `packages/core/src/behaviors/.keep`.

## Review Focus

- Button with `href`: ready link gets the same class/variant contract and blocked-link behavior as ready action button.
- Icon-only Button: accessible name and icon slot survive wrapper migration; no separate IconButton is added.
- Password Input: wrapper, native control, and visibility-toggle slot retain behavior and ref target.
- TextArea with `autoSize`, `minRows`, and `maxRows`: wrapper migration does not change sizing or native ref.
- Ready and adapter instances on one page: only the ready instance has library styling classes, including when the default theme is loaded.

---

## File map

- `packages/adapters/react/src/{Button,Input,TextArea}/`: retain hooks and `*Adapter.tsx`; remove ready JSX wrappers after moving them.
- `packages/adapters/react/src/{index,styled}.ts`: `index.ts`, `logic.ts`, `unstyled.ts` remain CSS-free; remove `styled.ts` and its package export.
- `packages/ui/src/react/{Button,Input,TextArea}/`: ready JSX wrappers importing adapters via `@dreadnought/react/unstyled` and class maps from the UI package source.
- `packages/ui/src/react.ts`: ready React entrypoint; keep root `src/index.ts` framework-neutral.
- `packages/ui/vite.config.ts`: build both public entrypoints and inject published CSS/theme imports only into the React entry chunk.
- `packages/{adapters/react,ui}/package.json`, `pnpm-lock.yaml`: remove the React → UI dependency, add optional UI peers for React and its adapter, and publish `@dreadnought/ui/react`.
- `packages/ui/tests/` and `packages/adapters/react/tests/`: move ready-component behavior/type tests with their owners, add mixed ready/adapter test and update built-artifact checks.
- `examples/react/src/main.tsx`, `docs/architecture.md`, `docs/conventions.md`, `docs/components/{button,input,textarea}.md`: use and describe the new imports.

### Task 1: Migrate ready components and package graph atomically

**Files:**
- Create: `packages/ui/tests/react-presentation.test.tsx`, `packages/ui/src/react.ts`, `packages/ui/src/react/Button/Button.tsx`, `packages/ui/src/react/Input/Input.tsx`, `packages/ui/src/react/TextArea/TextArea.tsx`
- Move: `packages/adapters/react/tests/{Button,Input,TextArea}/*.{test,types}.tsx` ready-only tests to `packages/ui/tests/react/{Button,Input,TextArea}/`
- Modify: `packages/ui/vite.config.ts`, `packages/ui/package.json`, `packages/ui/tests/verifyBuild.mjs`, `packages/adapters/react/package.json`, `packages/adapters/react/tests/verifyBuild.mjs`, `examples/react/src/main.tsx`, `tsconfig.type-tests.json`, `pnpm-lock.yaml`
- Remove after migration: `packages/adapters/react/src/{Button,Input,TextArea}/{Button,Input,TextArea}.tsx`, `packages/adapters/react/src/styled.ts`

**Interfaces:**
- Consumes: `ButtonAdapter`, `InputAdapter`, `TextAreaAdapter` from `@dreadnought/react/unstyled`; `buttonPresentation`, `inputPresentation`, `textAreaPresentation` from UI source.
- Produces: `Button`, `Input`, `TextArea` and their props from `@dreadnought/ui/react`; `@dreadnought/react/unstyled` stays style-free.

- [ ] **Step 1: Write failing public-entry test.** In `packages/ui/tests/react-presentation.test.tsx`, assert that `import.meta.resolve('@dreadnought/ui/react')` does not throw. This assertion fails against the current package because the subpath is missing. After the public entry exists, add the mixed-use test below: import `Button` from `@dreadnought/ui/react` and `ButtonAdapter` from `@dreadnought/react/unstyled`; render both into one container with Testing Library. Assert the ready button has the `buttonPresentation.root` classes and the adapter does not. Repeat for Input and TextArea; keep their native semantic assertions in their moved tests. The mixed-use test catches a wrapper that accidentally decorates the adapter or fails to decorate the ready component.

```tsx
expect(() => import.meta.resolve('@dreadnought/ui/react')).not.toThrow();

render(<><Button>Ready</Button><ButtonAdapter>Base</ButtonAdapter></>);
expect(screen.getByRole('button', { name: 'Ready' }).className).toContain(buttonPresentation.variants.primary);
expect(screen.getByRole('button', { name: 'Base' }).className).not.toContain(buttonPresentation.variants.primary);
```

- [ ] **Step 2: Run the focused test and observe the expected RED.** Run `pnpm exec vitest run packages/ui/tests/react-presentation.test.tsx`. Expected: the assertion fails because the new `@dreadnought/ui/react` export cannot resolve; this is a test failure, not a module-load error.

- [ ] **Step 3: Move the ready wrappers into `packages/ui/src/react/` with `apply_patch`.** Preserve `Button`'s link/action branch, variant, `className`, and ref typing; preserve Input/TextArea wrappers and their adapter props. Import adapters from `@dreadnought/react/unstyled` and each class map from `../../<Component>/<name>Presentation.js`. `src/react.ts` reexports the three components and props; it must not reimplement adapter behavior.

```tsx
import { ButtonAdapter } from '@dreadnought/react/unstyled';
import type { ButtonAdapterProps } from '@dreadnought/react/unstyled';
import { buttonPresentation } from '../../Button/buttonPresentation.js';

export type ButtonProps = ButtonAdapterProps & { variant?: 'primary' | 'secondary' };

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const classes = [buttonPresentation.root, buttonPresentation.variants[variant], className]
    .filter(Boolean).join(' ');
  if (typeof props.href === 'string') {
    return <ButtonAdapter {...props} className={classes} data-variant={variant} />;
  }
  const { href: _href, ...actionProps } = props;
  return <ButtonAdapter {...actionProps} className={classes} data-variant={variant} />;
}
```

```tsx
import { InputAdapter, TextAreaAdapter } from '@dreadnought/react/unstyled';
import type { ComponentPropsWithRef } from 'react';
import { inputPresentation } from '../../Input/inputPresentation.js';
import { textAreaPresentation } from '../../TextArea/textAreaPresentation.js';

export type InputProps = ComponentPropsWithRef<typeof InputAdapter>;
export function Input({ className, ...props }: InputProps) {
  return <InputAdapter {...props} className={[inputPresentation.root, className].filter(Boolean).join(' ')} />;
}

export type TextAreaProps = ComponentPropsWithRef<typeof TextAreaAdapter>;
export function TextArea({ className, ...props }: TextAreaProps) {
  return <TextAreaAdapter {...props} className={[textAreaPresentation.root, className].filter(Boolean).join(' ')} />;
}
```

- [ ] **Step 4: Reverse package dependencies and build both UI entrypoints.** Remove `@dreadnought/ui` from React dependencies and its `/styled` export. Add `@dreadnought/themes` to UI dependencies; declare `@dreadnought/react` and React 19 as optional UI peers, with `@dreadnought/react` as a workspace dev dependency for building. Users of `ui/react` install the React adapter, while users of UI's framework-neutral root need not. Add UI `./react` export pointing to `dist/react.js`/`dist/react.d.ts`. Set UI `sideEffects` to include `dist/react.js` and `dist/style.css`. Configure Vite `lib.entry` with `index: 'src/index.ts'` and `react: 'src/react.ts'`; externalize `@dreadnought/react`, `react`, `react/jsx-runtime`, and `@dreadnought/themes/default.css`. In a `generateBundle` plugin, prepend the React entry chunk with imports of `./style.css` and `@dreadnought/themes/default.css`, leaving `index.js` CSS- and React-free. Update the lockfile through pnpm offline install; if the existing esbuild executable is locked, use a separate `--virtual-store-dir` as in the previous migration.

```ts
if (output.type === 'chunk' && output.name === 'react') {
  output.code = `import './style.css';\nimport '@dreadnought/themes/default.css';\n${output.code}`;
}
```

- [ ] **Step 5: Move ready-component tests and switch the example.** Move the existing Button/Input/TextArea ready behavior and type tests under `packages/ui/tests/react/`; change their imports to `@dreadnought/ui/react`. Change `examples/react/src/main.tsx` likewise and remove its now-redundant explicit `@dreadnought/themes/default.css` import. Update `tsconfig.type-tests.json` paths. The adapter tests stay in `packages/adapters/react/tests/`.

```tsx
import { Button, Input, TextArea } from '@dreadnought/ui/react';
import { ButtonAdapter } from '@dreadnought/react/unstyled';
```

- [ ] **Step 6: Update package artifact checks.** UI verifier dynamically imports built `dist/index.js` and confirms it has presentation maps but no ready React components; inspect built `dist/react.js` for CSS/theme imports and ready exports, and `dist/style.css` for existing selectors/tokens. React verifier checks `index.js`, `logic.js`, and `unstyled.js` do not import UI or CSS; it no longer reads deleted `styled.js`.

- [ ] **Step 7: Run GREEN and full checks.** Run `pnpm run build`, `pnpm test`, `pnpm run typecheck`. Expected: build/typecheck pass, all existing behavior tests plus mixed-use test pass. For the mixed-use test, check root classes for Button, Input, and TextArea; moved ready tests cover href, icon, password toggle, refs, and TextArea sizing.

- [ ] **Step 8: Commit this cohesive package migration.** Stage only the files from this task; do not stage `packages/core/src/behaviors/.keep`. Commit as `refactor: place ready React components in visual layer`.

### Task 2: Align active documentation with the shipped API

**Files:**
- Modify: `docs/architecture.md`, `docs/conventions.md`, `docs/plan.md`, `docs/components/button.md`, `docs/components/input.md`, `docs/components/textarea.md`, `docs/superpowers/specs/2026-09-26-layered-adapters-design.md`

**Interfaces:**
- Consumes: `@dreadnought/ui/react` from Task 1 and unchanged `@dreadnought/react/unstyled`.
- Produces: documentation that does not describe the prior `@dreadnought/react/styled` implementation as current.

- [ ] **Step 1: Update concrete examples and ownership.** In each component guide replace the ready import with `@dreadnought/ui/react`; explain that ready imports load CSS/default theme and adapters remain unstyled. In `architecture.md`, move ready React facade files under UI in the tree, reverse the package dependency table, and remove the “not yet migrated” caveat. In `conventions.md` and `plan.md`, describe the implemented layout. Mark the spec status implemented. A custom project theme overrides component CSS variables on its own container; no second ready entrypoint is introduced by this migration.

```tsx
import { Button } from '@dreadnought/ui/react';
import { ButtonAdapter } from '@dreadnought/react/unstyled';
```

- [ ] **Step 2: Check for stale active imports and verify again.** Run `rg -n '@dreadnought/react/styled|Button\.tsx.*adapters/react' docs examples packages --glob '!**/superpowers/plans/**' --glob '!**/superpowers/specs/2026-09-25-*'`; any remaining active guide/import is an error. Run `git diff --check`, `pnpm run build`, `pnpm test`, `pnpm run typecheck`. Expected: all pass; the old historical plans may retain old paths as snapshots.

- [ ] **Step 3: Commit docs separately.** Stage only updated docs and commit as `docs: describe visual-layer React entrypoint`.
