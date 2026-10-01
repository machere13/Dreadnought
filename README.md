# Dreadnought

Многослойная библиотека UI-компонентов. Документация охватывает 14 компонентов трёх слоёв.

```sh
pnpm install
pnpm build
pnpm test
pnpm dev
```

Машиночитаемый каталог: `pnpm catalog`. Формат, проверки и подключение локального MCP-сервера описаны в [tools/catalog/README.md](tools/catalog/README.md).

Локальные JSON-запросы к каталогу: `pnpm catalog:query --help` (для чистого JSON-вывода — `node tools/catalog/src/query.mjs --help`). Переносимая инструкция для AI-агента находится в [tools/skills/dreadnought/SKILL.md](tools/skills/dreadnought/SKILL.md); она не устанавливается автоматически.

MCP-сервер запускается локальным AI-клиентом по stdio через `tools/catalog/src/mcp.mjs` с абсолютными `--catalog` и `--project`. Он предоставляет `dreadnought_check`, `dreadnought_list`, `dreadnought_search`, `dreadnought_get`; настройки клиента и пути задаются вручную.

Сайт документации: `pnpm docs`. API-таблицы, поиск и локальный AI-помощник используют общий каталог. Команды сборки и ограничения помощника: [apps/docs/README.md](apps/docs/README.md).

Публичные входы: `@dreadnought/react/logic` (поведение), `@dreadnought/react/unstyled` (базовые компоненты), `@dreadnought/ui` (готовые компоненты). Стандартная тема подключается через `@dreadnought/themes/default.css`.

Архитектура: [docs/architecture.md](docs/architecture.md). Правила проекта: [docs/conventions.md](docs/conventions.md). План: [docs/plan.md](docs/plan.md). Возможности ядра: [docs/core-capabilities.md](docs/core-capabilities.md). Компоненты: [Button](docs/components/button.md), [Input](docs/components/input.md), [TextArea](docs/components/textarea.md). Общие действия: [docs/actions.md](docs/actions.md).
