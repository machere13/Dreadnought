# Проверка core на кастомном Dialog

Дата: 2026-10-05.

Проба `packages/core/tests/probes/dialog/DialogProbe.tsx` — тестовая связка с фиксированным содержимым, не публичный Modal и не часть сборки core. Использует только публичный импорт `@dreadnought/core` и нативный `<dialog>`.

## Распределение ответственности

- Core: `getDisclosureOpen` вычисляет следующее состояние открытия; `getNextEnabledValue` выбирает следующий доступный ключ с круговым переходом.
- React-связка: хранит open, связывает cancel/close, задаёт начальный фокус, замыкает Tab/Shift+Tab на краях известных контролов и восстанавливает сохранённый opener при завершении эффекта, если он ещё в документе.
- Браузер: `showModal()` создаёт модальное окно в top layer и делает фон inert; `close()` завершает нативную модальность. Escape порождает cancel, а не дублируется отдельным keydown-обработчиком.

Внутренние переходы Tab нативные. На краях связка передаёт известную последовательность поля Name и кнопок Save/Close в behavior; disabled-кнопка исключается. Отменённый Tab, IME и Ctrl/Alt/Meta не перехватываются. preventCancel оставляет окно открытым. Поздний close от прошлого цикла игнорируется, если окно уже снова open. Нативное внешнее close синхронизирует React-состояние.

В этой композиции нового API core не потребовалось. Обёртка focus() сама по себе не решает жизненный цикл, поиск доступных элементов и порядок вложенных окон; создавать универсальный focus controller по одной пробе оснований нет.

## Проверки

```sh
node node_modules/vitest/vitest.mjs run packages/core/tests/probes/dialog/DialogProbe.test.tsx
node node_modules/vite/bin/vite.js packages/core/tests/probes/dialog --config packages/core/tests/probes/dialog/vite.config.ts --host 127.0.0.1 --port 4388 --strictPort
```

jsdom не реализует showModal/close. В тесте заменены только установка open и событие close: двойники не перемещают фокус и не моделируют inert, top layer или Escape. Проверки фокуса упражняют реальную связку, но не доказывают нативную модальность.

Дополнительно проверено в браузере Codex: начальный фокус Name; Tab → Save → Close → Name; Shift+Tab от Name → Close; Escape закрывает окно и возвращает фокус к Open dialog. Повторное открытие и закрытие кнопкой также проверены. Это ручная проверка одного браузера, не автоматический кросс-браузерный тест и не проверка скринридера.

## Границы

Это не универсальный focus trap для произвольных children. Список контролов фиксирован; скрытые динамические элементы, positive tabindex, shadow DOM, iframe, portal/popover внутри окна, вложенные модальные окна и альтернативный фокус после удаления opener не исследованы. Нет controlled API, формы сохранения данных, дизайна и закрытия кликом по backdrop. Удалённому opener фокус не возвращается; выбор альтернативной цели принадлежит владельцу сценария. Не добавляем эти возможности заранее без конкретной пробы.

Источники: [HTML Standard: dialog](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element), [WAI-ARIA APG: Modal Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
