# Storybook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Дать локальную площадку для просмотра готовых компонентов Dreadnought и изменения их props через Controls.

**Architecture:** Приватный workspace-пакет `examples/storybook` запускает Storybook для React/Vite и импортирует только публичные entrypoints библиотеки. Истории разделены по компонентам; существующие пакеты библиотеки не получают зависимостей от Storybook.

**Tech Stack:** Storybook 10.6.0, `@storybook/react-vite` 10.6.0, React 19, Vite 7, TypeScript, pnpm 9.

**Spec:** [2026-09-26-storybook-design.md](../specs/2026-09-26-storybook-design.md)

## Global Constraints

- Storybook размещается только в `examples/storybook`, остаётся приватным и импортирует UI через `@dreadnought/ui/react` (второй слой — через `@dreadnought/react/unstyled`).
- Не добавлять документационный аддон, снапшоты, тестовый раннер, публикацию сайта, примерную тему или истории для несуществующих компонентов.
- Использовать одинаковую закреплённую версию `10.6.0` для `storybook` и `@storybook/react-vite`; версию сверили через `pnpm view` 26.09.2026.
- Сборка библиотечных пакетов предшествует запуску Storybook, поскольку публичные экспорты указывают на `dist`.
- Статическая сборка Storybook игнорируется Git; её артефакты не попадают в коммит.

## Review Focus

1. Чистая установка и сборка должны находить `@dreadnought/ui/react`, а не внутренние `src`-пути — проверить статической сборкой после `pnpm install --frozen-lockfile` и `pnpm build`.
2. Storybook не должен попасть в зависимости публикуемых пакетов — проверить `git diff` их `package.json` и поиск `storybook` в `packages/*/package.json`.
3. Каждый из четырёх готовых компонентов должен появиться в индексе историй — проверить `storybook-static/index.json`.
4. Интерактивный `Badge` поверх цели должен сохранять смысл числа для доступности — история задаёт целевой кнопке доступное имя с числом.
5. Поля с обязательными props должны компилироваться и отображаться — запускать отдельный `typecheck` историй и статическую сборку.

---

### Task 1: Приватный Storybook и история Button

**Files:**
- Create: `examples/storybook/package.json`, `examples/storybook/tsconfig.json`
- Create: `examples/storybook/.storybook/main.ts`, `examples/storybook/.storybook/preview.ts`
- Create: `examples/storybook/stories/Button.stories.tsx`
- Modify: `package.json`, `.gitignore`, `pnpm-lock.yaml`

**Interfaces:**
- Consumes: `Button` из `@dreadnought/ui/react` и собранные workspace-пакеты.
- Produces: `pnpm storybook` для локального просмотра, `pnpm storybook:build` для статической сборки, `pnpm --filter @dreadnought/example-storybook typecheck` для историй.

- [ ] **Step 1: Создать минимальный пакет и первую историю.** В `package.json` примера указать `name: "@dreadnought/example-storybook"`, `private: true`, `type: "module"`, scripts `dev: "storybook dev -p 6006 --no-open"`, `build:storybook: "storybook build"`, `typecheck: "tsc -p tsconfig.json --noEmit"`; dependencies `@dreadnought/ui: "workspace:*"`, `@dreadnought/react: "workspace:*"`, `react: "^19.0.0"`, `react-dom: "^19.0.0"`; devDependencies `storybook: "10.6.0"`, `@storybook/react-vite: "10.6.0"`, `@types/react: "^19.0.0"`, `typescript: "^5.7.0"`, `vite: "^7.0.0"`. `tsconfig.json` расширяет `../../tsconfig.base.json`, задаёт `noEmit: true`, `module: "ESNext"`, `moduleResolution: "Bundler"`, `jsx: "react-jsx"`, включает `.storybook/**/*.ts` и `stories/**/*.tsx`. В `.storybook/main.ts`:

```ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: [],
};
export default config;
```

В `.storybook/preview.ts` задать типизированный `Preview` из `@storybook/react-vite` и `parameters.controls.expanded = true`; не импортировать CSS отдельно. В `Button.stories.tsx` использовать `Meta`/`StoryObj` из `@storybook/react-vite`, `const meta = { title: 'Controls/Button', component: Button, args: { children: 'Нажать' } } satisfies Meta<typeof Button>`, затем `Default`, `Secondary` (`variant: 'secondary'`), `Disabled` (`disabled: true`), `Loading` (`loading: true`).

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@dreadnought/ui/react';

const meta = { title: 'Controls/Button', component: Button, args: { children: 'Нажать' } } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
```

- [ ] **Step 2: Установить зависимости и проверить первый вариант.** Выполнить `pnpm install`; затем `pnpm --filter @dreadnought/example-storybook typecheck` и `pnpm --filter @dreadnought/example-storybook build:storybook`. Исправлять только пакет примера. Не запускать Storybook-генератор.

- [ ] **Step 3: Подключить команды и игнорирование результата.** Добавить в корень `"storybook": "pnpm build && pnpm --filter @dreadnought/example-storybook dev"` и `"storybook:build": "pnpm build && pnpm --filter @dreadnought/example-storybook build:storybook"`; в `.gitignore` добавить `storybook-static/`. При необходимости поправить типы `.storybook/preview.ts` по установленному API Storybook 10.6.0.

- [ ] **Step 4: Проверить готовую площадку.** Запустить `pnpm --filter @dreadnought/example-storybook typecheck`, `pnpm storybook:build`, `pnpm test`. Проверить, что `examples/storybook/storybook-static/index.json` содержит `controls-button--default`, что `git status` не показывает `storybook-static`, а `packages/*/package.json` не изменены. Кратко запустить `pnpm storybook`, дождаться адреса `localhost:6006`, остановить процесс.

- [ ] **Step 5: Коммит.** Добавить только файлы Task 1 и зафиксировать `feat: add Storybook workspace with Button stories`.

### Task 2: Истории Input, TextArea и Badge

**Files:**
- Create: `examples/storybook/stories/Input.stories.tsx`, `TextArea.stories.tsx`, `Badge.stories.tsx`

**Interfaces:**
- Consumes: конфигурацию и команды Storybook из Task 1; `Input`, `TextArea`, `Badge`, `Button` из `@dreadnought/ui/react`.
- Produces: типизированные истории четырёх готовых компонентов с управляемыми props.

- [ ] **Step 1: Написать истории через публичный импорт.** Для каждого файла использовать `Meta`/`StoryObj` из `@storybook/react-vite` и `satisfies Meta<typeof Component>`. `Input`: `Default` с `placeholder`, `Disabled`, `Password` с `type: 'password'` и `passwordVisibilityLabels: { show: 'Показать пароль', hide: 'Скрыть пароль' }`. `TextArea`: `Default` с `rows: 4`, `AutoSize` с `autoSize: true`, `rows: 2`, `maxRows: 6`, `Disabled`. `Badge`: `Default` с `children: 'Beta'`, `WithIcon` с декоративной звездой, `Outline` с `appearance: 'outline'`, `Overlay` с `target: <Button aria-label="Уведомления, 3 новых">Уведомления</Button>` и `children: '3'`.

```tsx
// Input.stories.tsx
const meta = { title: 'Fields/Input', component: Input, args: { placeholder: 'Введите текст' } } satisfies Meta<typeof Input>;
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Password: Story = { args: { type: 'password', passwordVisibilityLabels: { show: 'Показать пароль', hide: 'Скрыть пароль' } } };

// TextArea.stories.tsx
const meta = { title: 'Fields/TextArea', component: TextArea, args: { rows: 4, placeholder: 'Введите текст' } } satisfies Meta<typeof TextArea>;
export const Default: Story = {};
export const AutoSize: Story = { args: { autoSize: true, rows: 2, maxRows: 6 } };
export const Disabled: Story = { args: { disabled: true } };

// Badge.stories.tsx
const meta = { title: 'DataDisplay/Badge', component: Badge, args: { children: 'Beta' } } satisfies Meta<typeof Badge>;
export const Default: Story = {};
export const WithIcon: Story = { args: { icon: <span aria-hidden="true">★</span> } };
export const Outline: Story = { args: { appearance: 'outline' } };
export const Overlay: Story = { args: { target: <Button aria-label="Уведомления, 3 новых">Уведомления</Button>, children: '3' } };
```

В каждом файле добавить собственные `import type { Meta, StoryObj }`, публичные импорты компонентов, `export default meta` и `type Story = StoryObj<typeof meta>`; повторённые имена `meta`/`Story` принадлежат разным файлам.

- [ ] **Step 2: Проверить индекс и типы.** Запустить `pnpm --filter @dreadnought/example-storybook typecheck` и `pnpm storybook:build`. Прочитать `examples/storybook/storybook-static/index.json` и убедиться, что для каждой группы `Controls/Button`, `Fields/Input`, `Fields/TextArea`, `DataDisplay/Badge` есть записи, включая `datadisplay-badge--overlay`. Исправить только ошибки историй и конфигурации примера.

- [ ] **Step 3: Проверить регрессию и коммит.** Запустить `pnpm typecheck` и `pnpm test`; проверить отсутствие импортов `packages/**/src` в историях. Добавить три новых файла и зафиксировать `feat: add component stories for Storybook`.
