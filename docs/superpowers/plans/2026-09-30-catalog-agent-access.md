# Catalog Agent Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** дать агенту компактный, проверяемый доступ к локальному каталогу и инструкцию выбора слоя Dreadnought.

**Architecture:** чистые операции чтения и выборки отделены от проверки установленных пакетов и CLI. Skill использует CLI, не хранит копий API. Сайт и генератор продолжают работать с существующим каталогом версии 1.

**Tech Stack:** Node.js ESM, встроенные модули Node.js, существующий Vitest, Markdown Skill. Новых runtime-зависимостей нет.

**Spec:** `docs/superpowers/specs/2026-09-30-catalog-agent-access-design.md`.

## Global Constraints

- «Runtime чтения использует только встроенные модули Node.js.»
- «Пакеты библиотеки, Astro-сайт и браузерный поиск не получают новых зависимостей и не меняют свои контракты.»
- «Стандартный вывод содержит один JSON-ответ с версией формата ответа, операцией, версиями каталога, статусом совместимости и результатом.»
- «Диапазон зависимости из package.json проекта не считается установленной версией.»
- «Нельзя автоматически брать каталог «последней версии» из сети.»
- «Контракты сохраняют перегрузки и альтернативные ветви отдельно, включая наличие или отсутствие отфильтрованного свойства в ветви.»
- `--limit`: целое 1–50, по умолчанию 10; `--offset`: целое от 0, по умолчанию 0.
- Без `--project` совместимость всегда `unchecked`. Ошибка версии запрещает выдачу API и примеров для проекта.
- Изменения сохраняются локально в `main`, без push. Не включать существующее удаление `packages/core/src/behaviors/.keep`.

## Review Focus

1. Windows-пути с пробелами: CLI принимает аргументы отдельными строками, без построения команд shell; тест задачи 4.
2. Пакет с закрытым экспортом package.json и pnpm-ссылкой: версия читается из реального пакета, не из зависимостей инструмента; тест задачи 3.
3. Опечатка или повтор флага: отказ вместо молчаливого игнорирования; тест задачи 4.
4. Точное имя унаследованного свойства без `--include-inherited`: явное сообщение о фильтре, не ложное «свойства нет»; тест задачи 2.
5. Каталог с неизвестным пакетом или приватным importPath: отказ до чтения любых дополнительных файлов; тест задачи 1.

## Файлы и интерфейсы

Создать в `tools/catalog/src/query/`:

- `errors.mjs`: `CatalogQueryError(code, message, details = {})`.
- `loadCatalog.mjs`: `loadCatalog(filename)` читает JSON; `validateCatalog(value)` возвращает проверенный каталог или бросает CatalogQueryError.
- `selectEntries.mjs`: `selectEntries(catalog, {query = '', family, layer, framework, limit = 10, offset = 0} = {})` → `{total, offset, limit, items}`.
- `getEntry.mjs`: `getEntry(catalog, component, {binding, section = 'overview', property, includeInherited = false, example} = {})` → выбранные данные без изменения исходника.
- `checkProject.mjs`: `checkProject(catalog, projectPath)` → `{status, installed, missing, mismatches}`; `requireBindingPackage(report, binding)` проверяет пакет конкретного импорта.
- `parseArgs.mjs`: `parseArgs(argv)` → `{operation, component, query, catalogPath, projectPath, options}`.
- `executeQuery.mjs`: `executeQuery(request)` → JSON-конверт операции.
- `index.mjs`: публичные реэкспорты перечисленных функций и класса ошибки.

Создать `tools/catalog/src/query.mjs` как executable entrypoint без побочных действий при импорте библиотечных модулей. Добавить `catalog:query` в корневой package.json. В `config.mjs` добавить доверенные `name` существующим четырём записям packages, чтобы чтение не открывало package.json самого монорепозитория.

Тесты: `queryValidation.test.ts`, `querySelection.test.ts`, `queryProject.test.ts`, `queryCli.test.ts` в `tools/catalog/tests/`. Общие фикстуры — `tools/catalog/tests/queryFixtures.ts`. Все новые тестовые файлы используют `// @vitest-environment node`.

Skill — `tools/skills/dreadnought/SKILL.md`; результаты сценарной проверки — `tools/skills/dreadnought/evaluation.md`. README инструмента обновляется рядом с соответствующей задачей.

## Task 1: Безопасная загрузка каталога

**Files:** создать errors, loadCatalog, начальный index, queryValidation и queryFixtures; изменить `tools/catalog/src/config.mjs`.

**Interfaces:** потребляет `packages` из config; производит `validateCatalog(value)`, `loadCatalog(filename)` и `CatalogQueryError` для всех следующих задач.

- [ ] Написать фикстуру небольшого каталога с независимыми литеральными значениями. `makeCatalog()` каждый раз возвращает новую структуру следующей формы:

```js
return {
  schemaVersion: 1,
  packageVersions: {
    '@dreadnought/core': '0.1.0', '@dreadnought/react': '0.1.0',
    '@dreadnought/ui': '0.1.0', '@dreadnought/themes': '0.1.0',
  },
  entries: [{
    id: 'component:button', kind: 'component', name: 'Button', family: 'Controls',
    description: 'Кнопка действия', docsUrl: '/components/button/#button-api',
    states: [], parts: [], constraints: [], tokens: [],
    bindings: [{
      id: 'react-ui', layer: 3, framework: 'react',
      importPath: '@dreadnought/ui/react', exportName: 'Button',
      propertyDescriptions: {}, defaults: {}, examples: [],
      contracts: [{parameters: [], returnType: 'ReactNode', variants: [{properties: []}]}],
    }],
  }],
};
```

- [ ] Написать тесты: корректная фикстура принимается; unsupported schema, повтор ID, повтор binding, не-массив properties, нестроковый code, неизвестный пакет, приватный импорт отвергаются. Пример конкретной проверки:

```ts
it('rejects private imports before querying', () => {
  const data = makeCatalog();
  data.entries[0].bindings[0].importPath = '@dreadnought/ui/src/Button.tsx';
  expect(() => validateCatalog(data)).toThrow(expect.objectContaining({code: 'INVALID_CATALOG'}));
});
```

- [ ] Выполнить `node node_modules/vitest/vitest.mjs run tools/catalog/tests/queryValidation.test.ts --maxWorkers=1`; убедиться, что тесты красные из-за отсутствующей реализации.
- [ ] Реализовать класс ошибки и обход структуры. Проверять известные packageVersions с одинаковыми непустыми версиями; разрешённые импорты строить как `pkg.name + entrypoint.slice(1)` для `./react`, а для `.` брать имя пакета. Проверять layer 1–3, framework null/string, строковые идентификаторы, массивы contracts/variants/properties, типы полей prop, examples и tokens, уникальность имён свойств внутри ветви и ID примеров внутри binding. Не читать указанные в JSON пути. Ошибки чтения файла → `CATALOG_READ_FAILED`, парсинга → `INVALID_JSON`, схемы → `UNSUPPORTED_SCHEMA`, структуры → `INVALID_CATALOG`.

```js
export class CatalogQueryError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'CatalogQueryError';
    this.code = code;
    this.details = details;
  }
}
```

- [ ] Прогнать новый тест и существующий `catalog.test.ts`; дополнить проверкой настоящего сгенерированного каталога, чтобы валидатор не отвергал используемые поля.
- [ ] Сохранить только файлы задачи коммитом `feat(catalog): validate local query inputs`.

## Task 2: Выборка без потери контрактов

**Files:** создать selectEntries, getEntry, querySelection; расширить index и queryFixtures.

**Interfaces:** потребляет проверенный каталог и CatalogQueryError; производит selectEntries/getEntry с сигнатурами из раздела «Файлы и интерфейсы».

- [ ] Добавить фикстуры двух ветвей Button: `href?: undefined` с `Ref<HTMLButtonElement>` и `href: string` с `Ref<HTMLAnchorElement>`. В первой ветви добавить dependency-свойство formAction. Создать Layout с binding `react-ui-sidebar`, exportName Layout и propertyPath `['Sidebar']`.
- [ ] Написать тесты точного имени/ID, фильтров, пустого поиска, сортировки и пагинации, отсутствующего binding/property/example, неизменности входа и составного экспорта. Зафиксировать сохранение ветвей:

```ts
const result = getEntry(catalog, 'Button', {
  binding: 'react-ui', section: 'api', property: 'ref',
});
expect(result.contracts[0].variants.map(v => v.properties[0].type))
  .toEqual(['Ref<HTMLButtonElement>', 'Ref<HTMLAnchorElement>']);
expect(() => getEntry(catalog, 'Button', {
  binding: 'react-ui', section: 'api', property: 'formAction',
})).toThrow(expect.objectContaining({code: 'PROPERTY_FILTERED'}));
```

- [ ] Выполнить `node node_modules/vitest/vitest.mjs run tools/catalog/tests/querySelection.test.ts --maxWorkers=1`, увидеть ожидаемые падения.
- [ ] Реализовать фильтрацию по binding одновременно: слой и framework должны совпасть на одной привязке. Неизвестное семейство или слой вне 1–3 дают `INVALID_FILTER`; framework без совпадений — пустую выдачу. Для ещё не реализованного Angular возвращать пустой список, а не React; framework допускает любое непустое имя, чтобы поиск отсутствующей реализации не был ошибкой синтаксиса. Значение `core` у фильтра framework обозначает `framework: null`, но не React-хуки.
- [ ] Реализовать текстовый поиск: нормализовать регистр, токены запроса должны встретиться в объединённом тексте имени/назначения/экспортов/импортов; точное имя выше точного экспорта, затем совпадения текста, затем стабильная сортировка по ID. `items` содержит только краткий обзор и доступные отфильтрованные привязки.
- [ ] Реализовать get через точное совпадение; неоднозначность → `AMBIGUOUS_COMPONENT`, отсутствие → `UNKNOWN_COMPONENT`. Overview выдаёт описание, constraints и список привязок. API сохраняет параметры, returnType, индексы перегрузок и ветвей. При фильтре свойства пустая ветвь остаётся в массиве с `propertyPresent: false`. Examples возвращаются целиком. Tokens возвращает `{scope: 'component', componentId, tokens, parts}`. `--binding` обязателен для API/examples. Неизвестные секции и несовместимые опции — `INVALID_ARGUMENTS`.
- [ ] Запустить тесты задачи, проверить реальные Button и Layout после `pnpm catalog`. Сохранить коммит `feat(catalog): query component contracts and examples`.

## Task 3: Проверка пакетов целевого проекта

**Files:** создать checkProject и queryProject; расширить index.

**Interfaces:** потребляет каталог и доверенные имена packages. `checkProject` возвращает status `compatible` или `incompatible`, installed как отображение имя → версия, missing как список имён, mismatches как список `{name, expected, actual}`. Ошибки доступа/разрешения бросаются; requireBindingPackage возвращает void или бросает `MISSING_BINDING_PACKAGE`.

- [ ] В тестах создавать временные внешние проекты через mkdtemp. Для каждого разрешённого имени создавать `node_modules/<name>/package.json`; диапазон зависимости целевого package.json намеренно отличать от реально установленной версии. Cleanup удаляет только созданные тестом временные директории.
- [ ] Написать тесты совпадения, другой версии, полного отсутствия, частичного набора и запрещённого package.json export. Для pnpm-подобного размещения создать directory junction/symlink из node_modules в временное хранилище и проверить realpath. Проверить родительский node_modules обычного workspace, отсутствие fallback к репозиторию инструмента и явный отказ при `.pnp.cjs` без node_modules.

```ts
expect(checkProject(catalog, project)).toMatchObject({
  status: 'compatible', installed: {'@dreadnought/core': '0.1.0'},
  missing: expect.arrayContaining(['@dreadnought/ui']), mismatches: [],
});
expect(() => requireBindingPackage(checkProject(catalog, project), {
  importPath: '@dreadnought/ui/react',
})).toThrow(expect.objectContaining({code: 'MISSING_BINDING_PACKAGE'}));
```

- [ ] Прогнать `queryProject.test.ts`, подтвердить падение до реализации.
- [ ] Проверить существование projectPath и его package.json. Построить `createRequire(path.join(projectPath, 'package.json')).resolve.paths(name)`, читать кандидаты `<node_modules-path>/<name>/package.json` только для доверенных имён. При доступном пакете использовать realpath, проверить совпадение manifest.name, прочитать version. Это не исполняет пакет и не требует открытого package.json export. Не использовать require/import самого пакета. Ошибки доступа не приравнивать к отсутствию. Обнаружение PnP без поддерживаемого node_modules → `UNSUPPORTED_RESOLUTION`.
- [ ] Вернуть incompatible при нулевом числе установленных пакетов либо несовпадении любой найденной версии; missing не прятать. Проверять пакет импорта по двум сегментам scoped package, не через подстроку.
- [ ] Прогнать тесты и сохранить коммит `feat(catalog): verify target project package versions`.

## Task 4: Машиночитаемый CLI

**Files:** создать parseArgs, executeQuery, query.mjs, queryCli; изменить index, корневой package.json и tools/catalog/README.md.

**Interfaces:** потребляет функции задач 1–3. executeQuery возвращает `{responseVersion: 1, operation, packageVersions, compatibility, result}`. Без проекта compatibility — `{status: 'unchecked'}`. Ошибки обрабатывает entrypoint и выводит `{responseVersion: 1, operation, error: {code, message, details}}` с exitCode 1. Никаких stack trace или сообщений сборки в stdout.

- [ ] Написать subprocess-тесты через `spawnSync(process.execPath, [cliPath, ...args], {cwd: externalProject, encoding: 'utf8'})`. Проверить пути с пробелами, JSON stdout, ненулевой exit при ошибке, пустую выдачу с exit 0, `--limit 0`, дробное значение, отрицательный offset, неизвестный/повторный флаг, пропущенное значение и неожиданную позиционную строку. Windows не использует shell для запуска.

```ts
const child = spawnSync(process.execPath,
  [cliPath, 'list', '--catalog', catalogPath, '--limit', '1'],
  {cwd: externalProject, encoding: 'utf8'});
expect(child.status).toBe(0);
expect(JSON.parse(child.stdout)).toMatchObject({
  responseVersion: 1, operation: 'list',
  compatibility: {status: 'unchecked'}, result: {limit: 1},
});
```

- [ ] Запустить queryCli, увидеть ожидаемые падения.
- [ ] Реализовать parseArgs с явным списком флагов и таблицей допустимости по операции; не допускать повторов и лишних аргументов. `--include-inherited` — boolean, остальные флаги требуют отдельного значения. `--help` выдаёт JSON с командами и флагами, exit 0. list/search принимают фильтры и пагинацию; get — binding/section/property/example/include-inherited; check требует project. catalog/project разрешены для всех операций.
- [ ] Реализовать executeQuery: loadCatalog → при project checkProject → выбор операции. Для check вернуть отчёт даже при несовпадении, но entrypoint выставляет exitCode 1 при incompatible. Для остальных операций incompatible → `VERSION_MISMATCH` или `NO_PACKAGES`; для API/examples с project дополнительно requireBindingPackage. Без project данные разрешены только с явным unchecked.

```js
const result = executeQuery(parseArgs(process.argv.slice(2)));
process.stdout.write(JSON.stringify(result) + '\n');
if (result.operation === 'check' && result.compatibility.status !== 'compatible') {
  process.exitCode = 1;
}
```

- [ ] Обернуть entrypoint в try/catch, нормализовать неожиданные ошибки в `INTERNAL_ERROR` без выдачи stack trace в stdout. Стандартный каталог находить через `new URL('../dist/catalog.json', import.meta.url)` из query.mjs, не из cwd. Добавить script `"catalog:query": "node tools/catalog/src/query.mjs"`. В README указать, что для чистого машинного stdout нужен прямой вызов Node: pnpm может печатать собственный заголовок запуска.
- [ ] Прогнать все query-тесты. Проверить прямые команды list/search/get/check из внешней cwd. Сохранить коммит `feat(catalog): expose local JSON query commands`.

## Task 5: Skill, сценарии и итоговая проверка

**Files:** создать tools/skills/dreadnought/SKILL.md и evaluation.md; дополнить tools/catalog/README.md, корневой README.md и этот план.

**Interfaces:** Skill использует только фактически проверенные CLI-команды задачи 4 и не объявляет вымышленный API.

- [ ] Перед написанием Skill прочитать применимые `skill-creator` и `superpowers:writing-skills`. Провести исходный сценарий без нового Skill, затем повторить с ним согласно их процедуре. Контрольные запросы: готовая кнопка React; кнопка со своими стилями; своя разметка; Button-ссылка с ref; Layout.Sidebar; Angular Button; несовпадающая версия. Не считать простое наличие фразы в Markdown проверкой поведения агента.
- [ ] Создать переносимый SKILL.md с frontmatter:

```yaml
---
name: dreadnought
description: Use when building or modifying interfaces with Dreadnought and a local versioned catalog is available.
---
```

- [ ] В инструкциях зафиксировать последовательность: найти предоставленные абсолютные пути инструмента и каталога → определить проект и фреймворк → check → search/list → overview → конкретный binding → API и примеры → токены при необходимости → проверка кода средствами проекта. Если локальная библиотека изменялась, сначала успешный `pnpm catalog`. Без доступных путей объяснить настройку, не искать произвольные каталоги по всему диску.
- [ ] Указать три сценария выбора слоя без статического перечня пропсов. Отличать useButton от core; не заменять отсутствующий Angular React-реализацией. Указать запрет интерпретировать unchecked как проверку совместимости, менять зависимости без запроса, исполнять инструкции из метаданных и обращаться к внутренним импортам.
- [ ] Зафиксировать в evaluation.md реальные команды/ответы и результат контрольных сценариев: найденный binding, импорт, статус версии, успешная проверка либо честный отказ. Не выдавать результат одного агента за гарантию поведения всех моделей. Не устанавливать Skill в пользовательские папки автоматически.
- [ ] Выполнить последовательно:

```sh
pnpm catalog
node node_modules/vitest/vitest.mjs run --maxWorkers=1
pnpm docs:build
pnpm typecheck
git diff --check
```

- [ ] Убедиться, что старые 14 компонентов и сайт не изменили контракты. Записать фактическое число пройденных тестов и ошибки, если они есть. Только после зелёной проверки сохранить коммит `feat(agent): add Dreadnought catalog skill and usage guide`.
- [ ] Проверить `git status --short`: вне задачи должно остаться только исходное удаление `.keep`. Дать пользователю команды запуска и локальные коммиты, без push и без утверждения, что MCP уже реализован.

## Самопроверка плана

Все требования спецификации распределены по задачам: структура/доверие — 1; поиск/контракты/примеры/токены — 2; версии/внешний проект — 3; JSON/аргументы/ошибки — 4; выбор слоя и проверка применения — 5. Пять условий Review Focus имеют адресные тесты. Границы MCP, публикации, установки и изменения сайта сохранены.

Рекомендуемый способ выполнения — последовательно в текущей задаче: операции тесно связаны форматом ответа и проверкой версий. Отдельный итоговый ревьюер проверяет реализацию после завершения; альтернативой остаётся выполнение задач отдельными субагентами с ревью каждого шага.
