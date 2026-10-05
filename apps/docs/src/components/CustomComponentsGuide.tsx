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
      <p className={styles.bodyText}><code>getNavigationDirection(key, options)</code> превращает строку клавиши в previous, next, first или last. Посторонняя клавиша возвращает undefined. По умолчанию используются стрелки вверх/вниз и Home/End; горизонтальная ориентация использует стрелки влево/вправо.</p>
      <CodeBlock language="ts" copyLabels={copyLabels} code={`import { getNavigationDirection, getNextEnabledValue } from '@dreadnought/core';
const items = [{ value: 'copy' }, { value: 'save' }];
const direction = getNavigationDirection('ArrowRight', { orientation: 'horizontal' });
const next = direction === undefined
  ? undefined
  : getNextEnabledValue(items, 'copy', direction); // save`} />
      <p className={styles.footnote}>Для поискового поля передайте homeEnd: false: Home/End продолжат управлять текстовым курсором. События, их отмена, модификаторы, IME, RTL и перенос фокуса остаются в вашем адаптере. Tabs, Menu и Select уже используют это правило, сохраняя своё поведение и публичные пропсы.</p>
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
  </article>;
}
