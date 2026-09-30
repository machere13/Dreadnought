import { useState } from 'react';
import { copy, getButtonState } from '@dreadnought/core';
import { Breadcrumb, CodeBlock } from '@dreadnought/ui/react';
import styles from './DocsPage.module.css';

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
  </article>;
}
