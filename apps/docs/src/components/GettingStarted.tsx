import { Breadcrumb, CodeBlock } from '@dreadnought/ui/react';
import styles from './DocsPage.module.css';

const copyLabels = { copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' };

const setupCode = `pnpm install
pnpm build
pnpm docs`;

const readyCode = `import { Button } from '@dreadnought/ui/react';

export function SaveButton({ onSave }: { onSave: () => void }) {
  return <Button onClick={onSave}>Сохранить</Button>;
}`;

const adapterCode = `import { ButtonAdapter } from '@dreadnought/react/unstyled';
import styles from './SaveButton.module.css';

export function SaveButton({ onSave }: { onSave: () => void }) {
  return <ButtonAdapter className={styles.button} onClick={onSave}>Сохранить</ButtonAdapter>;
}`;

const coreCode = `import { getButtonState } from '@dreadnought/core';

export function SaveButton({ onSave, disabled = false, loading = false }:
  { onSave: () => void; disabled?: boolean; loading?: boolean }) {
  const state = getButtonState({ disabled, loading });

  return <button type="button" disabled={state.disabled}
    aria-disabled={state.ariaDisabled || undefined}
    aria-busy={state.busy || undefined}
    onClick={() => { if (!state.actionBlocked) onSave(); }}>
    Сохранить
  </button>;
}`;

export function GettingStarted() {
  return <article className={styles.article}>
    <Breadcrumb items={[{ label: 'Документация', href: '/' }, { label: 'Начало работы' }]} aria-label="Путь по документации" />
    <div className={styles.pageHeading}>
      <h1 className={styles.title}>Начало работы</h1>
      <p className={styles.lead}>Запустите библиотеку локально и выберите, сколько готового поведения и оформления нужно вашему компоненту.</p>
    </div>

    <section className={styles.section} aria-labelledby="setup">
      <h2 id="setup" className={styles.sectionTitle}>Запуск в репозитории</h2>
      <p className={styles.bodyText}>Сейчас пакеты связаны внутри монорепозитория. Выполните команды из его корня; это не инструкция по установке опубликованного пакета из реестра.</p>
      <CodeBlock code={setupCode} language="sh" copyLabels={copyLabels} />
    </section>

    <section className={styles.section} aria-labelledby="three-layers">
      <h2 id="three-layers" className={styles.sectionTitle}>Одна кнопка — три слоя</h2>
      <p className={styles.bodyText}>Во всех примерах кнопка вызывает один и тот же <code>onSave</code>. Различается то, что библиотека берёт на себя.</p>
      <div className={styles.startExamples}>
        <div>
          <h3 className={styles.subheading}>Готовый компонент</h3>
          <p className={styles.bodyText}><code>@dreadnought/ui/react</code> подключает компонент, стили и стандартную тему. Дополнительный импорт CSS не нужен.</p>
          <CodeBlock code={readyCode} language="tsx" copyLabels={copyLabels} />
        </div>
        <div>
          <h3 className={styles.subheading}>Адаптер без оформления</h3>
          <p className={styles.bodyText}><code>@dreadnought/react/unstyled</code> сохраняет разметку и поведение; внешний вид задайте своим CSS Module.</p>
          <CodeBlock code={adapterCode} language="tsx" copyLabels={copyLabels} />
        </div>
        <div>
          <h3 className={styles.subheading}>Ядро и своя разметка</h3>
          <p className={styles.bodyText}><code>@dreadnought/core</code> вычисляет состояние без зависимости от React. Разметка, обработчик и стили в этом случае остаются вашей ответственностью.</p>
          <CodeBlock code={coreCode} language="tsx" copyLabels={copyLabels} />
        </div>
      </div>
      <p className={styles.footnote}>Если нужна собственная разметка именно в React, во втором слое также есть хук <code>useButton</code> из <code>@dreadnought/react/logic</code>. Подробности — в <a href="/components/button/">API Button</a>. Следующий шаг — <a href="/theming/">Настроить тему</a>.</p>
    </section>
  </article>;
}
