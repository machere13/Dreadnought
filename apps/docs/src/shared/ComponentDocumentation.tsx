import { Breadcrumb, CodeBlock } from '@dreadnought/ui/react';
import type { ComponentSection } from '../app/navigation.ts';
import type { ComponentDoc } from './types.ts';
import { PageHeading } from './PageHeading.tsx';
import { ComponentOutline } from './ComponentOutline.tsx';
import { ApiTable, apiGroupId } from './ApiTable.tsx';
import styles from './Documentation.module.css';

const copyLabels = { copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' };

export function ComponentDocumentation({
  component,
  doc,
}: {
  component: ComponentSection;
  doc: ComponentDoc;
}) {
  const primaryProps = doc.primaryProps;
  const primaryRows = primaryProps
    ? doc.apiRows.filter(([name]) => primaryProps.includes(name))
    : doc.apiRows;
  const otherRows = primaryProps
    ? doc.apiRows.filter(([name]) => !primaryProps.includes(name))
    : [];
  return (
    <div className={styles.componentPage}>
      <ComponentOutline
        key={component}
        component={component}
        examples={doc.examples}
        hasNotes={Boolean(doc.notes)}
      />
      <article className={styles.article}>
        <Breadcrumb
          items={[
            { label: 'Документация', href: '/' },
            { label: 'Компоненты' },
            { label: doc.title },
          ]}
          aria-label="Путь по документации"
        />
        <div data-knowledge id={`${component}-overview`} data-knowledge-title={doc.title}>
          <PageHeading title={doc.title} description={doc.description} />
          {doc.usage && (
            <section className={styles.example} aria-labelledby={`${component}-usage`}>
              <h2 id={`${component}-usage`} className={styles.sectionTitle}>
                Когда использовать
              </h2>
              <div className={`${styles.bodyText} ${styles.usage}`}>{doc.usage}</div>
            </section>
          )}
        </div>

        <section className={styles.section} aria-labelledby={`${component}-example`}>
          <div className={styles.sectionHeading}>
            <h2 id={`${component}-example`} className={styles.sectionTitle}>
              {doc.examples ? 'Примеры' : 'Пример'}
            </h2>
          </div>
          {doc.examples ? (
            doc.examples.map((example) => (
              <section
                key={example.id}
                className={styles.example}
                aria-labelledby={`${component}-${example.id}`}
              >
                <h3 id={`${component}-${example.id}`} className={styles.subheading}>
                  {example.title}
                </h3>
                <p className={styles.bodyText}>{example.description}</p>
                <div className={styles.demo}>{example.demo}</div>
                {example.collapseCode ? (
                  <details className={styles.disclosure}>
                    <summary>Код примера</summary>
                    <div className={styles.disclosureContent}>
                      <CodeBlock code={example.code} language="tsx" copyLabels={copyLabels} />
                    </div>
                  </details>
                ) : (
                  <CodeBlock code={example.code} language="tsx" copyLabels={copyLabels} />
                )}
              </section>
            ))
          ) : (
            <>
              {doc.demo}
              <CodeBlock
                code={doc.readyCode ?? doc.adapterCode}
                language="tsx"
                copyLabels={copyLabels}
              />
            </>
          )}
        </section>

        <section className={styles.section} aria-labelledby={`${component}-api`}>
          <div className={styles.sectionHeading}>
            <h2 id={`${component}-api`} className={styles.sectionTitle}>
              Основные свойства
            </h2>
          </div>
          <ApiTable
            component={component}
            label={`${doc.title} API`}
            rows={primaryRows}
            groups={doc.apiGroups}
          />
          {otherRows.length > 0 && (
            <details className={styles.disclosure}>
              <summary>Остальные свойства ({otherRows.length})</summary>
              <div className={styles.disclosureContent}>
                <ApiTable
                  component={component}
                  label={`${doc.title}: остальные свойства`}
                  rows={otherRows}
                  groups={doc.apiGroups}
                />
              </div>
            </details>
          )}
          {doc.apiGroups?.map((group) => (
            <div key={group.title} className={styles.apiGroup}>
              <h3 id={apiGroupId(component, group.title)} className={styles.subheading}>
                {group.title}
              </h3>
              <ApiTable
                component={component}
                label={group.title}
                rows={group.rows}
                groups={doc.apiGroups}
              />
            </div>
          ))}
          {doc.footnote && (
            <p
              data-knowledge
              data-knowledge-id={`${component}-api`}
              data-knowledge-title={`${doc.title}: примечания`}
              className={styles.footnote}
            >
              {doc.footnote}
            </p>
          )}
        </section>

        {doc.notes && (
          <section data-knowledge className={styles.section} aria-labelledby={`${component}-notes`}>
            <h2 id={`${component}-notes`} className={styles.sectionTitle}>
              Поведение и ограничения
            </h2>
            <div className={`${styles.bodyText} ${styles.notes}`}>{doc.notes}</div>
          </section>
        )}

        <section data-knowledge className={styles.section} aria-labelledby={`${component}-layers`}>
          <div className={styles.sectionHeading}>
            <h2 id={`${component}-layers`} className={styles.sectionTitle}>
              Когда нужен другой слой
            </h2>
          </div>
          <div className={styles.layerExamples}>
            <div>
              <h3 className={styles.subheading}>Свои стили — адаптер</h3>
              {doc.adapterDescription && (
                <p className={styles.bodyText}>{doc.adapterDescription}</p>
              )}
              <div data-knowledge-exclude>
                <CodeBlock code={doc.adapterCode} language="tsx" copyLabels={copyLabels} />
              </div>
            </div>
            {doc.logicCode && (
              <div>
                <h3 id={`${component}-logic`} className={styles.subheading}>
                  Своя разметка — логика
                </h3>
                {doc.logicDescription && <p className={styles.bodyText}>{doc.logicDescription}</p>}
                <div data-knowledge-exclude>
                  <CodeBlock code={doc.logicCode} language="tsx" copyLabels={copyLabels} />
                </div>
              </div>
            )}
          </div>
        </section>
      </article>
    </div>
  );
}
