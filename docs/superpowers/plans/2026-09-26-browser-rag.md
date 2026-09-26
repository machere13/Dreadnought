# Browser RAG for Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Запустить статическую документацию Dreadnought с локальным поиском и необязательным ответом браузерной модели только по опубликованным разделам.

**Architecture:** Приватное приложение `apps/docs` хранит явно отобранные публичные разделы в одном JSON. Из того же JSON строятся видимые страницы и поисковый индекс, поэтому помощник не может индексировать внутренние файлы репозитория. Поиск работает без модели. WebLLM подгружается после действия пользователя, работает в Web Worker и получает только найденные фрагменты; UI проверяет идентификаторы источников перед показом ссылок.

**Tech Stack:** React 19, Vite 7, TypeScript, Vitest 3, pnpm 9, WebLLM `@mlc-ai/web-llm`, Qwen3-1.7B-q4f16_1-MLC.

**Spec:** [2026-09-26-browser-rag-design.md](../specs/2026-09-26-browser-rag-design.md)

## Global Constraints

- `apps/docs` — приватное приложение. Не менять runtime-зависимости `packages/*` и не индексировать `docs/`, исходники, тесты, Storybook или планы автоматически.
- Единственный источник индекса — `apps/docs/src/content/pages.json`, из которого одновременно отрисовываются опубликованные разделы. Новая возможность попадает в RAG только через добавление раздела на сайт и выпуск сайта.
- На первом этапе все документы доступны в одной статической странице с якорями `/#<section-id>`. Это даёт работающие ссылки без серверной настройки SPA-маршрутов. Лендинг и сайт-представление в эту работу не входят.
- Индекс и сайт собираются совместно. Версия корпуса берётся из `apps/docs/src/content/pages.json`; перед выпуском её сверяют с публичной версией пакетов. Не включать будущие API даже если они уже есть в рабочих исходниках.
- Поиск, ссылки и страницы должны работать при отсутствии WebGPU, при ошибке загрузки весов и после отмены генерации. Веса модели не копируются в `dist`.
- Зафиксировать версию WebLLM в lockfile при установке; перед реализацией адаптера сверить точное имя модели с установленным `prebuiltAppConfig.model_list`. Если выбранной сборки нет, остановить только модельный шаг и выбрать поддерживаемую сборку после проверки качества; поиск уже должен оставаться готовым.
- Не трогать пользовательское удаление `packages/core/src/behaviors/.keep`.

## Review Focus

1. Утечка внутренних или будущих сведений: тест проверяет точный набор ID индекса и отсутствие содержимого `docs/plan.md`, `docs/architecture.md` и черновиков; сборщик читает только `pages.json`.
2. Битые источники: сборка отвергает повтор ID, пустой текст и ссылку на несуществующий раздел; браузерный тест проверяет переход к якорю.
3. Ложные ответы: поиск не вызывает модель при отсутствии подходящего раздела; ссылки строятся только по ID из найденной выдачи; неизвестные ID в ответе отвергаются.
4. Срыв модельного шага: тесты UI охватывают WebGPU unavailable, ошибку загрузки, отмену и устаревший результат; результаты поиска остаются видимыми.
5. Сборка и размещение: `pnpm docs:build` создаёт `apps/docs/dist/index.html` и `search-index.json`, а браузер получает их по относительным путям; в `dist` нет весов модели.

---

### Task 1: Минимальный сайт и публичный корпус

**Files:**
- Create: `apps/docs/package.json`, `apps/docs/index.html`, `apps/docs/tsconfig.json`, `apps/docs/vite.config.ts`
- Create: `apps/docs/src/main.tsx`, `apps/docs/src/App.tsx`, `apps/docs/src/styles.css`, `apps/docs/src/content/pages.json`, `apps/docs/src/content/types.ts`
- Modify: root `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`
- Test: `apps/docs/tests/content.test.ts`

**Interfaces:**
- Consumes: действующие публичные описания в `docs/components/*.md`, `docs/actions.md` и публичные экспорты `@dreadnought/*` как редакционный материал, без runtime-импорта внутренних исходников.
- Produces: `PublishedCorpus { version: string; pages: PublishedPage[] }`, `PublishedPage { id: string; title: string; sections: PublishedSection[] }`, `PublishedSection { id: string; heading: string; text: string; code: string[]; keywords: string[] }`. Все `section.id` глобально уникальны; ссылки имеют вид `/#<section.id>`.

- [ ] **Step 1: Написать тест границы корпуса.** Расширить `vitest.config.ts` включением `apps/docs/tests/**/*.test.{ts,tsx}`. Тест загружает `pages.json`, проверяет непустую версию, уникальность ID, непустые `text`, соответствие страниц текущему публичному API и явный список разделов Button, Input, TextArea, Card, Tabs, Badge, Mark, Icon, темы и общих действий. Отдельно проверяет, что тексты не содержат терминов из планируемых компонентов и ссылок на `docs/plan.md`/`docs/architecture.md`. Запустить `pnpm exec vitest run apps/docs/tests/content.test.ts`; до создания корпуса ожидается RED.
- [ ] **Step 2: Создать приложение и корпус.** `apps/docs/package.json`: `name: "@dreadnought/docs"`, `private: true`, `type: "module"`, scripts `dev: "vite"`, `build: "vite build"`, `typecheck: "tsc -p tsconfig.json --noEmit"`; React/Vite/TypeScript версии брать из корневых зависимостей. Заполнить `pages.json` только уже готовыми публичными примерами и свойствами из перечисленных руководств, руками сверяя импорты с exports пакетов. Заголовки и описание каждого раздела идут в тот же объект, который будет показан пользователю. `App.tsx` отображает оглавление и каждый раздел как `<section id={section.id}>`, текст и код — обычными React-элементами с экранированием, без `dangerouslySetInnerHTML`.
- [ ] **Step 3: Подключить команды и проверить.** Добавить `docs:dev`, `docs:build` в корень; `docs:build` вызывает `pnpm --filter @dreadnought/docs build`. Запустить `pnpm install`, focused test, `pnpm --filter @dreadnought/docs typecheck`, `pnpm docs:build`. Открыть локальную страницу и проверить переходы по якорям. Убедиться, что другие пакеты не получили зависимостей.
- [ ] **Step 4: Коммит.** Зафиксировать только файлы Task 1 как `feat: add published documentation site`.

### Task 2: Сборочный индекс с проверкой публикации

**Files:**
- Create: `apps/docs/scripts/build-index.mjs`, `apps/docs/src/search/types.ts`, `apps/docs/tests/index.test.ts`
- Modify: `apps/docs/package.json`, `.gitignore`

**Interfaces:**
- Consumes: `PublishedCorpus` из `pages.json`.
- Produces: `apps/docs/public/search-index.json` при сборке. Формат `SearchIndex { version: string; entries: SearchEntry[] }`, `SearchEntry { id: string; title: string; url: string; section: string; version: string; text: string; code: string }`. `url` — только `/#<id>`; `code` соединяет целые примеры, не режет их посередине.

- [ ] **Step 1: Написать тесты сборщика.** Вызвать экспортированную чистую `buildIndex(corpus)` и проверить сохранение всех опубликованных разделов, версии и полного кода; уникальность ID; `url` указывает на существующий `section.id`; дубликат ID, пустой текст или пустой заголовок вызывают ошибку. Проверить, что список ID точно равен разделам `pages.json` и не расширяется от наличия файлов в `docs/`. Запустить тест и получить RED.
- [ ] **Step 2: Реализовать сборщик.** Скрипт читает ровно `apps/docs/src/content/pages.json`, валидирует поля и пишет `apps/docs/public/search-index.json`; никаких glob по репозиторию. В `apps/docs/package.json` сделать `build: "node scripts/build-index.mjs && vite build"`, а для dev отдельный `predev` с тем же скриптом. Игнорировать только сгенерированный `apps/docs/public/search-index.json` и `apps/docs/dist/`. Добавить в тест проверку, что сборка не меняет другие файлы.
- [ ] **Step 3: Проверить результат и коммит.** Запустить focused test, `pnpm docs:build`, открыть `apps/docs/dist/search-index.json` и сопоставить ID с разделами страницы. Зафиксировать Task 2 как `feat: build search index from published docs`.

### Task 3: Локальный поиск и выдача ссылок

**Files:**
- Create: `apps/docs/src/search/search.ts`, `apps/docs/src/search/loadIndex.ts`, `apps/docs/tests/search.test.ts`
- Modify: `apps/docs/src/App.tsx`, `apps/docs/src/styles.css`

**Interfaces:**
- Consumes: `SearchIndex`, поисковый запрос.
- Produces: `searchDocs(query: string, entries: SearchEntry[], limit = 5): SearchHit[]`, где `SearchHit { entry: SearchEntry; score: number }`; `loadIndex(): Promise<SearchIndex>` загружает `${import.meta.env.BASE_URL}search-index.json` и проверяет базовую форму/версию.

- [ ] **Step 1: Написать проверочные вопросы.** Тесты на русском и английском для Button, показа пароля в Input, Tabs, темы и `copy`; точные имена API и импортов получают больший вес, чем общий текст. Запросы о неописанном компоненте и пустая строка дают пустой результат. Повторный поиск при тех же данных даёт тот же порядок; отсутствие WebGPU никак не влияет на функцию. Получить RED.
- [ ] **Step 2: Реализовать ранжирование.** Нормализовать регистр, пробелы и пунктуацию, сохранить точные токены API и путей импорта; дать веса `title`/`section`/`code`/`text`, порог релевантности и ограничение до пяти. Не подставлять результат при нулевом совпадении только ради ответа. Загрузку индекса кэшировать в пределах вкладки, сбой показывать отдельно от пустой выдачи.
- [ ] **Step 3: Добавить поиск в UI.** Поле вопроса, кнопка поиска, список результатов с заголовком, коротким фрагментом и настоящей ссылкой на якорь. Поиск не требует WebGPU и показывается до добавления модели. Добавить `apps/docs/tests/App.search.test.tsx` с проверкой ввода, отсутствия результатов и перехода по ссылке.
- [ ] **Step 4: Проверить и коммит.** Запустить focused tests, `pnpm docs:build`, `pnpm --filter @dreadnought/docs typecheck`; вручную пройти набор вопросов. Зафиксировать Task 3 как `feat: add documentation search`.

### Task 4: Браузерная модель, явный запуск и отмена

**Files:**
- Create: `apps/docs/src/assistant/worker.ts`, `apps/docs/src/assistant/engine.ts`, `apps/docs/src/assistant/prompt.ts`, `apps/docs/tests/assistant.test.ts`
- Modify: `apps/docs/package.json`, `pnpm-lock.yaml`, `apps/docs/src/App.tsx`, `apps/docs/src/styles.css`

**Interfaces:**
- Consumes: вопрос и до пяти `SearchHit`; только при непустой выдаче и клике «Сформировать ответ».
- Produces: `createAssistantEngine(onProgress): Promise<AssistantEngine>` с методами `answer(question, hits): Promise<string>` и `cancel(): Promise<void>`; `buildPrompt(question, hits)` включает тексты, код, `id` и команду отвечать только на основании них; состояние UI: ready/loading/generating/error/cancelled.

- [ ] **Step 1: Написать тесты без загрузки весов.** Подставить фальшивый `AssistantEngine`: запуск только после клика; при пустой выдаче запуск запрещён; прогресс виден; ошибка WebGPU/сети оставляет ссылки; отмена загрузки и генерации не показывает запоздалый ответ; следующий вопрос работает. `buildPrompt` не включает никакие разделы вне переданных hits. Получить RED.
- [ ] **Step 2: Установить и подключить WebLLM.** Зафиксировать версию `@mlc-ai/web-llm`; проверить `Qwen3-1.7B-q4f16_1-MLC` в установленном реестре. Создать `WebWorkerMLCEngineHandler` в worker и `CreateWebWorkerMLCEngine(new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }), modelId, { initProgressCallback })` в адаптере. Импорт WebLLM сделать динамическим после явного клика; `navigator.gpu` проверить до запуска. Ограничить длину ответа, контекст и температуру; при ответе использовать сообщения system/user с жёстким указанием на источники и маркеры `[[id]]`.
- [ ] **Step 3: Отмена и ошибки.** Во время генерации вызывать `interruptGenerate()`, при отмене загрузки завершать worker и сбрасывать создание движка. Guard по номеру запроса не допускает старый ответ после смены вопроса или отмены. Если не хватает памяти, WebGPU отсутствует или модель не скачалась, показывать понятный текст и прежнюю выдачу. После отмены поисковый UI остаётся активным.
- [ ] **Step 4: Проверить и коммит.** Запустить focused tests, typecheck и build. В браузере с WebGPU проверить реальный первый ответ и отмену; без WebGPU проверить поисковую выдачу. Зафиксировать Task 4 как `feat: add opt-in browser RAG assistant`.

### Task 5: Проверяемые источники и выпуск статического артефакта

**Files:**
- Create: `apps/docs/src/assistant/citations.ts`, `apps/docs/tests/citations.test.ts`, `apps/docs/tests/published-questions.test.ts`
- Modify: `apps/docs/src/App.tsx`, `apps/docs/src/styles.css`, `apps/docs/README.md`

**Interfaces:**
- Consumes: сырой ответ модели и текущие `SearchHit`.
- Produces: `parseCitedAnswer(raw: string, hits: SearchHit[]): { text: string; sources: SearchEntry[] } | null`. Допускаются только маркеры `[[id]]` из текущей выдачи; UI строит URL из `SearchEntry`, а не из текста модели.

- [ ] **Step 1: Написать тесты цитирования.** Валидные ID превращаются в ссылки на опубликованные якоря; неизвестный ID, URL модели без ID и ответ без проверяемых источников дают `null` и поиск вместо уверенного ответа. Повтор источника сворачивается. Строки HTML и markdown от модели отображаются как текст и не выполняются. Получить RED.
- [ ] **Step 2: Реализовать вывод ответа.** Разбирать `[[id]]`, показывать короткий ответ и список подтверждённых разделов. При невалидном ответе сообщать, что подтверждения не хватает, и оставлять найденные ссылки. В UI перед первой загрузкой сообщать о скачивании большой модели и зависимости от WebGPU; историю держать только в React state текущей вкладки.
- [ ] **Step 3: Проверить корпус на реальных вопросах.** `published-questions.test.ts` проверяет релевантность top-3 для Button, Input/password, Tabs, темы, действий на русском и английском и отсутствие выдачи для заведомо неописанных API. Для генерации вручную проверить факты, публичные импорты и ссылки, а также вопросы о будущих компонентах. Подстроить веса поиска или редакционный текст разделов, не ослабляя запрет на внутренние материалы.
- [ ] **Step 4: Документировать выпуск.** `README.md` содержит локальные команды, правило «добавить раздел → проверить публичный API → пересобрать сайт и индекс вместе», проверку версии, браузерные ограничения и инструкцию размещения готовой сборки. Для Timeweb Cloud использовать режим frontend-приложения с командой сборки из корня монорепозитория `pnpm install --frozen-lockfile && pnpm docs:build` и директорией сборки `apps/docs/dist`; проверить эти значения в панели перед публикацией. Никакой покупки или деплоя в рамках плана.
- [ ] **Step 5: Итоговая проверка и коммит.** `pnpm test`, `pnpm typecheck`, `pnpm docs:build`; проверить `dist/index.html`, `dist/search-index.json`, URL якорей, отсутствие файлов весов в `dist` и отсутствие нового runtime-пакета у библиотеки. Прогнать в целевом браузере первый запуск, повтор из кэша, отказ WebGPU, сбой загрузки и отмену. Зафиксировать Task 5 как `docs: validate published browser RAG experience`.

## Sources checked for implementation

- [WebLLM worker usage and browser inference](https://github.com/mlc-ai/web-llm)
- [Timeweb Cloud frontend build settings](https://timeweb.cloud/docs/apps/deploying-frontend-apps)
