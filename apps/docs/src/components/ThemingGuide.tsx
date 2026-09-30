import { Breadcrumb, Button, CodeBlock } from '@dreadnought/ui/react';
import styles from './DocsPage.module.css';

const copyLabels = { copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' };

const globalCode = `/* theme.css — подключите после стандартной темы */
:root {
  --dreadnought-spacing-x4: 1.25rem;
}`;

const componentCode = `/* theme.css — все Button в проекте */
:root {
  --dreadnought-button-padding-x: var(--dreadnought-spacing-x2);
}`;

const instanceCssCode = `/* SaveButton.module.css — одна кнопка */
.special {
  --dreadnought-button-padding-x: var(--dreadnought-spacing-x4);
}`;

const instanceTsxCode = `import { Button } from '@dreadnought/ui/react';
import styles from './SaveButton.module.css';

<Button className={styles.special}>Одна кнопка</Button>`;

const nestedCode = `import { Breadcrumb } from '@dreadnought/ui/react';
import styles from './Navigation.module.css';

<Breadcrumb items={items} slotClassNames={{ current: styles.current }} />`;

function TokenDemo() {
  return <div className={styles.demo}>
    <div className={styles.themeDemoScope}>
      <Button>Кнопка в области</Button>
      <Button variant="secondary">Другая кнопка</Button>
      <Button className={styles.special}>Одна кнопка</Button>
    </div>
    <p className={styles.demoResult}>В области изменён токен отступа Button; у последней кнопки он задан отдельно через className.</p>
  </div>;
}

export function ThemingGuide() {
  return <article className={styles.article}>
    <Breadcrumb items={[{ label: 'Документация', href: '/' }, { label: 'Тема и токены' }]} aria-label="Путь по документации" />
    <div className={styles.pageHeading}>
      <h1 className={styles.title}>Тема и токены</h1>
      <p className={styles.lead}>Настраивайте внешний вид на нужном уровне: общая роль дизайн-системы, токен компонента или один экземпляр.</p>
    </div>

    <section className={styles.section} aria-labelledby="token-chain">
      <h2 id="token-chain" className={styles.sectionTitle}>Как связаны значения</h2>
      <p className={styles.bodyText}>Глобальный <code>--dreadnought-spacing-x4</code> задаёт повторяемое значение. Токен <code>--dreadnought-button-padding-x</code> ссылается на него, а CSS-модуль Button читает токен компонента. Готовый импорт <code>@dreadnought/ui/react</code> уже подключает стандартные стили и тему.</p>
      <TokenDemo />
    </section>

    <section className={styles.section} aria-labelledby="global-tokens">
      <h2 id="global-tokens" className={styles.sectionTitle}>Общие токены</h2>
      <p className={styles.bodyText}>Меняйте значение в <code>:root</code>, если хотите обновить все места, которые используют эту роль. Подключите свой CSS-файл после стандартной темы; её повторно импортировать не нужно.</p>
      <CodeBlock code={globalCode} language="css" copyLabels={copyLabels} />
    </section>

    <section className={styles.section} aria-labelledby="component-tokens">
      <h2 id="component-tokens" className={styles.sectionTitle}>Токены компонента</h2>
      <p className={styles.bodyText}>Если отступ нужен другим только у всех кнопок, меняйте токен Button, а не общий <code>spacing-x4</code>. Компоненты, использующие общий токен, сохранят прежнее значение.</p>
      <CodeBlock code={componentCode} language="css" copyLabels={copyLabels} />
    </section>

    <section className={styles.section} aria-labelledby="instance-tokens">
      <h2 id="instance-tokens" className={styles.sectionTitle}>Один экземпляр</h2>
      <p className={styles.bodyText}>Передайте CSS Module через <code>className</code> и задайте токен на этой кнопке. Остальные кнопки не изменятся.</p>
      <div className={styles.startExamples}>
        <CodeBlock code={instanceCssCode} language="css" copyLabels={copyLabels} />
        <CodeBlock code={instanceTsxCode} language="tsx" copyLabels={copyLabels} />
      </div>
    </section>

    <section className={styles.section} aria-labelledby="non-token-styles">
      <h2 id="non-token-styles" className={styles.sectionTitle}>Если свойства нет среди токенов</h2>
      <p className={styles.bodyText}>Используйте свой класс без <code>!important</code>. Правила компонентов находятся в <code>@layer dreadnought</code>, поэтому обычный CSS вашего приложения может заменить отдельное свойство. Зачёркнутое правило библиотеки в DevTools в таком случае нормально.</p>
      <p className={styles.bodyText}>Для вложенной части используйте её публичный <code>className</code> или <code>slotClassNames</code>, если компонент их предоставляет. Не привязывайтесь к случайной DOM-вложенности или внутренним классам CSS Modules.</p>
      <CodeBlock code={nestedCode} language="tsx" copyLabels={copyLabels} />
      <p className={styles.footnote}>Нужна другая разметка или поведение? Возьмите неоформленный адаптер второго слоя. Примеры точек настройки есть на страницах <a href="/components/button/">Button</a> и <a href="/components/breadcrumb/">Breadcrumb</a>.</p>
    </section>
  </article>;
}
