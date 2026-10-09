import { Breadcrumb, CodeBlock } from '@dreadnought/ui/react';
import type { ComponentSection } from '../app/navigation.ts';
import type { ComponentDoc } from './types.ts';
import { PageHeading } from './PageHeading.tsx';
import { ComponentOutline } from './ComponentOutline.tsx';
import { ApiTable, apiGroupId } from './ApiTable.tsx';
import styles from './Documentation.module.css';

const copyLabels = { copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' };

export function ComponentDocumentation({ component, doc }: { component: ComponentSection; doc: ComponentDoc }) {
  return <div className={styles.componentPage}>
    <ComponentOutline key={component} component={component} />
    <article className={styles.article}>
    <Breadcrumb items={[{ label: 'Документация', href: '/' }, { label: 'Компоненты' }, { label: doc.title }]} aria-label="Путь по документации" />
    <div data-knowledge id={`${component}-overview`} data-knowledge-title={doc.title}><PageHeading title={doc.title} description={doc.description} /></div>

    <section className={styles.section} aria-labelledby={`${component}-example`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-example`} className={styles.sectionTitle}>Пример</h2>
      </div>
      {doc.demo}
      <CodeBlock code={doc.readyCode ?? doc.adapterCode} language="tsx" copyLabels={copyLabels} />
    </section>

    <section data-knowledge className={styles.section} aria-labelledby={`${component}-layers`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-layers`} className={styles.sectionTitle}>Когда нужен другой слой</h2>
      </div>
      <div className={styles.layerExamples}>
        <div>
          <h3 className={styles.subheading}>Свои стили — адаптер</h3>
          <p className={styles.bodyText}>{doc.adapterDescription}</p>
          <div data-knowledge-exclude><CodeBlock code={doc.adapterCode} language="tsx" copyLabels={copyLabels} /></div>
        </div>
        {doc.logicCode && <div>
          <h3 id={`${component}-logic`} className={styles.subheading}>Своя разметка — логика</h3>
          <p className={styles.bodyText}>{doc.logicDescription}</p>
          <div data-knowledge-exclude><CodeBlock code={doc.logicCode} language="tsx" copyLabels={copyLabels} /></div>
        </div>}
      </div>
    </section>

    <section className={styles.section} aria-labelledby={`${component}-api`}>
      <div className={styles.sectionHeading}>
        <h2 id={`${component}-api`} className={styles.sectionTitle}>Основные свойства</h2>
      </div>
      <ApiTable component={component} label={`${doc.title} API`} rows={doc.apiRows} groups={doc.apiGroups} />
      {doc.apiGroups?.map(group => <div key={group.title} className={styles.apiGroup}>
        <h3 id={apiGroupId(component, group.title)} className={styles.subheading}>{group.title}</h3>
        <ApiTable component={component} label={group.title} rows={group.rows} groups={doc.apiGroups} />
      </div>)}
      <p data-knowledge data-knowledge-id={`${component}-api`} data-knowledge-title={`${doc.title}: примечания`} className={styles.footnote}>{doc.footnote}</p>
    </section>
    </article>
  </div>;
}
