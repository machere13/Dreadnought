import { Table } from '@dreadnought/ui/react';
import type { ApiGroup, ApiRow } from '../data/catalog/getCatalogDoc.ts';
import styles from './Documentation.module.css';

export function apiGroupId(component: string, title: string) {
  return `${component}-api-${title.toLowerCase()}`;
}

export function ApiTable({ component, label, rows, groups = [] }: {
  component: string;
  label: string;
  rows: readonly ApiRow[];
  groups?: readonly ApiGroup[];
}) {
  return <div className={styles.tableScroll}>
    <Table bordered className={styles.apiTable} aria-label={label}>
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell scope="col">Свойство</Table.HeaderCell>
          <Table.HeaderCell scope="col">Значения</Table.HeaderCell>
          <Table.HeaderCell scope="col">По умолчанию</Table.HeaderCell>
          <Table.HeaderCell scope="col">Назначение</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>{rows.map(([name, values, fallback, meaning]) => {
        const group = groups.find(candidate => values.includes(candidate.title));
        return <Table.Row key={name}>
          <Table.HeaderCell scope="row"><code>{name}</code></Table.HeaderCell>
          <Table.Cell>{group
            ? <a href={`#${apiGroupId(component, group.title)}`}><code>{values}</code></a>
            : <code>{values}</code>}
          </Table.Cell>
          <Table.Cell>{fallback}</Table.Cell>
          <Table.Cell>{meaning}</Table.Cell>
        </Table.Row>;
      })}</Table.Body>
    </Table>
  </div>;
}
