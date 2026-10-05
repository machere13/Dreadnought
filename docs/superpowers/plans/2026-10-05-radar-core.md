# Radar Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution or superpowers:subagent-driven-development if the user chooses delegation. Steps use checkbox syntax for tracking.

**Goal:** Предоставить независимую Radar-модель и её проверенный публичный контракт в каталоге/MCP.

**Architecture:** Одна чистая функция в core/domains/charts вычисляет оси и точки; index.ts публикуют её через существующий вход core. Каталог получает новую категорию domain без изменения старых категорий. React, DOM и отрисовка не входят в эту поставку.

**Tech Stack:** TypeScript, Math, Vitest, существующий каталог на Node.js и MCP/Zod; новых зависимостей нет.

**Spec:** `docs/superpowers/specs/2026-10-05-radar-core-design.md` — прочитать полностью перед выполнением.

## Global Constraints

- `buildRadarLayout({ metrics, series, radius })` импортируется из `@dreadnought/core`.
- Оси и точки идут в порядке metrics; серии — в порядке series.
- Центр находится в (0, 0), x направлен вправо, y вниз.
- Первая ось направлена вверх; следующие идут по часовой стрелке.
- Нет подстановки нулей, автоматического domain, скрытого clipping или пропуска невалидной серии.
- Новых зависимостей и изменений Table нет.
- Использовать Ponytail, не добавлять комментарии в компоненты, сохранять чужие изменения.
- Закоммитить каждый завершённый результат локально в main, без push.

## Review Focus

1. Диапазон [-Number.MAX_VALUE, Number.MAX_VALUE]: середина остаётся 0.5, координаты конечны.
2. Показатель с ID `__proto__` или `constructor`: своё значение допустимо, унаследованное отвергается.
3. Sparse-массивы показателей/серий: ошибка структуры, не пропущенные элементы результата.
4. Изменение domain результата: исходный domain не меняется; frozen-вход работает.
5. Новая категория domain проходит через генератор, загрузчик, CLI, фильтры и настоящий MCP-вызов; старые категории сохраняются.

## Карта файлов

Создать `packages/core/src/domains/charts/buildRadarLayout.ts` (типизированная модель), `charts/index.ts`, `domains/index.ts` (экспорты), `charts/catalog.json` (метаданные), `packages/core/tests/domains/charts/buildRadarLayout.test.ts`, `radar.types.ts`.

Изменить `packages/core/src/index.ts`, `tsconfig.type-tests.json`, `docs/core-capabilities.md`, `apps/docs/src/components/CustomComponentsGuide.tsx`.

Для публикации изменить `tools/catalog/src/config.mjs`, `generateCatalog.mjs`, `query/loadCatalog.mjs`, `query/parseArgs.mjs`, `query/selectEntries.mjs`, `query/executeQuery.mjs`, `mcp/server.mjs`. Расширить существующие `tools/catalog/tests/catalog.test.ts`, `querySelection.test.ts`, `mcpServer.test.ts`. Не создавать отдельный registry, движок или schema framework.

## Task 1: математическая модель и публичные типы

**Interfaces:** Produces `buildRadarLayout(options: RadarLayoutOptions): RadarLayout`, `RadarMetric`, `RadarSeries`, `RadarLayoutOptions`, `RadarLayout`. Consumes только Math и стандартные операции JavaScript.

- [x] **Step 1: написать тест известной геометрии.** В новом тестовом файле импортировать функцию из core/src/index.ts; метрики readonly и frozen. Для первого запуска отсутствие экспорта должно дать ошибку; после добавления объявления тест обязан упасть на неверных координатах до реализации расчёта.

```ts
import { expect, it } from 'vitest';
import { buildRadarLayout } from '../../../src/index.ts';

const metrics = ['a', 'b', 'c', 'd'].map(id => ({
  id, label: id, domain: [0, 100] as const,
}));
it('places four axes clockwise from the top and preserves source values', () => {
  const result = buildRadarLayout({ metrics, radius: 100,
    series: [{ id: 's', label: 'S', values: { a: 100, b: 50, c: 0, d: 25 } }] });
  const axes = [[0, -100], [100, 0], [0, 100], [-100, 0]];
  result.axes.forEach((axis, index) => {
    expect(axis.x).toBeCloseTo(axes[index][0]);
    expect(axis.y).toBeCloseTo(axes[index][1]);
  });
  expect(result.seriesPoints[0].points.map(point => point.value)).toEqual([100, 50, 0, 25]);
  expect(result.seriesPoints[0].points.map(point => point.normalizedValue)).toEqual([1, 0.5, 0, 0.25]);
  expect(result.seriesPoints[0].points[1].x).toBeCloseTo(50);
  expect(result.seriesPoints[0].points[3].x).toBeCloseTo(-25);
});
```

Run: `node node_modules/vitest/vitest.mjs run packages/core/tests/domains/charts/buildRadarLayout.test.ts --reporter=dot`. Проверить RED, не считать ошибку разрешения импорта доказательством правильности математических assertions.

- [x] **Step 2: определить типы и реализовать минимальный расчёт после RED.** Все типы находятся рядом с функцией; массивы входа readonly.

```ts
export interface RadarMetric {
  id: string; label: string; domain: readonly [number, number]; reverse?: boolean;
}
export interface RadarSeries {
  id: string; label: string; values: Readonly<Record<string, number>>;
}
export interface RadarLayoutOptions {
  metrics: readonly RadarMetric[]; series: readonly RadarSeries[]; radius: number;
}
export interface RadarLayout {
  axes: Array<{ id: string; label: string; domain: [number, number]; reverse: boolean;
    angle: number; x: number; y: number }>;
  seriesPoints: Array<{ id: string; label: string; points: Array<{
    metricId: string; value: number; normalizedValue: number; x: number; y: number;
  }> }>;
}
```

Вычислять axis.angle и конец оси по формулам спецификации; domain копировать через `[min, max]`. Точки вычислять по осям, не обходить ключи values. Длину радиального вектора вычислять до умножения на sin/cos.

```ts
const span = max - min;
const t = Number.isFinite(span)
  ? (value - min) / span
  : (value / 2 - min / 2) / (max / 2 - min / 2);
const normalizedValue = reverse ? 1 - t : t;
const distance = radius * normalizedValue;
const point = { metricId: id, value, normalizedValue,
  x: distance * Math.cos(angle), y: distance * Math.sin(angle) };
```

Экспортировать через оба новых index.ts и существующий core/index.ts. Не добавлять package subpath. Повторить тест Step 1 до GREEN.

- [x] **Step 3: добавить RED-тесты границ и валидацию.** Применять проверки в точном порядке: структура options/массивов и конечный radius; radius > 0 и минимум три метрики; каждый показатель и его domain; уникальность ID; затем каждая серия, собственные значения и их диапазоны. Обход через Array.from или for-of должен обнаруживать holes, а не map/forEach с их пропуском.

```ts
it('normalizes an overflowing finite domain without losing its midpoint', () => {
  const extremes = ['a', 'b', 'c'].map(id => ({ id, label: '',
    domain: [-Number.MAX_VALUE, Number.MAX_VALUE] as const }));
  const result = buildRadarLayout({ metrics: extremes, radius: 10,
    series: [{ id: 's', label: '', values: { a: -Number.MAX_VALUE, b: 0, c: Number.MAX_VALUE } }] });
  expect(result.seriesPoints[0].points.map(point => point.normalizedValue)).toEqual([0, 0.5, 1]);
  expect(result.seriesPoints[0].points.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
});
it('does not accept inherited metric values', () => {
  const values = Object.create({ a: 50 });
  values.b = 50; values.c = 50; values.d = 50;
  expect(() => buildRadarLayout({ metrics, radius: 10,
    series: [{ id: 's', label: '', values }] })).toThrow(TypeError);
});
it('rejects a hole instead of silently omitting an axis', () => {
  const sparse = [...metrics]; delete sparse[1];
  expect(() => buildRadarLayout({ metrics: sparse, series: [], radius: 10 })).toThrow(TypeError);
});
```

Также конкретные fixtures: три оси радиуса 100 → `(0,-100)`, `(sqrt(3)*50,50)`, `(-sqrt(3)*50,50)`; domain [-10,10], value 5, reverse true → 0.25; пустые series → три оси и пустой seriesPoints. Для own-special-key использовать values из `JSON.parse('{"__proto__":50,"constructor":50,"c":50}')`, метрики с этими ID и domain [0,100]; ожидаются три значения 0.5.

Табличные invalid-fixtures проверяют классы ошибок: NaN/Infinity в radius/domain/value, строковые числа, null-объекты, неверные массивы, пустой ID, label не строка, reverse не boolean, domain не длины 2, missing/inherited value → TypeError; radius 0/-1, две метрики, duplicate metric/series ID, равный/обратный domain, value -1/101 при [0,100] → RangeError. Sparse series тоже вызывает TypeError. Массив вместо values — неверная структура.

Для граничных проверок использовать:

```ts
if (!Number.isFinite(radius)) throw new TypeError('Radar radius must be a finite number.');
if (radius <= 0) throw new RangeError('Radar radius must be positive.');
if (!Object.hasOwn(values, metric.id)) throw new TypeError('Missing Radar metric value.');
if (!Number.isFinite(value)) throw new TypeError('Radar value must be a finite number.');
if (value < min || value > max) throw new RangeError('Radar value is outside its domain.');
```

Проверки ID используют trim только для пустоты, Set — для точного сравнения; не нормализовать ID и не мутировать values. Повторять RED → минимальное исправление → GREEN для каждой новой ветки.

- [x] **Step 4: проверить отсутствие мутации, порядок и публичные типы.** Frozen-метрики, domains, values и series не вызывают ошибку. Перестановка метрик задаёт новый порядок осей/точек; лишний ключ values ничего не добавляет. После изменения `result.axes[0].domain[0]` вход остаётся прежним.

```ts
const original = metrics[0].domain[0];
const model = buildRadarLayout({ metrics, series: [], radius: 1 });
model.axes[0].domain[0] = -100;
expect(metrics[0].domain[0]).toBe(original);
```

В `radar.types.ts` импортировать четыре публичных типа и функцию из `@dreadnought/core`, вызвать с readonly literals; добавить файл в tsconfig.type-tests.json. Проверить отрицательные type-cases domain из трёх чисел, reverse строка, values строка через `@ts-expect-error` в type-test, не в компоненте.

- [x] **Step 5: проверки и коммит.** Выполнить targeted tests, `pnpm --filter @dreadnought/core build`, `pnpm typecheck`; прочитать результат. Commit: `feat(core): add pure Radar layout model`. Новые тесты должны проверять результаты, не текст функции.

## Task 2: публикация домена через каталог и MCP

**Interfaces:** Consumes публичный экспорт Task 1; produces entry `domain:build-radar-layout`, kind `domain`, family `Charts`, binding `core`, layer 1, framework null, importPath `@dreadnought/core`.

- [x] **Step 1: RED-тест публикации.** В существующем catalog.test.ts, где catalog строится из настоящих metadata, добавить:

```ts
it('publishes the pure Radar domain with a checked core example', () => {
  const entry = catalog.entries.find(entry => entry.id === 'domain:build-radar-layout');
  expect(entry).toMatchObject({ kind: 'domain', name: 'buildRadarLayout', family: 'Charts' });
  expect(entry.bindings[0]).toMatchObject({ id: 'core', layer: 1, framework: null,
    importPath: '@dreadnought/core', exportName: 'buildRadarLayout' });
  expect(() => checkExamples(context, entry.bindings[0].examples)).not.toThrow();
});
```

Run: `node node_modules/vitest/vitest.mjs run tools/catalog/tests/catalog.test.ts --reporter=dot`. Ожидается отсутствующая entry, затем RED от неподдержанного kind после появления metadata.

- [x] **Step 2: расширить существующий тракт kind и добавить metadata.** Добавить `'domain'` в разрешённые значения generateCatalog, loadCatalog, parseArgs, selectEntries, MCP listShape. Обновить CLI help и описания MCP без переименования tools. Добавить `packages/core/src/domains/charts/catalog.json` в capabilitySources, не автоматически сканировать все файлы.

```json
[
  {
    "id": "domain:build-radar-layout",
    "kind": "domain",
    "name": "buildRadarLayout",
    "family": "Charts",
    "description": "Чистая модель осей и точек Radar с явными диапазонами; без renderer и фреймворка.",
    "docsUrl": "/custom-components/#core-radar",
    "constraints": ["Минимум три показателя; уникальные непустые ID. Конечные domain min < max и radius > 0. Для каждого показателя нужно собственное конечное значение внутри domain. Нет clipping или подстановки нуля. reverse меняет направление нормализации. Оси идут по часовой стрелке от верха; центр (0,0), y вниз. Пустые series допустимы. TypeError для структуры/типов/missing/nonfinite; RangeError для числовых границ/числа осей/duplicate ID. Вход не меняется, выход не ссылается на его изменяемые структуры."],
    "bindings": [{
      "id": "core", "layer": 1, "framework": null,
      "importPath": "@dreadnought/core", "exportName": "buildRadarLayout",
      "examples": [{"id": "usage", "code": "import { buildRadarLayout } from '@dreadnought/core';\nconst layout = buildRadarLayout({ radius: 100, metrics: ['quality', 'coverage', 'latency'].map(id => ({ id, label: id, domain: [0, 100] as const })), series: [{ id: 'a', label: 'A', values: { quality: 80, coverage: 70, latency: 60 } }] });\nconst points = layout.seriesPoints[0].points.map(point => [point.x, point.y]);"}]
    }]
  }
]
```

Добавить реальный раздел `id="core-radar"` в `apps/docs/src/components/CustomComponentsGuide.tsx` с этим примером и пояснением координат/ошибок, используя существующую структуру соседнего раздела core-stepped-value. В docs/core-capabilities.md отметить Radar как реализованную модель, не готовый компонент.

- [x] **Step 3: RED-тесты полной цепочки запросов.** В querySelection.test.ts добавить domain fixture с полной структурой существующего makeCatalog, core binding, constraints и примером из metadata. После validateCatalog проверить:

```ts
expect(parseArgs(['list', '--kind', 'domain']).options.kind).toBe('domain');
expect(selectEntries(catalog, { kind: 'domain' }).items.map(entry => entry.name)).toEqual(['buildRadarLayout']);
expect(getEntry(catalog, 'domain:build-radar-layout').kind).toBe('domain');
expect(getContext(catalog, { components: ['buildRadarLayout'], layer: 1, maxBytes: 4096 }).items[0])
  .toMatchObject({ kind: 'domain', binding: { importPath: '@dreadnought/core' } });
expect(selectEntries(catalog, { kind: 'component' }).items.map(entry => entry.name)).toEqual(['Button']);
```

В mcpServer.test.ts использовать существующий transport/client fixture, добавить domain entry и установить core package в fixture. Вызвать реальный `client.callTool({ name: 'dreadnought_list', arguments: { kind: 'domain' } })`; replyPayload должен вернуть buildRadarLayout. Через dreadnought_get с binding core/section api получить options и returnType; через dreadnought_context — checked example и constraints. Неподдержанный kind по-прежнему отклоняется. Не тестировать лишь совпадение строки enum в исходнике.

- [x] **Step 4: GREEN и финальный коммит.** Run targeted core/catalog tests, `pnpm typecheck`, `pnpm -r build`, полный `node node_modules/vitest/vitest.mjs run --reporter=dot`. Сборки документации выполнять последовательно, не запускать второй docs build параллельно первому. После сборки выполнить `node apps/docs/scripts/buildKnowledge.mjs --public`.

Проверить `git diff --check`, пройти review всего C1 по пяти Review Focus. Зафиксировать только свои исходники/документацию, не generated ignored artifacts. Commit: `feat(catalog): publish Radar domain through catalog and MCP`. Прежние component/action/behavior запросы должны проходить вместе с domain, без изменения schemaVersion ради одного нового допустимого значения.

## Execution Handoff

Рекомендуется native execution: два тесно связанных результата, небольшая чистая модель, проверяемый математический контракт и существующий каталог. Исполнитель делает оба шага сам, после чего отдельный reviewer проверяет итоговый diff. Subagent-driven execution доступен только по выбору пользователя. Реализация начинается после подтверждения плана и выбора метода.
