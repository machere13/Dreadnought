# CSS Module Style Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перенести готовый Button на CSS Modules и разделить значения темы, типографику и стили компонента без изменения поведения первых двух слоёв.

**Architecture:** `@dreadnought/themes` поставляет только именованные CSS-переменные и глобальный шрифтовой класс; `@dreadnought/ui` поставляет локальный CSS Module вместе с Button. React-адаптер и core остаются без CSS. Проект переопределяет переменные на контейнере; если токенов недостаточно, использует `ButtonAdapter` со своим модулем.

**Tech Stack:** TypeScript, React 19, CSS Modules, CSS Custom Properties, Vite 7, Vitest 3, pnpm 9.

**Spec:** `docs/superpowers/specs/2026-09-25-style-architecture-design.md`

## Global Constraints

- Папки компонентов и компонентов тестов — PascalCase; функции и хуки — camelCase.
- Тесты лежат в `tests/` наравне с `src/` и повторяют его структуру.
- `core` и React-адаптер не импортируют CSS; `ButtonAdapter` остаётся неоформленным.
- Оформление, геометрия, варианты, слоты и визуальные состояния Button — только в `Button.module.css`; все настраиваемые значения этого модуля берутся из публичных токенов. Глобальные исключения — CSS-переменные и `.dreadnought-text-*`.
- Нет reset и глобальных правил для `body`, `h1`, `button` и других элементов приложения.
- Публичные CSS-переменные начинаются с `--dreadnought-`; стандартная тема подключается явно.
- Существующие поведение Button, типы `ref`, атрибуты `data-ui`/`data-slot` и доступность не меняются.
- Каждый законченный этап — отдельный коммит.

## Review Focus

- `className` пользователя вместе с классами библиотеки: оба присутствуют на `<button>` и `<a>` (Task 2).
- `loading`/`disabled` на `<a>` и `<button>`: оформление не меняет блокировку действий и фокус (Task 2).
- Если на контейнере задать `--dreadnought-button-bg` и `--dreadnought-font-letter-spacing-button`, новые значения действуют только на вложенные Button; кнопки вне контейнера сохраняют стандартную тему (Task 1/3).
- CSS Module после сборки: опубликованный JS импортирует существующий CSS-файл; `react/logic` и `react/unstyled` его не импортируют (Task 2).
- Анимация загрузки при `prefers-reduced-motion: reduce`: не выполняется (Task 2).

## File map

- `packages/themes/src/default/colors.css` — базовые и семантические цвета.
- `packages/themes/src/default/constants.css` — размеры, радиусы, типографические и временные значения.
- `packages/themes/src/default/button.tokens.css` — токены Button, ссылающиеся на общие значения.
- `packages/themes/src/default/typography.css` — глобальный `.dreadnought-text-button`.
- `packages/themes/src/default/index.css` — точка входа стандартной темы.
- `packages/ui/src/Button/Button.module.css` — единственные правила внешнего вида Button.
- `packages/ui/src/Button/Button.tsx` — композиция CSS Module, шрифтового и пользовательского класса.
- `packages/ui/src/css-modules.d.ts` — типизация импорта `*.module.css`.
- `packages/ui/vite.config.ts` — сборка JS и CSS с сохранением CSS-импорта.
- `packages/ui/tests/Button/Button.test.tsx` — классы и регрессия поведения.
- `packages/ui/tests/Button/Button.types.tsx` — регрессия типов `ref`.
- `packages/themes/tests/default/theme.test.ts` — структура токенов и отсутствие глобального оформления Button.
- `packages/ui/package.json`, `packages/ui/tsconfig.build.json` — экспорт собранных файлов и декларации типов.
- `examples/react/src/main.tsx`, `examples/react/src/page.css` — стандартная, переопределённая и неоформленная кнопки.
- `docs/components/button.md`, `docs/architecture.md`, `docs/conventions.md` — договорённости по подключению и расширению стилей.

---

### Task 1: Тема как значения и типографика

**Files:**
- Create: `packages/themes/src/default/colors.css`, `constants.css`, `button.tokens.css`, `typography.css`
- Modify: `packages/themes/src/default/index.css`
- Delete: `packages/themes/src/default/tokens.css` после переноса значений
- Test: `packages/themes/tests/default/theme.test.ts`

**Interfaces:**
- Produces: импорт `@dreadnought/themes/default.css`, переменные `--dreadnought-button-*`, класс `.dreadnought-text-button`.
- Consumes: текущие значения из `tokens.css`; визуальные правила из `button.css` пока остаются до Task 2, затем файл удаляется.

- [ ] **Step 1: Написать падающий тест структуры темы.** В `packages/themes/tests/default/theme.test.ts` проверить чтением CSS через `readFileSync`, что `index.css` импортирует четыре новых файла и сохраняет временный импорт `button.css`, что `typography.css` объявляет `.dreadnought-text-button`, что `button.tokens.css` объявляет `--dreadnought-button-bg`, а цветовой токен указывает на `--dreadnought-color-action-primary`.

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = (file: string) => readFileSync(fileURLToPath(new URL(`../../src/default/${file}`, import.meta.url)), 'utf8');

describe('default theme', () => {
  it('adds values and typography while preserving the old Button until migration', () => {
    const entry = css('index.css');
    for (const file of ['colors.css', 'constants.css', 'button.tokens.css', 'typography.css']) {
      expect(entry).toContain(`@import './${file}'`);
    }
    expect(entry).toContain("@import './button.css'");
    expect(css('typography.css')).toContain('.dreadnought-text-button');
    expect(css('button.tokens.css')).toMatch(/--dreadnought-button-bg:\s*var\(--dreadnought-color-action-primary\)/);
  });
});
```

- [ ] **Step 2: Запустить `pnpm test -- packages/themes/tests/default/theme.test.ts`; ожидать FAIL** из-за отсутствующих CSS-файлов.
- [ ] **Step 3: Перенести существующие цвета в `colors.css` и `button.tokens.css`, остальные величины в `constants.css`; добавить `typography.css` и четыре импорта в `index.css`.** Не переносить селекторы `[data-ui]`, `:hover`, `:focus-visible`, `:disabled`, `@keyframes` из `button.css`: они переходят в Task 2. Важный контракт:

```css
/* colors.css */
:root {
  --dreadnought-color-action-primary: rgb(80 70 229 / 100%);
  --dreadnought-color-action-primary-hover: rgb(67 56 202 / 100%);
  --dreadnought-color-on-action: rgb(255 255 255 / 100%);
  --dreadnought-color-action-secondary: rgb(238 238 253 / 100%);
  --dreadnought-color-on-action-secondary: rgb(39 34 100 / 100%);
  --dreadnought-color-action-secondary-hover: rgb(220 218 250 / 100%);
  --dreadnought-color-focus: rgb(138 132 245 / 100%);
}
/* constants.css */
:root {
  --dreadnought-radius-control: 10px;
  --dreadnought-size-control-min-height: 2.75rem;
  --dreadnought-space-control-x: 1rem;
  --dreadnought-space-control-y: 0.65rem;
  --dreadnought-space-control-gap: 0.5rem;
  --dreadnought-font-family-ui: system-ui, sans-serif;
  --dreadnought-font-size-button: 1rem;
  --dreadnought-font-weight-button: 600;
  --dreadnought-line-height-button: 1.25;
  --dreadnought-font-letter-spacing-button: normal;
  --dreadnought-motion-spinner-duration: 0.75s;
}
/* button.tokens.css */
:root {
  --dreadnought-button-bg: var(--dreadnought-color-action-primary);
  --dreadnought-button-fg: var(--dreadnought-color-on-action);
  --dreadnought-button-bg-hover: var(--dreadnought-color-action-primary-hover);
  --dreadnought-button-secondary-bg: var(--dreadnought-color-action-secondary);
  --dreadnought-button-secondary-fg: var(--dreadnought-color-on-action-secondary);
  --dreadnought-button-secondary-bg-hover: var(--dreadnought-color-action-secondary-hover);
  --dreadnought-button-radius: var(--dreadnought-radius-control);
  --dreadnought-button-focus: var(--dreadnought-color-focus);
}
/* typography.css */
.dreadnought-text-button {
  font-family: var(--dreadnought-font-family-ui);
  font-size: var(--dreadnought-font-size-button);
  font-weight: var(--dreadnought-font-weight-button);
  line-height: var(--dreadnought-line-height-button);
  letter-spacing: var(--dreadnought-font-letter-spacing-button);
}
```

- [ ] **Step 4: Запустить тест темы; ожидать PASS.** Сразу после Task 2 проверить тему визуально, поскольку до переноса Button действуют старые правила оформления.
- [ ] **Step 5: Коммит `refactor(theme): split tokens and typography`.** `button.css` пока не удалять, чтобы промежуточный коммит оставался работоспособным; его удалит Task 2.

### Task 2: CSS Module, Button и его сборка

**Files:**
- Create: `packages/ui/src/Button/Button.module.css`, `packages/ui/src/css-modules.d.ts`, `packages/ui/vite.config.ts`, `packages/ui/tests/Button/verifyBuild.mjs`
- Modify: `packages/ui/src/Button/Button.tsx`, `packages/ui/tests/Button/Button.test.tsx`, `packages/ui/package.json`, `packages/ui/tsconfig.build.json`, `packages/themes/src/default/index.css`
- Delete: `packages/themes/src/default/button.css`

**Interfaces:**
- Consumes: `.dreadnought-text-button` и переменные Task 1; `ButtonAdapterProps` из `@dreadnought/react/unstyled`.
- Produces: прежний `ButtonProps`, классы на обоих DOM-вариантах и публикуемый CSS; не меняет `ButtonAdapter`.

- [ ] **Step 1: Добавить тест композиции для `<button>` и `<a>`, включая пользовательский `className`; добавить тесты `loading`, `disabled` и прежних `ref`-типов.** Импортировать `styles` из `../../src/Button/Button.module.css` и проверить `classList.contains(styles.button)`, `classList.contains(styles.secondary)`, `classList.contains('dreadnought-text-button')`, `classList.contains('custom')`. Проверить, что `Button loading` по-прежнему имеет `aria-busy="true"`, ссылка `href="/docs"` остаётся ссылкой, а `ButtonAdapter` в собственном тесте не получает CSS-классы.

```tsx
render(<Button className="custom" variant="secondary">Save</Button>);
const button = screen.getByRole('button', { name: 'Save' });
expect(button.classList.contains(styles.button)).toBe(true);
expect(button.classList.contains(styles.secondary)).toBe(true);
expect(button.classList.contains('dreadnought-text-button')).toBe(true);
expect(button.classList.contains('custom')).toBe(true);
```

- [ ] **Step 2: Запустить `pnpm test -- packages/ui/tests/Button/Button.test.tsx`; ожидать FAIL** из-за отсутствующего CSS Module.
- [ ] **Step 3: Добавить `Button.module.css`.** Перенести правила из `button.css` в `.button`, `.primary`, `.secondary` и вложенные селекторы `.button [data-slot="icon"]`, `.button:hover:not(:disabled):not([aria-disabled="true"])`, `.button:focus-visible`, `.button:is(:disabled, [aria-disabled="true"])`, `.button[data-loading]::before`; оставить `@keyframes` локально. Все настраиваемые значения брать только из `--dreadnought-*`, включая границы, размеры иконки и индикатора загрузки, текстовое оформление и параметры движения; `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing` здесь не объявлять. Сохранить `@media (prefers-reduced-motion: reduce) { .button[data-loading]::before { animation: none; } }`.

- [ ] **Step 4: Типизировать `*.module.css` и собрать классы в `Button.tsx` без изменения ветвления по `href`.** Реализация композиции:

```tsx
import styles from './Button.module.css';

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const classes = ['dreadnought-text-button', styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ');
  if (typeof props.href === 'string') {
    return <ButtonAdapter {...props} className={classes} data-variant={variant} />;
  }
  const { href: _href, ...actionProps } = props;
  return <ButtonAdapter {...actionProps} className={classes} data-variant={variant} />;
}
```

```ts
// packages/ui/src/css-modules.d.ts
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
```

- [ ] **Step 5: Убрать импорт и файл `button.css`, обновить тест темы так, чтобы он требовал отсутствия `button.css`; запустить `pnpm test` и `pnpm typecheck`; ожидать PASS.** Проверить поиском, что в `packages/themes` не осталось `[data-ui="button"]` и что `packages/core`/`packages/adapters/react` не импортируют CSS.
- [ ] **Step 6: Написать проверку артефактов в `packages/ui/tests/Button/verifyBuild.mjs` и запустить `node packages/ui/tests/Button/verifyBuild.mjs`; ожидать FAIL** из-за отсутствия `dist/style.css`.

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const artifact = (name) => readFileSync(fileURLToPath(new URL(`../../dist/${name}`, import.meta.url)), 'utf8');
const js = artifact('index.js');
const css = artifact('style.css');
const types = artifact('index.d.ts');
assert.match(js, /import\s+['"]\.\/style\.css['"]/);
assert.match(css, /--dreadnought-button-bg/);
assert.match(types, /Button/);
```
- [ ] **Step 7: Добавить Vite library build.** `vite.config.ts` использует `entry: 'src/index.ts'`, `formats: ['es']`, `fileName: 'index'`, `cssFileName: 'style'`; внешними оставляет `react`, `react/jsx-runtime` и `@dreadnought/react/unstyled`. В `generateBundle` для входного JS добавляет `import './style.css';` — только если выпущен `style.css`; при его отсутствии сборка падает.

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index', cssFileName: 'style' },
    rollupOptions: { external: ['react', 'react/jsx-runtime', '@dreadnought/react/unstyled'] },
  },
  plugins: [{
    name: 'dreadnought-ui-css-import',
    generateBundle(_options, bundle) {
      if (!bundle['style.css']) throw new Error('UI stylesheet is missing');
      const entry = bundle['index.js'];
      if (!entry || entry.type !== 'chunk') throw new Error('UI entry is missing');
      entry.code = `import './style.css';\n${entry.code}`;
    },
  }],
});
```

- [ ] **Step 8: В `package.json` заменить build на `vite build && tsc -p tsconfig.build.json --emitDeclarationOnly && node tests/Button/verifyBuild.mjs`, убрать `sideEffects: false` и задать `sideEffects: ["./dist/style.css"]`; экспортировать `./style.css`.** Декларации типов должны оставаться в `dist/`, а `tsconfig.build.json` должен включать `src/**/*.d.ts`. Проверить, что bundler импортирует CSS один раз.
- [ ] **Step 9: Запустить `pnpm --filter @dreadnought/ui build`, `pnpm --filter @dreadnought/example-react build`, `pnpm typecheck` и `pnpm test`; ожидать PASS.** `npm pack --dry-run` из `packages/ui` должен перечислять `dist/index.js`, `dist/index.d.ts`, `dist/style.css`. Отдельно установить упакованные `core`, `react`, `themes`, `ui` в временное приложение вне workspace и собрать его с импортами `@dreadnought/ui` и `@dreadnought/themes/default.css`; ошибка поиска CSS или `workspace:*` означает FAIL.
- [ ] **Step 10: Коммит `refactor(button): ship CSS Module with Button`.**

### Task 3: Пример и документация публичного контракта

**Files:**
- Modify: `examples/react/src/main.tsx`, `examples/react/src/page.css`, `docs/components/button.md`, `docs/architecture.md`, `docs/conventions.md`

**Interfaces:**
- Consumes: собранный `@dreadnought/ui` и `@dreadnought/themes/default.css`.
- Produces: пример стандартной и переопределённой темы, описание пути через `ButtonAdapter` и правил новых компонентов.

- [ ] **Step 1: В примере оставить готовый `Button`, кнопку в `.other-theme` и неоформленный `ButtonAdapter`; убрать любые глобальные правила Button из `page.css`.** Переопределить в `.other-theme` `--dreadnought-button-secondary-bg`, `--dreadnought-button-secondary-fg`, `--dreadnought-button-radius`, `--dreadnought-font-size-button` и `--dreadnought-font-letter-spacing-button: 0.04em`. Сохранить `.custom-button` только для собственного `ButtonAdapter`.
- [ ] **Step 2: Обновить документацию.** В `docs/components/button.md` показать `import { Button } from '@dreadnought/ui'; import '@dreadnought/themes/default.css';`, пример `.my-theme { --dreadnought-button-bg: rgb(24 43 71 / 100%); }`, объяснить глобальный шрифтовой класс, локальный CSS Module и пределы кастомизации через `className`. В `docs/architecture.md` и `docs/conventions.md` закрепить `*.module.css` для третьего слоя, переменные темы и шрифтовые классы как единственные глобальные исключения; зафиксировать, что Figma-агент предлагает изменения CSS-файлов темы проекта, а не исходников библиотеки.
- [ ] **Step 3: Запустить `pnpm build`, `pnpm typecheck`, `pnpm test`; ожидать PASS.** Открыть пример и проверить: базовый и `.other-theme` Button различаются; ButtonAdapter получает только `.custom-button`; `loading` не анимируется при включённом reduced motion, фокус и контраст читаемы.
- [ ] **Step 4: Коммит `docs: document layered styling and theme overrides`.**

## End-to-end acceptance

- [ ] `pnpm build`, `pnpm typecheck`, `pnpm test` проходят после всех трёх коммитов.
- [ ] `@dreadnought/ui` публикует CSS Module в собранном CSS и автоматически импортирует его из JS; стандартная тема импортируется отдельно.
- [ ] `@dreadnought/core` и `@dreadnought/react/unstyled` остаются без CSS-зависимостей.
- [ ] Поведение Button и типы refs не изменились; тема меняется на уровне контейнера без правки компонента.
