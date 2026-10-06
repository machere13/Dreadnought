import { useState } from 'react';
import { copy, getButtonState, getSelectionValue } from '@dreadnought/core';
import { Breadcrumb, CodeBlock } from '@dreadnought/ui/react';
import styles from './DocsPage.module.css';
import { DisclosureDemo } from './DisclosureDemo.tsx';
import { disclosureCode } from './disclosureCode.ts';

const copyLabels = { copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' };

const customButtonCode = `import { useState } from 'react';
import { copy, getButtonState } from '@dreadnought/core';
import styles from './CopyValue.module.css';

export function CopyValue({ value }: { value: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const state = getButtonState({ loading });

  async function handleClick() {
    if (state.actionBlocked) return;
    setLoading(true);
    try {
      await copy(value);
      setMessage('Скопировано');
    } catch {
      setMessage('Не удалось скопировать');
    } finally {
      setLoading(false);
    }
  }

  return <>
    <button type="button" className={styles.button}
      disabled={state.disabled}
      aria-disabled={state.ariaDisabled || undefined}
      aria-busy={state.busy || undefined}
      onClick={handleClick}>
      Скопировать значение
    </button>
    <span role="status">{message}</span>
  </>;
}`;

const otherActionsCode = `import { download, pickFiles, readClipboard } from '@dreadnought/core';

const files = await pickFiles({ accept: 'image/*', multiple: true });
const text = await readClipboard();
download(new Blob([text], { type: 'text/plain' }), 'note.txt');`;

function CoreDemo() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const state = getButtonState({ loading });

  async function handleClick() {
    if (state.actionBlocked) return;
    setLoading(true);
    try {
      await copy('Dreadnought');
      setMessage('Скопировано: Dreadnought');
    } catch {
      setMessage('Не удалось скопировать');
    } finally {
      setLoading(false);
    }
  }

  return <div className={styles.demo}>
    <div className={styles.demoRow}>
      <button type="button" className={styles.coreDemoButton}
        disabled={state.disabled}
        aria-disabled={state.ariaDisabled || undefined}
        aria-busy={state.busy || undefined}
        onClick={handleClick}>
        Скопировать значение
      </button>
      <span role="status" className={styles.demoResult}>{message}</span>
    </div>
  </div>;
}

const choices = [{ value: 'news', label: 'Новости' }, { value: 'updates', label: 'Обновления' }, { value: 'archive', label: 'Архив', disabled: true }];
const selectionCode = `import { useState } from 'react';
import { getSelectionValue } from '@dreadnought/core';

export function TopicPicker() {
  const [selected, setSelected] = useState<string[]>([]);
  return <div role="group" aria-label="Темы">
    {['Новости', 'Обновления'].map(topic =>
      <button key={topic} type="button" aria-pressed={selected.includes(topic)}
        onClick={() => setSelected(current =>
          getSelectionValue(current, { type: 'toggle', value: topic }))}>
        {topic}
      </button>)}
  </div>;
}`;

function SelectionDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  return <div className={styles.demo}>
    <div role="group" aria-label="Темы" className={styles.demoRow}>
      {choices.map(choice => <button key={choice.value} type="button" className={styles.coreDemoButton}
        aria-pressed={selected.includes(choice.value)} disabled={choice.disabled}
        onClick={() => setSelected(current => getSelectionValue(current,
          { type: 'toggle', value: choice.value }, { disabledValues: ['archive'] }))}>
        {choice.label}
      </button>)}
    </div>
    <p role="status" className={styles.demoResult}>Выбрано: {choices.filter(choice => selected.includes(choice.value)).map(choice => choice.label).join(', ') || 'ничего'}</p>
  </div>;
}

export function CustomComponentsGuide() {
  return <article className={styles.article}>
    <Breadcrumb items={[{ label: 'Документация', href: '/' }, { label: 'Свой компонент' }]} aria-label="Путь по документации" />
    <div className={styles.pageHeading}>
      <h1 className={styles.title}>Свой компонент из core</h1>
      <p className={styles.lead}>Если готового компонента нет или нужна своя разметка, возьмите из ядра отдельные правила и действия. Оно не привязано к React и не рисует интерфейс за вас.</p>
    </div>

    <section data-knowledge className={styles.section} aria-labelledby="core-parts">
      <h2 id="core-parts" className={styles.sectionTitle}>Что берём из ядра, а что пишем сами</h2>
      <p className={styles.bodyText}><code>getButtonState</code> вычисляет, когда действие заблокировано и какие признаки состояния нужны кнопке. <code>copy</code> выполняет само копирование. JSX, CSS Module, текст результата и обработка ошибки принадлежат вашему компоненту.</p>
      <p className={styles.bodyText}>Так можно сочетать возможности ядра с собственной структурой, не импортируя готовый Button или React-адаптер. Если разметка стандартной кнопки подходит, начните с <a href="/components/button/">Button</a> или <code>ButtonAdapter</code> — к ядру стоит спускаться, когда действительно нужна своя реализация.</p>
    </section>

    <section data-knowledge className={styles.section} aria-labelledby="core-example">
      <h2 id="core-example" className={styles.sectionTitle}>Пример: собственная кнопка копирования</h2>
      <p className={styles.bodyText}>Ниже обычная кнопка приложения: её поведение собрано из двух экспортов <code>@dreadnought/core</code>, а оформление остаётся в вашем CSS Module.</p>
      <CoreDemo />
      <div className={styles.startExamples}><CodeBlock code={customButtonCode} language="tsx" copyLabels={copyLabels} /></div>
      <p className={styles.footnote}>Для буфера обмена нужен защищённый контекст: HTTPS или localhost. Ошибка доступа не скрывается ядром — покажите её пользователю, как в примере.</p>
    </section>

    <section data-knowledge className={styles.section} aria-labelledby="other-actions">
      <h2 id="other-actions" className={styles.sectionTitle}>Другие самостоятельные действия</h2>
      <p className={styles.bodyText}><code>pickFiles</code> открывает выбор файлов, <code>readClipboard</code> читает текст из буфера, <code>download</code> запускает скачивание Blob. Эти функции не требуют компонента библиотеки и не управляют его визуальным состоянием.</p>
      <CodeBlock code={otherActionsCode} language="ts" copyLabels={copyLabels} />
      <p className={styles.footnote}>Выбор файлов и чтение буфера вызывайте в ответ на действие пользователя. <code>download</code> не загружает данные с сервера: Blob нужно подготовить самостоятельно.</p>
    </section>
    <section data-knowledge className={styles.section} aria-labelledby="core-keyboard">
      <h2 id="core-keyboard" className={styles.sectionTitle}>Клавиши и направление навигации</h2>
      <p className={styles.bodyText}><code>getComboboxKeyAction(key, {'{ open, searchable?, openOnEnter? }'})</code> определяет действие Combobox: open, close, select или navigate. Результат содержит preventDefault, но не вызывает его. Escape закрывает открытый список, Tab закрывает без отмены перехода фокуса, Enter открывает или выбирает. В поисковом режиме Space и Home/End остаются текстовому вводу; в непоисковом Space активирует, Home/End навигируют. По умолчанию searchable и openOnEnter — true; openOnEnter: false оставляет Enter закрытого поля форме. Проверки disabled, отмены события и IME, выполнение действия и фокус остаются вашему адаптеру.</p>
      <p className={styles.bodyText}><code>getNavigationDirection(key, options)</code> превращает строку клавиши в previous, next, first или last. Посторонняя клавиша возвращает undefined. По умолчанию используются стрелки вверх/вниз и Home/End; горизонтальная ориентация использует стрелки влево/вправо.</p>
      <CodeBlock language="ts" copyLabels={copyLabels} code={`import { getNavigationDirection, getNextEnabledValue } from '@dreadnought/core';
const items = [{ value: 'copy' }, { value: 'save' }];
const direction = getNavigationDirection('ArrowRight', { orientation: 'horizontal' });
const next = direction === undefined
  ? undefined
  : getNextEnabledValue(items, 'copy', direction); // save`} />
      <p className={styles.footnote}>Для поискового поля передайте homeEnd: false: Home/End продолжат управлять текстовым курсором. События, их отмена, модификаторы, IME, RTL и перенос фокуса остаются в вашем адаптере. Tabs, Menu и Select уже используют это правило, сохраняя своё поведение и публичные пропсы.</p>
    </section>
    <section data-knowledge className={styles.section} aria-labelledby="core-stepped-value">
      <h2 id="core-stepped-value" className={styles.sectionTitle}>Числовое значение с шагом и границами</h2>
      <p className={styles.bodyText}><code>getSteppedValue(value, {'{ min, max, step? }'})</code> выбирает ближайшую точку сетки от min, не выходя за max. Step по умолчанию 1; при равном расстоянии выбирается большая точка. Если max не кратен шагу от min, верхняя доступная точка будет ниже max.</p>
      <CodeBlock language="ts" copyLabels={copyLabels} code={`import { getSteppedValue } from '@dreadnought/core';
const grid = { min: 1, max: 6, step: 2 };
const value = getSteppedValue(4, grid);
const next = getSteppedValue(value + grid.step, grid);
const last = getSteppedValue(grid.max, grid);`} />
      <p className={styles.footnote}>Все входы должны быть конечными числами; min ≤ max, step &gt; 0. Нечисловой или бесконечный вход вызывает TypeError, неверная сетка — RangeError. Функция нормализует переданного кандидата, а не обрабатывает события. Координаты, клавиатура, disabled, ARIA, форма и хранение состояния остаются вашему адаптеру. Это number, не денежная модель с произвольной точностью.</p>
    </section>
    <section data-knowledge className={styles.section} aria-labelledby="core-radar">
      <h2 id="core-radar" className={styles.sectionTitle}>Модель Radar без отрисовки</h2>
      <p className={styles.bodyText}><code>buildRadarLayout({'{ metrics, series, radius }'})</code> вычисляет оси и точки серий. Каждому показателю задайте ID, подпись и диапазон domain; значения серии связываются с ID. Это доменная модель core, не готовый RadarChart.</p>
      <CodeBlock language="ts" copyLabels={copyLabels} code={`import { buildRadarLayout } from '@dreadnought/core';
const layout = buildRadarLayout({ radius: 100, metrics: ['quality', 'coverage', 'latency'].map(id => ({ id, label: id, domain: [0, 100] as const })), series: [{ id: 'a', label: 'A', values: { quality: 80, coverage: 70, latency: 60 } }] });
const points = layout.seriesPoints[0].points.map(point => [point.x, point.y]);`} />
      <p className={styles.footnote}>Минимум три показателя. Оси идут по часовой стрелке от верха, в порядке metrics; angle — в радианах. Центр (0,0), x вправо, y вниз. Нормализация от 0 до 1; reverse разворачивает шкалу. ID непустые и уникальные отдельно у показателей и серий; пустые подписи и series допустимы. Domain содержит два конечных числа min &lt; max, radius конечный и &gt; 0. Каждое значение должно быть собственным конечным числом внутри domain; лишние ключи игнорируются. Пропущенные значения не заменяются нулём и не обрезаются. TypeError означает неверную структуру, тип или отсутствующее/неконечное значение; RangeError — неверные границы, мало осей, повтор ID или выход за domain. Вход не меняется. SVG, размеры контейнера, подписи, стили и доступность обеспечивает адаптер.</p>
    </section>
    <section data-knowledge className={styles.section} aria-labelledby="core-typeahead">
      <h2 id="core-typeahead" className={styles.sectionTitle}>Переход по набранным буквам</h2>
      <p className={styles.bodyText}><code>getTypeaheadValue(items, currentValue, query, options)</code> возвращает ключ доступного пункта по началу названия. Передайте пункты со строковыми value и text. Отключённые пункты пропускаются; регистр и пробелы по краям не учитываются. Пустой запрос или отсутствие совпадения возвращает undefined.</p>
      <CodeBlock language="ts" copyLabels={copyLabels} code={`import { getTypeaheadValue } from '@dreadnought/core';
const items = [
  { value: 'news', text: 'Новости' },
  { value: 'settings', text: 'Настройки' },
];
const next = getTypeaheadValue(items, 'news', 'на'); // settings
const refined = getTypeaheadValue(items, 'settings', 'наст', { includeCurrent: true });`} />
      <p className={styles.footnote}>По умолчанию поиск начинается после текущего пункта и идёт по кругу; includeCurrent начинает с текущего пункта при уточнении запроса. Ядро не хранит набранный текст и не переносит фокус. Готовый <a href="/components/menu/">Menu</a> уже связывает поиск с клавиатурой: повтор одной буквы перебирает совпадения, пауза больше 500 мс сбрасывает запрос. Само действие не запускается.</p>
    </section>
    <section data-knowledge className={styles.section} aria-labelledby="core-selection">
      <h2 id="core-selection" className={styles.sectionTitle}>Своя разметка выбора</h2>
      <p className={styles.bodyText}><code>getSelectionValue(current, action, options)</code> возвращает новое значение без изменения исходного. Строка, число или null означают одиночный выбор, массив — множественный. Действия: select, deselect, toggle и clear.</p>
      <SelectionDemo />
      <div className={styles.startExamples}><CodeBlock code={selectionCode} language="tsx" copyLabels={copyLabels} /></div>
      <p className={styles.footnote}><code>disabled</code> блокирует изменение целиком, <code>disabledValues</code> запрещает менять указанные пункты и сохраняет их при clear, <code>required</code> не позволяет снять последний выбранный пункт. Пустое начальное значение допустимо: функция не выбирает за пользователя. Семантику, клавиатуру, фокус и хранение состояния обеспечивает ваш компонент.</p>
    </section>
    <section data-knowledge className={styles.section} aria-labelledby="core-disclosure">
      <h2 id="core-disclosure" className={styles.sectionTitle}>Своя раскрывающаяся секция</h2>
      <p className={styles.bodyText}><code>getDisclosureState</code> связывает кнопку и панель через ARIA и hidden. <code>getDisclosureOpen</code> вычисляет open, close или toggle; disabled блокирует запрос, но не закрывает уже открытую секцию. Внешний владелец может изменить open независимо от disabled.</p>
      <DisclosureDemo />
      <div className={styles.startExamples}><CodeBlock code={disclosureCode} language="tsx" copyLabels={copyLabels} /></div>
      <p className={styles.footnote}>ID задаёт владелец: непустые, разные, без ASCII-пробелов и уникальные на странице. В React useId подходит для нескольких экземпляров. Хранение состояния, отмена клика, DOM и фокус остаются в компоненте. Нативная кнопка сама поддерживает Enter/Space; при закрытии возвращаем фокус только из панели, не перехватывая внешний. Отключённую кнопку не включаем ради фокуса. Содержимое остаётся mounted. Это раскрытие секции, не готовый popup.</p>
    </section>
    <section data-knowledge className={styles.section} aria-labelledby="core-markdown">
      <h2 id="core-markdown" className={styles.sectionTitle}>Команды Markdown без редактора</h2>
      <p className={styles.bodyText}><code>applyMarkdownCommand(document, command)</code> возвращает новый текст и выделение. Индексы start/end — полуоткрытый диапазон UTF-16, как у текстового поля. Исходный документ не меняется.</p>
      <CodeBlock language="ts" copyLabels={copyLabels} code={`import { applyMarkdownCommand } from '@dreadnought/core';
const document = { text: 'hello', selection: { start: 0, end: 5 } };
const result = applyMarkdownCommand(document, { type: 'bold' });`} />
      <p className={styles.bodyText}>Доступны bold, italic, strikethrough, inlineCode, codeBlock, comment, link, image, heading, quote, list, horizontalRule, table, indent, outdent, newLine, duplicateLines и moveLines. Для heading задайте level от 1 до 6; для list — style unordered, ordered или task; для moveLines — direction previous или next. Indent/outdent принимают size от 1 до 16, по умолчанию 2.</p>
      <p className={styles.footnote}>Команды сохраняют LF/CRLF и работают без DOM и React. История undo, клавиатура, фокус, восстановление выделения и отображение Markdown остаются адаптеру. Это не полный Markdown-парсер и не санитайзер ссылок: безопасное отображение контента должен обеспечивать рендерер.</p>
    </section>
    <section data-knowledge className={styles.section} aria-labelledby="markdown-editor-adapter">
      <h2 id="markdown-editor-adapter" className={styles.sectionTitle}>React-адаптер Markdown</h2>
      <p className={styles.bodyText}><code>MarkdownEditorAdapter</code> связывает команды core с textarea без стилей. Свою панель можно передать через renderToolbar; для собственной разметки используйте useMarkdownEditor из <code>@dreadnought/react/logic</code>.</p>
      <CodeBlock language="tsx" copyLabels={copyLabels} code={`import { MarkdownEditorAdapter } from '@dreadnought/react/unstyled';
export function Editor() {
  return <MarkdownEditorAdapter aria-label="Markdown" defaultValue="hello"
    renderToolbar={({ execute, disabled, readOnly }) =>
      <button type="button" disabled={disabled || readOnly}
        onClick={() => execute({ type: 'bold' })}>Bold</button>} />;
}`} />
      <p className={styles.footnote}>onValueChange получает строки после ввода и команд; onChange вызывается только для реального ввода. В controlled-режиме синхронно обновляйте value для восстановления курсора. CRLF/CR нормализуются в LF. Tab и Shift+Enter остаются нативными. Программные команды не гарантируют включения в нативную undo-историю; preview и история редактора не входят в этот этап.</p>
    </section>
  </article>;
}
