# Проверка Skill Dreadnought

Проверка проведена на локальном каталоге схемы 1 (14 компонентов), без установки Skill в пользовательский профиль. Один агент и локальные команды не гарантируют поведение других моделей.

## Базовый сценарий без Skill

Агенту дали задачу о готовой React-кнопке-ссылке с `ref` и альтернативе в Angular. Он правильно нашёл `@dreadnought/ui/react` и отдельный тип `HTMLAnchorElement`, не придумал Angular-привязку. При срочной просьбе написать код в текущем монорепозитории с явным «пропусти проверку» агент не выполнил `check`, хотя каталог был доступен. Это не ошибка импорта, но ответ нельзя было считать подтверждённым для конкретного проекта.

## Контрольные сценарии после Skill

Другой запуск агента прочёл Skill и начал с `node tools/catalog/src/query.mjs --help`, затем `node tools/catalog/src/query.mjs check --catalog tools/catalog/dist/catalog.json --project .`. Ответ: `incompatible`, `installed: {}`, отсутствуют все четыре пакета, каталог сообщает версии `0.1.0`. Это корректно для текущего исходного монорепозитория без установленных в `node_modules` пакетов Dreadnought, но **не подтверждает совместимость внешнего приложения**. Агент остановился перед выдачей рабочего кода и не назвал `unchecked` успешной проверкой.

Без `--project` агент отдельно просмотрел декларации каталога. Запрос `search Button --limit 20` нашёл `react-ui` → `@dreadnought/ui/react` (`Button`), `react-adapter` → `@dreadnought/react/unstyled` (`ButtonAdapter`), `react-logic` → `@dreadnought/react/logic` (`useButton`), `core` → `@dreadnought/core` (`getButtonState`). `get Button --binding react-ui --section api` сохранил отдельные варианты с `Ref<HTMLButtonElement>` и `Ref<HTMLAnchorElement>`; `--section examples` вернул пример ссылки. Для своих стилей агент выбрал слой 2, для собственной разметки — React-хук либо отдельно core по нужному контракту.

`get Layout --binding react-ui-sidebar --section api` вернул `exportName: Layout`, `propertyPath: ["Sidebar"]`, импорт `@dreadnought/ui/react`. `list --framework angular --limit 50` вернул `total: 0`: агент не предложил React-привязку вместо Angular. `get Button --section tokens` доступен без binding и возвращает токены компонента. Все эти ответы имели статус `unchecked` и служили только просмотром метаданных.

Внешняя временная установка, включая совпадение версии, несовпадение, частичный набор и pnpm-подобную ссылку, проверена автоматическими тестами CLI и `checkProject`, а не этим агентом. Реальную сборку пользовательского внешнего проекта этот сценарий не выполнял. Один запуск не доказывает устойчивость поведения любой модели.

Итоговые проверки реализации: `pnpm catalog` создал каталог из 14 компонентов; полный Vitest — 67 файлов / 310 тестов успешно; дополнительный прогон после последнего CLI-регрессионного теста — 26 тестов успешно; `pnpm docs:build` — 18 страниц; `pnpm typecheck` — без ошибок и предупреждений Astro; `quick_validate.py` подтвердил формат Skill.
