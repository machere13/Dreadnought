# Disclosure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Предоставить две общие функции core для собственной раскрывающейся секции и переиспользовать согласованное состояние в Accordion.

**Architecture:** Чистые behaviors вычисляют состояние и переход без React/DOM. Accordion сохраняет модель выбора и владельца состояния; собственная секция показывает минимальный React-код потребителя. Каталог публикует только настоящие core bindings.

**Tech Stack:** Существующие TypeScript, React 19, Vitest, Testing Library, Astro и генератор каталога; новые зависимости не нужны.

**Spec:** `docs/superpowers/specs/2026-10-05-disclosure-design.md` — утверждён пользователем 2026-10-05, прочитать полностью.

## Global Constraints

- «Внешний API и оформление Accordion не меняются.»
- «Escape, клик снаружи, позиционирование popup и новые готовые компоненты не входят в этап.»
- «Новых зависимостей нет.»
- «Функции не меняют вход и не импортируют DOM, React, CSS или browser API.»
- «Глобальную уникальность обеспечивает вызывающий код.»
- «Не заменяем модель коллекции несколькими независимыми boolean-состояниями.»
- «Примеры импортируют только публичные entrypoints и проверяются TypeScript.»
- «Новая страница готового компонента и отдельная Storybook-история не нужны.»
- «Число component entries остаётся 19; standalone capabilities увеличивается с 8 до 10, суммарное число entries — 29.»
- «Работа локально в main, завершённые этапы коммитятся без push.»
- «Два существующих удаления комментариев в getNextEnabledValue/getSelectionValue принадлежат пользователю и исключаются из коммитов.»
- Ponytail: никаких state-machine, универсальных controlled-state hooks, CSS/token изменений или пустых patterns-папок. Использовать `.ts`/`.tsx`, публичные импорты и существующие barrels.

## Review Focus

1. Disabled при уже открытой панели: core не закрывает её автоматически; внешний владелец вправе изменить open независимо от disabled.
2. Закрытие изнутри против закрытия после переноса фокуса наружу: возвращать фокус только из панели; не перехватывать внешний фокус. Недоступный native disabled trigger нельзя сделать фокусируемым искусственно.
3. Unicode и React useId с двоеточиями: допустимые ID не отвергаются; любой ASCII whitespace, совпадение и пустые ID отвергаются.
4. Consumer disabled и отменённый click Accordion: общий triggerProps с disabled=false не должен затереть disabled потребителя; Enter/Space не дают двойного toggle или submit.
5. Вложенные секции и mounted скрытое содержимое: ID принадлежат владельцу, состояние вложенных контролов сохраняется; повторное закрытие не переносит фокус.

## Карта файлов

- Создать `packages/core/src/behaviors/getDisclosureState.ts`: типы DisclosureStateOptions/DisclosureState, проверка ID, состояние и связанные DOM-свойства без доступа к DOM.
- Создать `packages/core/src/behaviors/getDisclosureOpen.ts`: DisclosureAction/DisclosureOptions и чистое вычисление следующего boolean.
- Изменить `packages/core/src/behaviors/index.ts`: явные value/type exports.
- Создать `packages/core/tests/behaviors/getDisclosureState.test.ts`, `getDisclosureOpen.test.ts`, `disclosure.types.ts`; добавить types-файл в `tsconfig.type-tests.json`.
- Изменить Accordion `AccordionContext.tsx`, `AccordionItemAdapter.tsx`, `AccordionTriggerAdapter.tsx`, `AccordionPanelAdapter.tsx`: внутреннее поле disclosure, применение core props; useAccordion/toggleAccordionValue не меняются.
- Дополнить `packages/adapters/react/tests/Navigation/Accordion/AccordionAdapter.test.tsx`; существующие public type tests сохраняются.
- Создать `apps/docs/src/components/DisclosureDemo.tsx`: docs-local собственная секция, не экспорт библиотеки; `disclosureCode.ts`: независимый публичный пример для CodeBlock.
- Изменить `apps/docs/src/components/CustomComponentsGuide.tsx`: раздел с anchor core-disclosure, пример и пояснения.
- Создать `apps/docs/tests/DisclosureDemo.test.tsx`; дополнить `apps/docs/tests/DocsPage.test.tsx` и `tools/catalog/tests/catalog.test.ts` проверкой опубликованных примеров.
- Изменить `packages/core/src/behaviors/catalog.json`, `packages/core/src/components/Navigation/Accordion/catalog.json`, `tools/catalog/tests/queryValidation.test.ts`, `docs/core-capabilities.md`.
- Генерируемые outputs: штатные CLI/docs команды. Отслеживаемые outputs проверить через git ls-files; ignored outputs не добавлять принудительно.

### Task 1: Публичные чистые правила

**Files:** оба новых behavior-файла, их barrel, два runtime-теста, disclosure.types.ts и tsconfig.type-tests.json из карты выше.

**Interfaces:**
- Consumes: нет новых зависимостей.
- Produces: `getDisclosureState(options: DisclosureStateOptions): DisclosureState`; `getDisclosureOpen(currentOpen: boolean, action: DisclosureAction, options?: DisclosureOptions): boolean`. Типы и поля буквально соответствуют spec. `getDisclosureState` принимает обязательные triggerId/panelId, default open=false/disabled=false; getDisclosureOpen options default disabled=false.

- [x] **Step 1: Написать проверки core через публичный barrel.**

```ts
import { getDisclosureState, getDisclosureOpen } from '../../src/index.ts';
const options = Object.freeze({ triggerId: ':r0:-trigger', panelId: 'ответ-panel' });
expect(getDisclosureState(options)).toEqual({
  open: false, disabled: false,
  triggerProps: { id: ':r0:-trigger', type: 'button', disabled: false,
    'aria-expanded': false, 'aria-controls': 'ответ-panel' },
  panelProps: { id: 'ответ-panel', hidden: true, 'aria-labelledby': ':r0:-trigger' },
});
expect(getDisclosureState({ ...options, open: true, disabled: true }).panelProps.hidden).toBe(false);
expect(options).toEqual({ triggerId: ':r0:-trigger', panelId: 'ответ-panel' });
```

В state-тесте использовать таблицу двух open × двух disabled с буквальными ожидаемыми aria-expanded/hidden/disabled; не строить ожидание функцией под тестом. Проверить оба ID для `''`, `'a b'`, `'a\tb'`, `'a\nb'`, `'a\fb'`, `'a\rb'`; одинаковые ID отвергаются. Unicode, дефисы, `%`, `:` разрешены. Ошибка проверяется через toThrow(), не точное сообщение.

Для перехода:

```ts
it.each([
  [false, 'open', true], [true, 'open', true],
  [false, 'close', false], [true, 'close', false],
  [false, 'toggle', true], [true, 'toggle', false],
] as const)('%s + %s -> %s', (current, action, next) => {
  expect(getDisclosureOpen(current, action)).toBe(next);
  expect(getDisclosureOpen(current, action, { disabled: true })).toBe(current);
});
```

Types-файл импортирует оба экспорта и четыре типа из @dreadnought/core; присваивает type:'button', boolean hidden/expanded. `@ts-expect-error` для отсутствующего panelId, action='select', open='yes'.

- [x] **Step 2: Запустить RED.**

Run: `node node_modules/vitest/vitest.mjs run packages/core/tests/behaviors/getDisclosureState.test.ts packages/core/tests/behaviors/getDisclosureOpen.test.ts --maxWorkers=1`

Expected: отсутствующий экспорт новых функций, не неверный fixture/import path. Затем добавить barrel и реализацию.

- [x] **Step 3: Реализовать минимальные функции.** Типы взять из spec целиком; локальная проверка двух ID внутри getDisclosureState, не новый helper.

```ts
if (!triggerId || !panelId || /[\t\n\f\r ]/.test(triggerId)
  || /[\t\n\f\r ]/.test(panelId) || triggerId === panelId) {
  throw new Error('Disclosure needs distinct nonempty IDs without ASCII whitespace.');
}
return { open, disabled,
  triggerProps: { id: triggerId, type: 'button', disabled,
    'aria-expanded': open, 'aria-controls': panelId },
  panelProps: { id: panelId, hidden: !open, 'aria-labelledby': triggerId } };

// getDisclosureOpen, после сигнатуры с default { disabled = false } = {}:
if (disabled) return currentOpen;
return action === 'toggle' ? !currentOpen : action === 'open';
```

Runtime action вне TS union не является новым поддержанным действием; не расширять контракт. Source exports остаются `.ts`.

- [x] **Step 4: GREEN и публичные типы.** Повторить runtime-команду; затем `node node_modules/typescript/bin/tsc -p packages/core/tsconfig.build.json` и `node node_modules/typescript/bin/tsc -p tsconfig.type-tests.json --noEmit`. Expected: каждый exit 0.
- [x] **Step 5: Коммит этапа.**

```powershell
git add -- packages/core/src/behaviors/getDisclosureState.ts packages/core/src/behaviors/getDisclosureOpen.ts packages/core/src/behaviors/index.ts packages/core/tests/behaviors/getDisclosureState.test.ts packages/core/tests/behaviors/getDisclosureOpen.test.ts packages/core/tests/behaviors/disclosure.types.ts tsconfig.type-tests.json
git diff --cached --check
git commit -m "feat(core): add reusable disclosure state and transitions"
```

### Task 2: Композиция в Accordion и собственной секции

**Files:** четыре Accordion-файла, AccordionAdapter.test.tsx, DisclosureDemo.tsx, disclosureCode.ts, CustomComponentsGuide.tsx, DisclosureDemo.test.tsx и DocsPage.test.tsx из карты.

**Interfaces:**
- Consumes: Task 1 getDisclosureState/getDisclosureOpen без изменений.
- Produces: внутреннее `AccordionItemContextValue.disclosure: DisclosureState` вместо отдельных triggerId/panelId; open сохраняется для существующего состояния/фокуса. Docs-local `DisclosureDemo({open?, defaultOpen?, disabled?, onOpenChange?, onTriggerClick?})` с defaultOpen=false; публичного экспорта библиотеки нет. `disclosureCode` — string с самостоятельным JSX-примером и публичными импортами.

- [x] **Step 1: RED собственной секции и базовые проверки Accordion.** Новый DisclosureDemo.test.tsx использует реальный компонент/кнопку, без mock core. Ожидаемые названия: trigger «Дополнительные настройки», input «Примечание», внутренняя кнопка «Закрыть настройки».

```tsx
render(<DisclosureDemo />);
const trigger = screen.getByRole('button', { name: 'Дополнительные настройки' });
expect(trigger.getAttribute('aria-expanded')).toBe('false');
await userEvent.click(trigger);
const input = screen.getByRole('textbox', { name: 'Примечание' });
expect(trigger.getAttribute('aria-controls')).toBe(input.parentElement!.id);
await userEvent.click(input);
await userEvent.keyboard('черновик');
await userEvent.click(screen.getByRole('button', { name: 'Закрыть настройки' }));
expect(document.activeElement).toBe(trigger);
await userEvent.click(trigger);
expect((screen.getByRole('textbox', { name: 'Примечание' }) as HTMLInputElement).value).toBe('черновик');
```

Отдельно Enter затем Space меняют open ровно один раз; form onSubmit не вызывается; disabled закрытый/открытый trigger не переключает; onTriggerClick.preventDefault отменяет действие. Controlled вариант: callback получает запрос, open остаётся до rerender. Rerender закрытой панели с фокусом в input возвращает trigger; с фокусом на Outside оставляет Outside; повторное закрытие не меняет фокус. Две секции имеют разные ID. Если trigger disabled при внешнем закрытии, не отменять native disabled ради восстановления фокуса.

В Accordion добавить реальные native userEvent Enter/Space проверки (существующая fireEvent-проверка не доказывает Space); отменённый click сохраняет закрытую панель; disabled при открытом controlled значении не закрывает её; внешний фокус сохраняется при controlled закрытии. Существующие nested/special ID/mounted state/ref/single/multiple проверки сохраняются. Эти characterization-проверки могут пройти до рефакторинга; не создавать искусственное изменение поведения ради RED.

Run: `node node_modules/vitest/vitest.mjs run apps/docs/tests/DisclosureDemo.test.tsx packages/adapters/react/tests/Navigation/Accordion --maxWorkers=1`

Expected: новая demo отсутствует; существующий Accordion сохраняет baseline. DocsPage-test RED проверяет heading «Своя раскрывающаяся секция» и anchor #core-disclosure на section=custom-components.

- [x] **Step 2: Применить состояние core в Accordion.** В Item вычислить getDisclosureState после encodedValue с теми же rootId/encodedValue ID; context содержит disclosure. Фокус/refs/registerPart остаются прежними. После итогового ревью порядок Trigger исправлен: consumer buttonProps, общие защищённые props, затем явный consumer disabled. Omit не защищает от spread объектов на runtime. Panel применяет core panelProps после consumer panelProps. Click-handler и выбор root не меняются.

```tsx
const disclosure = getDisclosureState({ open,
  triggerId: `${root.rootId}-trigger-${encodedValue}`,
  panelId: `${root.rootId}-panel-${encodedValue}` });

// Trigger, сохранить Heading/ref/data-state/onClick:
<button {...buttonProps} {...item.disclosure.triggerProps} disabled={buttonProps.disabled} ref={setRef}
  data-state={item.open ? 'open' : 'closed'} onClick={handleClick}>{children}</button>
// Panel, сохранить ref и children:
<div {...panelProps} {...item.disclosure.panelProps} ref={setRef}>{children}</div>
```

- [x] **Step 3: Минимальный docs-local пример.** Использовать useId/useState/useRef/useLayoutEffect, только нативные button/div/input; классы существующего DocsPage.module.css, новых CSS нет. JSX props из core. В controlled режиме отправлять callback без изменения effective open; unmanaged хранит internal open. Не вызывать callback при неизменившемся результате перехода.

```tsx
import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEventHandler } from 'react';
import { getDisclosureOpen, getDisclosureState } from '@dreadnought/core';
import type { DisclosureAction } from '@dreadnought/core';

interface DisclosureDemoProps {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTriggerClick?: MouseEventHandler<HTMLButtonElement>;
}
export function DisclosureDemo({ open, defaultOpen = false, disabled = false,
  onOpenChange, onTriggerClick }: DisclosureDemoProps) {
  const id = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const effectiveOpen = open === undefined ? internal : open;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(effectiveOpen);
  const state = getDisclosureState({ open: effectiveOpen, disabled,
    triggerId: `${id}-trigger`, panelId: `${id}-panel` });
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (wasOpen.current && !effectiveOpen && panel?.contains(panel.ownerDocument.activeElement)) {
      triggerRef.current?.focus();
    }
    wasOpen.current = effectiveOpen;
  }, [effectiveOpen]);
  function request(action: DisclosureAction) {
    const next = getDisclosureOpen(effectiveOpen, action, { disabled });
    if (next === effectiveOpen) return;
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  }
  return <>
    <button {...state.triggerProps} ref={triggerRef} onClick={event => {
      onTriggerClick?.(event);
      if (!event.defaultPrevented) request('toggle');
    }}>Дополнительные настройки</button>
    <div {...state.panelProps} ref={panelRef}>
      <input aria-label="Примечание" />
      <button type="button" disabled={disabled} onClick={() => request('close')}>Закрыть настройки</button>
    </div>
  </>;
}
```

Trigger click сначала вызывает onTriggerClick, затем request('toggle') только если !defaultPrevented; внутренний type=button вызывает request('close'). Panel остаётся mounted и hidden. Текст input хранит DOM без forced value. Focus effect проверяет предыдущий open → закрытый и `panelRef.current?.contains(panelRef.current.ownerDocument.activeElement)`; только тогда `triggerRef.current?.focus()`. Не перехватывать Tab, не добавлять keydown или document listener.

disclosureCode содержит приведённый полный компонент как string с публичными imports, без внутренних imports или обязательных props. Оформление живого примера добавляется существующими docs-классами на button/wrapper; в копируемом независимом примере оформление остаётся потребителю. Проверить string через существующий checkExamples в Task 3; реальный компонент проверяется docs build. Не извлекать один общий runtime helper ради синхронизации строки и JSX.

В CustomComponentsGuide новый section data-knowledge aria-labelledby=core-disclosure с h2 «Своя раскрывающаяся секция», DisclosureDemo и CodeBlock(disclosureCode). Пояснить функции, ID, хранение состояния, disabled, отмену событий, нативную клавиатуру и фокус; core не обещает полноценный popup.

- [x] **Step 4: GREEN композиции и типы.**

Run: `node node_modules/vitest/vitest.mjs run apps/docs/tests/DisclosureDemo.test.tsx apps/docs/tests/DocsPage.test.tsx packages/adapters/react/tests/Navigation/Accordion --maxWorkers=1`

Затем `node node_modules/typescript/bin/tsc -p packages/adapters/react/tsconfig.build.json`, `node node_modules/typescript/bin/tsc -p tsconfig.type-tests.json --noEmit`, `node packages/adapters/react/tests/verifyBuild.mjs`. Expected: каждый exit 0; публичные props Accordion прежние.

- [x] **Step 5: Коммит этапа.**

```powershell
git add -- packages/adapters/react/src/Navigation/Accordion/AccordionContext.tsx packages/adapters/react/src/Navigation/Accordion/AccordionItemAdapter.tsx packages/adapters/react/src/Navigation/Accordion/AccordionTriggerAdapter.tsx packages/adapters/react/src/Navigation/Accordion/AccordionPanelAdapter.tsx packages/adapters/react/tests/Navigation/Accordion/AccordionAdapter.test.tsx
git add -f -- apps/docs/src/components/DisclosureDemo.tsx apps/docs/src/components/disclosureCode.ts apps/docs/src/components/CustomComponentsGuide.tsx apps/docs/tests/DisclosureDemo.test.tsx apps/docs/tests/DocsPage.test.tsx
git diff --cached --check
git commit -m "feat(react): compose disclosure rules in accordion and custom example"
```

### Task 3: Публикация, roadmap и окончательная проверка

**Files:** behaviors/catalog.json, Accordion/catalog.json, catalog.test.ts, queryValidation.test.ts, core-capabilities.md и отслеживаемые generated outputs из карты.

**Interfaces:**
- Consumes: Task 1 public bindings, Task 2 disclosureCode string/live example.
- Produces: два behavior entries с docsUrl `/custom-components/#core-disclosure`, единственным core binding layer=1/framework=null/importPath=@dreadnought/core; 19 components + 10 standalone = 29 entries. Routes остаётся 23.

- [x] **Step 1: RED каталога.** Дополнить standalone name list двумя новыми именами (лексикографически getDisclosureOpen перед getDisclosureState), изменить только standalone count 8→10, component count оставить 19.

```ts
for (const name of ['getDisclosureState', 'getDisclosureOpen']) {
  const entry = catalog.entries.find(entry => entry.name === name);
  expect(entry?.kind).toBe('behavior');
  expect(entry?.docsUrl).toBe('/custom-components/#core-disclosure');
  expect(entry?.bindings).toHaveLength(1);
  expect(entry?.bindings[0]).toMatchObject({ layer: 1, framework: null,
    importPath: '@dreadnought/core', exportName: name });
  expect(() => checkExamples(context, entry!.bindings[0].examples)).not.toThrow();
}
expect(() => checkExamples(context, [{ id: 'own-disclosure', code: disclosureCode }])).not.toThrow();
```

Импорт disclosureCode из docs-файла без JSX/CSS зависимостей. Проверить getDisclosureOpen contract action values open/close/toggle, options.disabled optional; state contract required triggerId/panelId. Core snippets не импортируют React. Две новые записи ссылаются друг на друга, state также на component:accordion.

Run: `node node_modules/vitest/vitest.mjs run tools/catalog/tests/catalog.test.ts --maxWorkers=1`

Expected: новых entries нет, не ошибка генератора. Generated queryValidation пока использует предыдущий dist — обновить его после metadata.

- [x] **Step 2: Добавить metadata и честные core examples.** Формат повторяет существующие standalone behaviors, без новых schema/config sources.

```ts
// get-disclosure-state core example:
import { getDisclosureState } from '@dreadnought/core';
const state = getDisclosureState({ open: true, triggerId: 'settings-trigger', panelId: 'settings-panel' });
// Apply state.triggerProps and state.panelProps in your framework.

// get-disclosure-open core example:
import { getDisclosureOpen, getDisclosureState } from '@dreadnought/core';
const next = getDisclosureOpen(false, 'toggle');
const state = getDisclosureState({ open: next, triggerId: 'details-trigger', panelId: 'details-panel' });
const blocked = getDisclosureOpen(true, 'close', { disabled: true }); // true
```

Metadata описывает defaults open=false/disabled=false для state; options.disabled=false для transition, принадлежность IDs/callbacks/DOM потребителю. Accordion composesWith дополняется behavior:get-disclosure-state, остальные записи сохраняются.

В core-capabilities таблица Behaviors добавляет обе функции, Patterns Disclosure описывает реализованные базовые behaviors/ответственность адаптера без объявления общего controller. Toolbar больше не «следующий кандидат»: реализован через component contract и React adapter. Финальный абзац Components обновляется соответственно.

- [x] **Step 3: Сборки и проверки последовательно.**

```powershell
node node_modules/typescript/bin/tsc -p packages/core/tsconfig.build.json
node node_modules/typescript/bin/tsc -p packages/adapters/react/tsconfig.build.json
pnpm --filter @dreadnought/ui build
node node_modules/typescript/bin/tsc -p tsconfig.type-tests.json --noEmit
node tools/catalog/src/cli.mjs
node apps/docs/src/catalog/generateDocData.mjs
node node_modules/vitest/vitest.mjs run tools/catalog/tests apps/docs/tests/DisclosureDemo.test.tsx apps/docs/tests/DocsPage.test.tsx --maxWorkers=1
node apps/docs/scripts/buildDocs.mjs --public
node node_modules/vitest/vitest.mjs run --maxWorkers=1
```

Expected: каждый процесс exit 0, каталог 29 entries, docs 23 маршрута. Число knowledge fragments/test count получать из реального вывода, не выдумывать заранее. Не запускать full Vitest одновременно с docs build. При EPERM запросить штатную эскалацию; не менять timeout/config ради зелёного результата.

- [x] **Step 4: Попытка ручной проверки и фиксация ограничения.** Свежая вкладка работающей `/custom-components/` не подключилась к browser webview. Ручная проверка не подтверждена; ограничение записано и сообщается при передаче. Реальные userEvent-проверки не выдаются за браузерную проверку.
- [x] **Step 5: Проверить scope и закоммитить публикацию.**

```powershell
git status --short
git ls-files tools/catalog/dist apps/docs/src/generated apps/docs/public
git add -- packages/core/src/behaviors/catalog.json packages/core/src/components/Navigation/Accordion/catalog.json tools/catalog/tests/catalog.test.ts tools/catalog/tests/queryValidation.test.ts
git add -f -- docs/core-capabilities.md
git diff --cached --check
git commit -m "feat(catalog): publish disclosure capabilities and composition guide"
```

Tracked generated files, если они появились в git ls-files, перечислить отдельно и добавить точечно; ignored dist не force-add. Пользовательские behavior comment removals не stage.

## Self-review и передача

Spec coverage: pure contracts/validation — Task 1; Accordion compatibility/custom ownership/events/focus/native keyboard — Task 2; catalogue/docs/counts/roadmap/full builds — Task 3. Все пять Review Focus имеют проверки в Tasks 1–2; native disabled не обходится ради focus. Новые controller/component/styles/actions не создаются.

План исполнен 2026-10-05 способом Native: три этапа и одно свежее read-only итоговое ревью на gpt-6-astra. Коммиты этапов: 520dacd, 8df28fe, 38e6090. Единственное Important — приоритет защищённых props Trigger — исправлено в одном проходе; регрессионный тест наблюдался RED→GREEN. Critical и Minor нет; повторного reviewer не запускали.

Проверки: core/React/UI builds, публичные type tests и React verifyBuild — exit 0. Каталог: 29 entries; docs: 23 маршрута, 755 knowledge fragments. Проверки публикации: 127/127. Полный набор до исправления: 491/491; после исправления: 492/492 в 93 файлах, exit 0. После исправления повторно проверены React build, публичные types и verifyBuild. Временная рабочая папка этого плана удаляется после финального коммита; чужие изменения и соседние папки сохраняются.

### Решения и ограничения исполнения / ревью

1. Формат каталога не расширен: DisclosureAction остаётся alias, варианты действий и default options.disabled описаны constraints и проверены typed examples/core types. Примеры компилируются одним checkExamples без дублирования TS programs. Цена ошибки: потребителю нужны описания/примеры вместо структурированных positional defaults/literals.
2. Browser attach недоступен. Ручное поведение/вид не подтверждены и не подменяются jsdom. Цена ошибки: browser-only проблемы могут остаться незамеченными.
3. Плановый порядок spread исправлен ради прежнего контракта Accordion; защищённые ID/type/ARIA выигрывают, consumer disabled сохраняется. Цена ошибки: потребитель не может переопределить защищённую семантику — как и до этапа.
4. Runtime-действия вне DisclosureAction не валидируются; typed контракт не расширен. Цена ошибки: невалидный action из нетипизированного JS может вернуть false, а не Error.
5. Глобальная уникальность ID и существование DOM-узлов — ответственность владельца. Цена ошибки: дубликаты владельца ломают page-wide ARIA-связи.
6. Escape, закрытие снаружи и popup-позиционирование исключены. Цена ошибки: использующий эти правила для popup потребитель обязан реализовать эти взаимодействия.
7. Существующая проверка document.activeElement в Accordion не расширена до iframe/другого document; новый пример использует ownerDocument. Цена ошибки: восстановление фокуса Accordion между document может не работать.
8. Reviewer также не подтверждает реальный браузер и внешний вид из-за attachment; это не второе визуальное подтверждение. Цена ошибки: та же неопределённость browser-only поведения.

Отложенные Minor: нет.
