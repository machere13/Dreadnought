# Dreadnought

Многослойная библиотека UI-компонентов. Документация охватывает 14 компонентов трёх слоёв.

```sh
pnpm install
pnpm build
pnpm test
pnpm dev
```

Машиночитаемый каталог: `pnpm catalog`. Формат и проверки описаны в [tools/catalog/README.md](tools/catalog/README.md).

Сайт документации: `pnpm docs`. API-таблицы, поиск и локальный AI-помощник используют общий каталог. Команды сборки и ограничения помощника: [apps/docs/README.md](apps/docs/README.md).

Публичные входы: `@dreadnought/react/logic` (поведение), `@dreadnought/react/unstyled` (базовые компоненты), `@dreadnought/ui` (готовые компоненты). Стандартная тема подключается через `@dreadnought/themes/default.css`.

Архитектура: [docs/architecture.md](docs/architecture.md). Правила проекта: [docs/conventions.md](docs/conventions.md). План: [docs/plan.md](docs/plan.md). Возможности ядра: [docs/core-capabilities.md](docs/core-capabilities.md). Компоненты: [Button](docs/components/button.md), [Input](docs/components/input.md), [TextArea](docs/components/textarea.md). Общие действия: [docs/actions.md](docs/actions.md).
