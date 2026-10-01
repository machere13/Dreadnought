# Catalog MCP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** предоставить локальному AI-клиенту четыре MCP-инструмента для проверяемого доступа к каталогу Dreadnought.

**Architecture:** MCP-сервер принимает абсолютные пути к каталогу и проекту при запуске, регистрирует read-only инструменты и делегирует все запросы существующему `executeQuery`. SDK v2 ведёт stdio-протокол и валидирует аргументы; тонкая оболочка превращает результат или `CatalogQueryError` в MCP `content` и `structuredContent`.

**Tech Stack:** Node.js ESM, `@modelcontextprotocol/server` v2, `@modelcontextprotocol/client` v2 для интеграционных тестов, Zod v4, существующий Vitest. Изменения зависимостей — только в приватном корневом инструментарии.

**Spec:** `docs/superpowers/specs/2026-10-01-catalog-mcp-design.md`.

## Global Constraints

- «Только stdio; ни HTTP-порта, ни входящих сетевых соединений.»
- «Абсолютные пути `--catalog` и `--project` обязательны при запуске сервера. Они фиксируются на весь срок подключения.»
- «Аргументы MCP-инструментов не принимают произвольные пути.»
- «Сервер не запускает генератор каталога, не устанавливает пакеты и не подбирает другую версию из сети.»
- «Каждая операция читает актуальный локальный JSON и заново проверяет установленные версии.»
- stdout — только MCP; логирование в stderr, без содержимого проекта и каталога целиком.
- Все изменения локально в `main`, без push; исходное удаление `packages/core/src/behaviors/.keep` не добавлять в коммиты.

## Review Focus

1. Пути с пробелами, относительные/повторные/недостающие startup-флаги: сервер либо подключается к точным абсолютным путям, либо завершается без мусора в stdout; тест задачи 1.
2. Попытка MCP-вызова с `catalogPath` или `projectPath` в аргументах: SDK отклоняет неизвестные поля, а источник данных не меняется; тест задачи 2.
3. Частично установленный проект: `check` показывает missing, но `get` отсутствующего binding даёт `MISSING_BINDING_PACKAGE`; тест задачи 3.
4. Изменённый после подключения каталог или package.json: следующий вызов видит новую версию/повреждение, не старый снимок; тест задачи 3.
5. Некорректный каталог и нестандартная ошибка: ответ инструмента имеет машинный код и `isError`, stdout остаётся протокольным; тесты задач 1 и 3.

## Карта файлов и интерфейсов

- `tools/catalog/src/mcp/config.mjs` — `parseServerArgs(argv)`: точные обязательные startup-флаги, возвращает `{catalogPath, projectPath}`.
- `tools/catalog/src/mcp/invoke.mjs` — `invokeCatalog(operation, args, config)`: вызывает `executeQuery`, формирует MCP-ответ без побочных действий.
- `tools/catalog/src/mcp/server.mjs` — `createCatalogMcpServer(config)`: четыре схемы и регистрации `registerTool`.
- `tools/catalog/src/mcp.mjs` — единственная точка входа stdio; никогда не пишет обычный текст в stdout.
- `tools/catalog/tests/mcpCore.test.ts` — конфигурация и чистое преобразование ответов.
- `tools/catalog/tests/mcpServer.test.ts` — настоящие вызовы через SDK client/stdio в отдельном временном проекте.
- Корневые `package.json`, `pnpm-lock.yaml`, `tools/catalog/README.md`, `README.md` и `tools/skills/dreadnought/{SKILL.md,evaluation.md}` — команда, зависимости, инструкции и сценарная проверка.

Не менять `tools/catalog/src/query/executeQuery.mjs`, CLI или пакеты библиотеки без конкретного падающего теста, показывающего дефект общего поведения.

## Task 1: Конфигурация и ответ MCP

**Files:** создать `tools/catalog/src/mcp/config.mjs`, `tools/catalog/src/mcp/invoke.mjs`, `tools/catalog/tests/mcpCore.test.ts`.

**Interfaces:** `parseServerArgs(argv: string[]) -> {catalogPath: string, projectPath: string}`; `invokeCatalog(operation: 'check'|'list'|'search'|'get', args: object, config) -> {content, structuredContent, isError?}`. Задача 2 импортирует эти две функции.

- [x] Написать тесты startup-флагов на Windows-пути с пробелами: принять `['--catalog', absoluteCatalog, '--project', absoluteProject]` в любом порядке; отвергнуть относительный путь, пустое значение, дубликат, неизвестный флаг и пропуск любого обязательного флага с `CatalogQueryError('INVALID_ARGUMENTS')`.
- [x] Написать тесты `invokeCatalog` с `makeCatalog()` из `queryFixtures.ts` и внешним временным проектом: успешный `list` содержит один text JSON и точно равный `structuredContent`; несовпадение версии даёт `isError: true` и `VERSION_MISMATCH`; `check` при несовпадении остаётся отчётом с `isError` отсутствующим; повреждённый JSON даёт `INVALID_JSON`, а не stack trace. После теста удалять только созданный временный каталог.

```ts
const reply = invokeCatalog('list', {limit: 1}, {catalogPath, projectPath});
expect(reply.isError).toBeUndefined();
expect(JSON.parse(reply.content[0].text)).toEqual(reply.structuredContent);
expect(reply.structuredContent.result).toMatchObject({limit: 1, total: 1});
```
- [x] Выполнить `node node_modules/vitest/vitest.mjs run tools/catalog/tests/mcpCore.test.ts --maxWorkers=1`; зафиксировать падение из-за отсутствующих модулей.
- [x] Реализовать парсер без cwd-fallback и без принятия лишних флагов:

```js
import path from 'node:path';
import { CatalogQueryError } from '../query/errors.mjs';

export function parseServerArgs(argv) {
  const values = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i], value = argv[i + 1];
    if (!['--catalog', '--project'].includes(flag) || !value || value.startsWith('--') || Object.hasOwn(values, flag)) {
      throw new CatalogQueryError('INVALID_ARGUMENTS', 'Invalid startup arguments');
    }
    values[flag] = value;
  }
  if (Object.keys(values).length !== 2 || !path.isAbsolute(values['--catalog']) || !path.isAbsolute(values['--project'])) {
    throw new CatalogQueryError('INVALID_ARGUMENTS', 'Absolute catalog and project paths are required');
  }
  return Object.freeze({catalogPath: values['--catalog'], projectPath: values['--project']});
}
```

- [x] Реализовать преобразование ответа, передавая пути только из `config`, а плоские MCP-аргументы разделяя на `component`, `query` и остальные `options`. Для ошибки использовать `{responseVersion: 1, operation, error: {code, message, details}}`; неизвестные ошибки нормализовать в `INTERNAL_ERROR` без stack trace:

```js
import { executeQuery } from '../query/executeQuery.mjs';
import { CatalogQueryError } from '../query/errors.mjs';

export function invokeCatalog(operation, args, config) {
  try {
    const {component, query, ...options} = args;
    const payload = executeQuery({operation, catalogPath: config.catalogPath,
      projectPath: config.projectPath, component, query, options});
    return {content: [{type: 'text', text: JSON.stringify(payload)}], structuredContent: payload};
  } catch (error) {
    const known = error instanceof CatalogQueryError;
    const payload = {responseVersion: 1, operation, error: {
      code: known ? error.code : 'INTERNAL_ERROR',
      message: known ? error.message : 'Unexpected catalog error',
      details: known ? error.details : {},
    }};
    return {content: [{type: 'text', text: JSON.stringify(payload)}], structuredContent: payload, isError: true};
  }
}
```

- [x] Повторить тест задачи и существующие `queryCli.test.ts`/`queryProject.test.ts`; сохранить коммит `feat(mcp): map local catalog queries to tool results` только с файлами этой задачи.

## Task 2: Регистрация инструментов и stdio

**Files:** создать `tools/catalog/src/mcp/server.mjs`, `tools/catalog/src/mcp.mjs`; изменить корневые `package.json` и `pnpm-lock.yaml`; создать первую часть `tools/catalog/tests/mcpServer.test.ts`.

**Interfaces:** `createCatalogMcpServer(config) -> McpServer`; entrypoint `node tools/catalog/src/mcp.mjs --catalog ABS --project ABS`. Имя сервера `dreadnought-catalog`, версия `0.1.0` обозначает версию MCP-оболочки, не версию каталога.

- [x] Добавить SDK v2 и Zod v4 только в корневые devDependencies командой `pnpm add -Dw @modelcontextprotocol/server@^2 @modelcontextprotocol/client@^2 zod@^4`; сохранить lockfile. Убедиться, что `packages/*/package.json` не изменились.
- [x] Написать тест через `Client` и `StdioClientTransport({command: process.execPath, args: [serverPath, '--catalog', catalogPath, '--project', projectPath]})`: `await client.connect(transport)`, `client.listTools()` возвращает ровно четыре ожидаемых имени, `callTool({name:'dreadnought_check', arguments:{}})` возвращает `structuredContent.compatibility.status === 'compatible'`; `await client.close()` в `finally`.

```ts
const client = new Client({name: 'catalog-test', version: '1.0.0'});
const transport = new StdioClientTransport({command: process.execPath,
  args: [serverPath, '--catalog', catalogPath, '--project', projectPath]});
try {
  await client.connect(transport);
  expect((await client.listTools()).tools.map((tool) => tool.name).sort()).toEqual([
    'dreadnought_check', 'dreadnought_get', 'dreadnought_list', 'dreadnought_search']);
  const reply = await client.callTool({name: 'dreadnought_check', arguments: {}});
  expect((reply.structuredContent as any).compatibility.status).toBe('compatible');
} finally { await client.close(); }
```
- [x] Запустить `node node_modules/vitest/vitest.mjs run tools/catalog/tests/mcpServer.test.ts --maxWorkers=1`; увидеть падение до регистрации/entrypoint.
- [x] Создать строгие Zod-схемы; обязательные строки — `.trim().min(1)`, числовые ограничения совпадают с CLI, неизвестные ключи отклоняются через `.strict()`. Регистрировать `dreadnought_check`, `dreadnought_list`, `dreadnought_search`, `dreadnought_get`, каждый callback передаёт плоские аргументы в `invokeCatalog` с точной операцией. Для `get` не выбирать binding автоматически. Форма регистрации:

```js
const listShape = {family: z.string().trim().min(1).optional(),
  layer: z.number().int().min(1).max(3).optional(),
  framework: z.string().trim().min(1).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  offset: z.number().int().nonnegative().optional()};
server.registerTool('dreadnought_check', {description: 'Check installed Dreadnought versions',
  inputSchema: z.object({}).strict()}, async () => invokeCatalog('check', {}, config));
server.registerTool('dreadnought_list', {description: 'List local Dreadnought bindings',
  inputSchema: z.object(listShape).strict()}, async (args) => invokeCatalog('list', args, config));
server.registerTool('dreadnought_search', {description: 'Search local Dreadnought bindings',
  inputSchema: z.object({query: z.string().trim().min(1), ...listShape}).strict()},
  async (args) => invokeCatalog('search', args, config));
server.registerTool('dreadnought_get', {description: 'Read one Dreadnought component section',
  inputSchema: z.object({component: z.string().trim().min(1), binding: z.string().trim().min(1).optional(),
    section: z.enum(['overview', 'api', 'examples', 'tokens']).optional(),
    property: z.string().trim().min(1).optional(), example: z.string().trim().min(1).optional(),
    includeInherited: z.boolean().optional()}).strict()},
  async (args) => invokeCatalog('get', args, config));
```
- [x] В `mcp.mjs` вызвать `parseServerArgs(process.argv.slice(2))`, затем `serveStdio(() => createCatalogMcpServer(config))`. Startup-ошибки писать только в stderr и завершать ненулевым кодом без строки в stdout. Добавить корневой script `catalog:mcp` для запуска этого файла.
- [x] Запустить тест задачи и `node tools/catalog/src/mcp.mjs` без аргументов: последний должен завершиться с ошибкой в stderr и пустым stdout. Сохранить коммит `feat(mcp): serve catalog tools over local stdio`.

## Task 3: Сквозные контрактные и негативные сценарии

**Files:** расширить `tools/catalog/tests/mcpServer.test.ts`; менять production-код задачи 1 или 2 только при воспроизведённом дефекте.

**Interfaces:** проверяет публичные имена, MCP-ответы и совпадение с `executeQuery`/CLI; новых production-интерфейсов нет.

- [x] В отдельных временных проектах проверить `check` при полном отсутствии, частичном наборе, совпадении и несовпадении версий. Для частичного набора с одним core `check` совместим, но `get Button/react-ui/api` возвращает `MISSING_BINDING_PACKAGE`; при другом выпуске `list/search/get` возвращают `VERSION_MISMATCH`.

```ts
const missingUi = await client.callTool({name: 'dreadnought_get', arguments: {
  component: 'Button', binding: 'react-ui', section: 'api'}});
expect(missingUi.isError).toBe(true);
expect((missingUi.structuredContent as any).error.code).toBe('MISSING_BINDING_PACKAGE');
```
- [x] Проверить запрет пути в tool arguments: `callTool` с `projectPath` или `catalogPath` получает `isError: true` от SDK и следующий валидный вызов по-прежнему читает исходный проект. Проверить `limit: 0`, дробный `layer`, неизвестный `section` и пропущенный `query`.
- [x] На настоящем каталоге, полученном в тестовом `beforeAll` через существующие `createContext` и `generateCatalog` (не полагаться на игнорируемый `dist`), проверить `get Button/react-ui/api/property=ref` с двумя различными HTML ref; `get Layout/react-ui-sidebar/api` с `propertyPath: ['Sidebar']`; `get Button/react-ui/examples` и компонентные `tokens`; `list framework=angular` с `total: 0`; пустой поиск с `total: 0`.
- [x] В одной сессии изменить временный `package.json` установленного пакета или каталог между двумя вызовами и подтвердить, что второй ответ видит новое состояние. Подменить временный каталог на повреждённый JSON: `isError: true`, код `INVALID_JSON`, соединение остаётся пригодным после восстановления файла. Тестировать без правки сгенерированного `tools/catalog/dist/catalog.json`.
- [x] Сравнить `structuredContent`, распарсенный единственный text-блок и прямой `executeQuery` с теми же путями/аргументами; они должны быть равны. Проверить, что stdout живого сервера не содержит обычных логов (успешное подключение SDK и вызовы без ошибок протокола).

```ts
const expected = executeQuery({operation: 'list', catalogPath, projectPath, options: {limit: 1}});
const actual = await client.callTool({name: 'dreadnought_list', arguments: {limit: 1}});
expect(actual.structuredContent).toEqual(expected);
expect(JSON.parse((actual.content[0] as any).text)).toEqual(expected);
```
- [x] Запустить `mcpServer.test.ts` и все query-тесты, исправить только обнаруженные проблемы, сохранить коммит `test(mcp): verify catalog parity and compatibility`.

## Task 4: Подключение, Skill и итоговая проверка

**Files:** изменить `tools/catalog/README.md`, корневой `README.md`, `tools/skills/dreadnought/SKILL.md`, `tools/skills/dreadnought/evaluation.md`, этот план.

**Interfaces:** готовые инструкции запуска для внешнего клиента; CLI остаётся запасным способом доступа.

- [x] Перед правкой Skill прочитать `skill-creator` и `superpowers:writing-skills`; выполнить контрольный сценарий с прежней инструкцией, затем с обновлённой. Сценарии: подключённый MCP, отсутствующий MCP с доступным CLI, несовместимая версия, Angular без binding. Оценивать реальные вызовы и ответы, не наличие слов в Markdown.
- [x] Обновить Skill: при подключённых инструментах использовать `dreadnought_check` → `search/list` → `get`; если MCP недоступен, применять локальный CLI по явно переданным путям. Не дублировать список пропсов/токенов и не трактовать `unchecked` как совместимость.
- [x] Дополнить README конфигурацией клиента: `command` — абсолютный путь к Node, `args` — абсолютный путь к `mcp.mjs`, `--catalog ABS`, `--project ABS`; объяснить, что сервер не устанавливается и не регистрируется автоматически. Для данных из исходников сначала `pnpm catalog`.
- [x] Выполнить по порядку `pnpm catalog`, `node node_modules/vitest/vitest.mjs run --maxWorkers=1`, `pnpm docs:build`, `pnpm typecheck`, `git diff --check`; проверить 14 записей каталога и отсутствие изменений контрактов сайта. Записать фактические результаты в `evaluation.md` и этот план.
- [x] Проверить `git status --short`: вне задачи остаётся только исходное удаление `.keep`. Сохранить коммит `docs(mcp): document local client setup and agent flow`, без push и без заявления, что HTTP/авторегистрация реализованы.

## Самопроверка покрытия

Конфигурация, фиксированные пути и конверт — задача 1; SDK и протокол — задача 2; версии, нетривиальные контракты и отсутствие кеша — задача 3; внешний способ подключения и поведение Skill — задача 4. Все пять условий Review Focus имеют соответствующий тест. Логика генератора, браузерного RAG и библиотечных пакетов остаётся вне изменений.

## Результат 2026-10-01

Локальные коммиты: `e8c6dc6` (конфигурация и ответы), `7450290` (stdio-сервер), `b28fd7f` (сквозные проверки). `pnpm catalog` создал 14 записей; полный Vitest прошёл 69 файлов и 328 тестов; `pnpm docs:build` собрал 18 страниц; `pnpm typecheck` завершился без ошибок, Astro — без предупреждений. `quick_validate.py` подтвердил формат Skill. Исходное удаление `packages/core/src/behaviors/.keep` оставлено вне коммитов.
