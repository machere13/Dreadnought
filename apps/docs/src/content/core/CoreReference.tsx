import { Accordion, Breadcrumb, Card, CodeBlock, Table } from '@dreadnought/ui/react';
import { DocsShell } from '../../app/DocsShell.tsx';
import { coreTitles, type CoreSection } from '../../app/navigation.ts';
import data from '../../data/catalog/generated/catalog-docs.json';
import styles from '../../shared/Documentation.module.css';
import coreStyles from './CoreReference.module.css';

const sections = {
  actions: {
    kind: 'action',
    description: 'Действия с браузером: буфер обмена, выбор и скачивание файлов. Вызывайте из обработчика пользователя и обрабатывайте ошибки.',
  },
  behaviors: {
    kind: 'behavior',
    description: 'Переиспользуемые правила: выбор, навигация, раскрытие, история и валидация. Функции получают данные и возвращают результат; состояние и DOM остаются в приложении.',
  },
  patterns: {
    kind: 'pattern',
    description: 'Повторяющиеся взаимодействия: навигация коллекции и цикл «черновик → подтверждение / отмена». Функции вычисляют переходы; хранение состояния, события и DOM остаются в адаптере.',
  },
  domains: {
    kind: 'domain',
    description: 'Вычисления для календаря, времени, Markdown и графиков. Не зависят от React, разметки и оформления.',
  },
  components: {
    kind: 'component',
    description: 'Состояния и контракты конкретных компонентов без React и CSS. Используйте для своей разметки; общие правила ищите в Behaviors.',
  },
} as const;
const copyLabels = { copy: 'Копировать', copied: 'Скопировано', error: 'Ошибка копирования' };

type Parameter = { name: string; type: string; optional?: boolean };
type Contract = { parameters: Parameter[]; returnType: string; types?: Record<string, string> };
type Entry = {
  kind: string;
  name: string;
  family: string;
  description: string;
  constraints: string[];
  examples: { id: string; code: string }[];
  contracts: Contract[];
};

export function CoreReference({ kind }: { kind: CoreSection }) {
  const entries = (data.core as Entry[]).filter((entry) => entry.kind === sections[kind].kind);
  return (
    <article className={`${styles.article} ${coreStyles.reference}`}>
      <Breadcrumb
        items={[{ label: 'Документация', href: '/' }, { label: 'Core' }, { label: coreTitles[kind] }]}
        aria-label="Путь по документации"
      />
      <div className={styles.pageHeading}>
        <h1 className={styles.title}>{coreTitles[kind]}</h1>
        <p className={styles.lead}>{sections[kind].description}</p>
        <p className={styles.bodyText}>
          Все функции импортируются из <code>@dreadnought/core</code>.
          Для сборки своего интерфейса — <a href="/custom-components/">пошаговый пример</a>.
        </p>
      </div>
      <nav aria-label="Функции раздела">
        <ul className={styles.specimenGrid}>
          {entries.map((entry) => (
            <li key={entry.name}>
              <Card size="compact" className={styles.specimen}>
                <a href={`#${entry.name}`}><code>{entry.name}</code></a>
              </Card>
            </li>
          ))}
        </ul>
      </nav>
      {entries.map((entry) => (
        <CoreEntry key={entry.name} entry={entry} />
      ))}
    </article>
  );
}

function CoreEntry({ entry }: { entry: Entry }) {
  const types = Object.assign({}, ...entry.contracts.map((contract) => contract.types));
  return (
    <section
      id={entry.kind === 'pattern'
        ? entry.name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
        : undefined}
      data-knowledge className={styles.section} aria-labelledby={entry.name}
    >
      <h2 id={entry.name} className={styles.sectionTitle}>{entry.name}</h2>
      <p className={styles.bodyText}>{entry.description}</p>
      {entry.contracts.map((contract, index) => (
        <div key={index} className={styles.example}>
          {entry.contracts.length > 1 && <h3 className={styles.subheading}>Перегрузка {index + 1}</h3>}
          {contract.parameters.length > 0 ? (
            <div className={styles.tableScroll}>
              <Table bordered size="small" aria-label={`${entry.name}: параметры ${index + 1}`}>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell scope="col">Параметр</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Тип</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Обязательный</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {contract.parameters.map((parameter, position) => (
                    <Table.Row key={position}>
                      <Table.HeaderCell scope="row">
                        <code>{/^__\d+$/.test(parameter.name) ? 'options' : parameter.name}</code>
                      </Table.HeaderCell>
                      <Table.Cell><code>{parameter.type}</code></Table.Cell>
                      <Table.Cell>{parameter.optional ? 'Нет' : 'Да'}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          ) : <p className={styles.bodyText}>Без параметров.</p>}
          <p className={styles.bodyText}>Возвращает: <code>{contract.returnType}</code>.</p>
        </div>
      ))}
      {Object.keys(types).length > 0 && (
        <Accordion>
          <Accordion.Item value="types">
            <Accordion.Trigger headingLevel={3}>Типы параметров и результата</Accordion.Trigger>
            <Accordion.Panel>
              <CodeBlock
                language="ts"
                code={Object.entries(types).map(([name, type]) => `type ${name} = ${type};`).join('\n\n')}
                copyLabels={copyLabels}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
      {entry.examples.map((example) => (
        <CodeBlock key={example.id} language="ts" code={example.code} copyLabels={copyLabels} />
      ))}
      {entry.constraints.length > 0 && (
        <ul className={styles.bodyText}>
          {entry.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}
        </ul>
      )}
    </section>
  );
}

export function CoreReferencePage({ kind }: { kind: CoreSection }) {
  return <DocsShell section={`core-${kind}`}><CoreReference kind={kind} /></DocsShell>;
}
