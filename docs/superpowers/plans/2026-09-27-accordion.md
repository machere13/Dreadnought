# Accordion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить составной Accordion для FAQ и документации с одиночным или множественным раскрытием, доступной React-разметкой и готовой темой.

**Architecture:** `core` содержит чистое переключение значений. `@dreadnought/react/unstyled` отвечает за состояние, структуру, DOM и ARIA; `@dreadnought/ui/react` только добавляет классы, индикатор и токены. Закрытые панели сохраняются в DOM.

**Tech Stack:** TypeScript 5.7, React 19, CSS Modules, CSS custom properties, Vitest 3, Testing Library, Storybook, pnpm 9.6.

**Spec:** `docs/superpowers/specs/2026-09-27-accordion-design.md`

## Global Constraints

- API: `Accordion`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Panel`; по умолчанию всё закрыто и открыт максимум один пункт; `multiple` разрешает несколько.
- Одиночное значение — `string | null`, множественное — `string[]`; `value` и `defaultValue` взаимоисключающие; `onValueChange` не вызывается при монтировании.
- `Item.value` — непустая уникальная строка; у `Item` ровно один `Trigger` и один `Panel`; неверное значение/структура вызывает ошибку.
- `Trigger` — нативная кнопка `type="button"` внутри выбранного `h1`–`h6`; начальный `headingLevel=3`; `disabled` блокирует запрос изменения.
- Панель остаётся в DOM с `hidden`; `role="region"` только по запросу; ID управляет адаптер и они стабильны при SSR/гидратации.
- Core не зависит от React/DOM/CSS; второй слой не импортирует тему; третий не повторяет логику; нет анимации высоты в первой версии.
- Семейство `Navigation/Accordion` повторяется в `src/` и зеркальном `tests/`; имена компонентов PascalCase, функций/хуков camelCase, локальные `index.ts`.
- CSS только в готовом слое, CSS Modules и `@layer dreadnought`, без `!important` и произвольных чисел там, где нужен токен.
- Не включать пользовательское удаление `packages/core/src/behaviors/.keep` в коммиты.

## Review Focus

1. `value` со спецсимволами и кириллицей → уникальные стабильные ARIA ID; тест Task 3.
2. Родитель закрывает управляемую панель, когда фокус внутри → фокус на её `Trigger`; тест Task 3.
3. Вложенный Accordion с тем же `Item.value` → состояния изолированы; тест Task 3.
4. `multiple` получает дублирующиеся/неизвестные значения → явная ошибка без нормализации; тест Task 3.
5. CSS задаёт панели `display` → атрибут `hidden` всё равно скрывает её; тест Task 4.

---

## File map

- `packages/core/src/components/Navigation/Accordion/{AccordionCore,toggleAccordionValue,index}.ts`: типы и чистое переключение; `packages/core/src/components/index.ts`: публичный экспорт.
- `packages/core/tests/components/Navigation/Accordion/toggleAccordionValue.test.ts`: правила переключения.
- `packages/adapters/react/src/Navigation/Accordion/{useAccordion,AccordionContext,AccordionAdapter,AccordionItemAdapter,AccordionTriggerAdapter,AccordionPanelAdapter,index}.{ts,tsx}`: состояние, контекст, структура, DOM и ARIA; `packages/adapters/react/src/{logic,unstyled}.ts`: публичные входы.
- `packages/adapters/react/tests/Navigation/Accordion/{useAccordion,AccordionAdapter}.test.tsx` и `AccordionPublic.types.tsx`: поведение и типовой контракт.
- `packages/ui/src/presentation/Navigation/Accordion/{Accordion.module.css,accordionPresentation,index}.ts` (модуль имеет расширение `.css`): классы оформления; `packages/ui/src/presentation/index.ts`: экспорт.
- `packages/ui/src/adapters/react/components/Navigation/Accordion/{Accordion,index}.tsx` (`index.ts`): готовый фасад; `packages/ui/src/adapters/react/components/index.ts`: экспорт.
- `packages/themes/src/default/tokens/components/Navigation/Accordion/{colors,spacing,sizing,typography,effects}.tokens.css` и `index.css`; `packages/themes/src/default/components/Navigation/Accordion/{typography,index}.css`; `packages/themes/src/default/index.css`: визуальные токены и импорт.
- `packages/ui/tests/adapters/react/components/Navigation/Accordion/Accordion.test.tsx`, `packages/themes/tests/default/Navigation/Accordion/theme.test.ts`: оформление, публичные стили и скрытие.
- `apps/storybook/stories/Accordion.stories.tsx`, `docs/components/accordion.md`: пример и документация.

### Task 1: Чистое переключение в core

**Files:** Create `packages/core/src/components/Navigation/Accordion/AccordionCore.ts`, `toggleAccordionValue.ts`, `index.ts`, `packages/core/tests/components/Navigation/Accordion/toggleAccordionValue.test.ts`; Modify `packages/core/src/components/index.ts`.

**Interfaces:** Produces `type AccordionValue = string | null | readonly string[]` and overloads `toggleAccordionValue(current: string | null, item: string): string | null`, `toggleAccordionValue(current: readonly string[], item: string): string[]`.

- [ ] **Step 1: Write the failing test** for opening/closing one item, multiple insertion/removal order, and immutability:

```ts
expect(toggleAccordionValue(null, 'a')).toBe('a');
expect(toggleAccordionValue('a', 'a')).toBeNull();
expect(toggleAccordionValue('a', 'b')).toBe('b');
const before = ['a', 'b'];
expect(toggleAccordionValue(before, 'c')).toEqual(['a', 'b', 'c']);
expect(toggleAccordionValue(before, 'a')).toEqual(['b']);
expect(before).toEqual(['a', 'b']);
```

- [ ] **Step 2: Run** `pnpm exec vitest run packages/core/tests/components/Navigation/Accordion/toggleAccordionValue.test.ts`; expect import failure.
- [ ] **Step 3: Implement** overloads with `Array.isArray`, `includes`, `filter` and spread; export through both indexes. No React and no item registry in core.
- [ ] **Step 4: Run** targeted test and `pnpm --filter @dreadnought/core typecheck`; both must pass.
- [ ] **Step 5: Commit** only Task 1 paths: `feat(core): add accordion selection logic`.

### Task 2: React hook and discriminated public types

**Files:** Create `packages/adapters/react/src/Navigation/Accordion/useAccordion.ts`, `packages/adapters/react/tests/Navigation/Accordion/useAccordion.test.tsx`, `AccordionPublic.types.tsx`; Modify `packages/adapters/react/src/logic.ts`.

**Interfaces:** Consumes `toggleAccordionValue`. Produces `UseAccordionOptions` as four branches (single controlled/uncontrolled, multiple controlled/uncontrolled), `UseAccordionResult<T> { value: T; toggle: (item: string) => void }`, and `useAccordion(options)` overloads preserving `string | null` versus `string[]`.

- [ ] **Step 1: Write failing runtime tests** using `renderHook` and `act`:

```tsx
const onValueChange = vi.fn();
const hook = renderHook(() => useAccordion({ defaultValue: null, onValueChange }));
expect(hook.result.current.value).toBeNull();
expect(onValueChange).not.toHaveBeenCalled();
act(() => hook.result.current.toggle('faq'));
expect(hook.result.current.value).toBe('faq');
expect(onValueChange).toHaveBeenCalledWith('faq');
```

Also test controlled `value` stays unchanged until `rerender`, multiple mode adds/removes in order, and repeated toggle of same value closes it.

- [ ] **Step 2: Write failing type cases** with `@ts-expect-error` for `value` plus `defaultValue`, string under `multiple: true`, and array under single mode. Confirm the type-check target includes the new `*.types.tsx` file.
- [ ] **Step 3: Run** `pnpm exec vitest run packages/adapters/react/tests/Navigation/Accordion/useAccordion.test.tsx` and `pnpm typecheck`; expect failures before implementation.
- [ ] **Step 4: Implement** state initialized to `[]` or `null`, controlled detection via `value !== undefined`, toggle through core, callback only for interaction; export via `logic.ts`.
- [ ] **Step 5: Run** targeted test and `pnpm typecheck`; both pass. Commit only Task 2 paths: `feat(react): add accordion selection hook`.

### Task 3: Unstyled compound adapter, structure and accessibility

**Files:** Create `packages/adapters/react/src/Navigation/Accordion/{AccordionContext,AccordionAdapter,AccordionItemAdapter,AccordionTriggerAdapter,AccordionPanelAdapter,index}.tsx` (`index.ts`), `packages/adapters/react/tests/Navigation/Accordion/AccordionAdapter.test.tsx`; Modify `packages/adapters/react/src/unstyled.ts`.

**Interfaces:** Consumes `useAccordion` and `UseAccordionOptions`. Produces `AccordionAdapter` with static `Item`, `Trigger`, `Panel`; named exports of parts and their props for the UI facade. Root/Item/Panel forward div refs, Trigger forwards button ref.

- [ ] **Step 1: Write failing behavior tests** for one-open default, `multiple`, controlled rerender, disabled, no callback on mount, click/Enter/Space, form non-submission, `data-state`, and `className`/refs on all four parts. Basic fixture:

```tsx
<AccordionAdapter>
  <AccordionAdapter.Item value="first">
    <AccordionAdapter.Trigger>Question</AccordionAdapter.Trigger>
    <AccordionAdapter.Panel>Answer</AccordionAdapter.Panel>
  </AccordionAdapter.Item>
</AccordionAdapter>
```

Assert button is inside `h3`, has `type="button"`, `aria-expanded="false"`, `aria-controls` equals panel `id`, panel `aria-labelledby` equals button `id`, and panel is `hidden` but still mounted. Reopen after changing local child state and verify it persists. Test `headingLevel={2}` and explicit `role="region"`.

- [ ] **Step 2: Write failing contract/focus tests:** empty/duplicate Item values; missing or duplicate Trigger/Panel; unknown initial/controlled values; duplicate/unknown entries in multiple array; `value` containing `%`, spaces and Cyrillic; nested roots with same Item values; externally controlled close while a descendant has focus. For each invalid case use `expect(() => render(...)).toThrow(...)`; for focus use `rerender` then `expect(trigger).toHaveFocus()`.
- [ ] **Step 3: Run** `pnpm exec vitest run packages/adapters/react/tests/Navigation/Accordion/AccordionAdapter.test.tsx`; expect import failure.
- [ ] **Step 4: Implement root** with `useId`, `useAccordion`, context, and a per-root registry of Item values. Validate `value/defaultValue` against committed Items and validate duplicate values; do not validate nested roots as direct children. Use React `useId` for stable root namespace plus encoded Item values for IDs. Route root DOM props/ref to its own `div`.
- [ ] **Step 5: Implement Item and parts:** Item context carries value, open state, IDs and `disabled`; enforce one Trigger and one Panel for each Item (including incorrect nesting) without counting nested Accordion descendants. Trigger renders selected heading with exactly one native button, applies `disabled`, `aria-expanded`, `aria-controls`, `data-state`, and toggles on native click. Panel renders div with `id`, `aria-labelledby`, `hidden={!open}` and only user-supplied `role`; leave children mounted. Restore focus to Trigger when an externally controlled close hides a panel containing `document.activeElement`.
- [ ] **Step 6: Run** targeted test, `pnpm --filter @dreadnought/react typecheck`, and `pnpm --filter @dreadnought/react build`. Fix any StrictMode ref registration/unregistration false positives; all pass.
- [ ] **Step 7: Commit** Task 3 paths only: `feat(react): add accessible accordion adapters`.

### Task 4: Ready facade, CSS Modules and theme

**Files:** Create `packages/ui/src/presentation/Navigation/Accordion/Accordion.module.css`, `accordionPresentation.ts`, `index.ts`; `packages/ui/src/adapters/react/components/Navigation/Accordion/Accordion.tsx`, `index.ts`; all Accordion theme paths in File map; `packages/ui/tests/adapters/react/components/Navigation/Accordion/Accordion.test.tsx`, `packages/themes/tests/default/Navigation/Accordion/theme.test.ts`. Modify `packages/ui/src/presentation/index.ts`, `packages/ui/src/adapters/react/components/index.ts`, `packages/themes/src/default/index.css`.

**Interfaces:** Consumes named `Accordion*Adapter` parts/props from `@dreadnought/react/unstyled`. Produces `Accordion` with the same compound API from `@dreadnought/ui/react`, with `className` combined separately for root, Item, Trigger and Panel.

- [ ] **Step 1: Write failing UI/theme tests.** Render both imports, inspect that unstyled root/parts lack ready classes and styled parts have them; custom `className` survives on each part. Check `getComputedStyle` or parsed CSS to ensure `.panel[hidden] { display: none }` wins over panel layout styling and that every `--dreadnought-accordion-*` reference has a theme definition. Verify decorative indicator is `aria-hidden` and never enters the button's accessible name.
- [ ] **Step 2: Run** UI/theme targeted tests; expect import/style failure.
- [ ] **Step 3: Implement facade** as thin wrappers forwarding all props and refs; combine module class and caller class. Indicator belongs in ready Trigger only, after caller children, never in the adapter. Do not add a separate state machine.
- [ ] **Step 4: Implement theme** with component aliases referencing global semantic/abstract tokens, local `index.css` imports, typography class, and one import in `default/index.css`. Style closed/open/hover/focus-visible/disabled; `[hidden]` must hide the panel without `!important`. Tokenize padding, gaps, radii, colors, border, focus and indicator dimensions/rotation.
- [ ] **Step 5: Run** targeted tests, `pnpm --filter @dreadnought/ui typecheck`, `pnpm --filter @dreadnought/themes build`, `pnpm --filter @dreadnought/ui build`; all pass. Commit Task 4 paths only: `feat(ui): add themed accordion`.

### Task 5: Storybook, docs and full verification

**Files:** Create `apps/storybook/stories/Accordion.stories.tsx`, `docs/components/accordion.md`. Modify no other files unless the verification identifies a concrete defect.

**Interfaces:** Consumes public `@dreadnought/core`, `@dreadnought/react/logic`, `@dreadnought/react/unstyled`, and `@dreadnought/ui/react` exports. Produces copyable usage examples, not another implementation.

- [ ] **Step 1: Add Storybook stories** for FAQ, multiple-open and disabled. Minimal FAQ fixture:

```tsx
<Accordion defaultValue="install">
  <Accordion.Item value="install">
    <Accordion.Trigger>Как установить?</Accordion.Trigger>
    <Accordion.Panel>Установите пакет и импортируйте компонент.</Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

- [ ] **Step 2: Write docs** with three distinct import examples (`toggleAccordionValue` from core, `useAccordion`/`AccordionAdapter` from React, `Accordion` from UI), controlled/uncontrolled/multiple examples, theme-token override, `headingLevel`, `disabled`, and `role="region"` guidance. Do not imply unstyled adapter imports CSS.
- [ ] **Step 3: Run** `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm storybook:build`. Confirm new story renders in built Storybook, use keyboard and visually check closed panel, focus ring, contrast, indicator and disabled state.
- [ ] **Step 4: Stage only Task 5 paths** (`git add -f docs/components/accordion.md` because `docs/` is ignored), inspect `git diff --cached --stat`, and commit `docs: demonstrate accordion across three layers`.

## Final acceptance

- All five task commits are local on `main`; no unrelated files staged.
- `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm storybook:build` pass; Storybook examples and keyboard behavior checked.
- Public API and layers match the spec, with no CSS leak into adapter and no React leak into core.
