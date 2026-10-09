import { Card } from '@dreadnought/ui/react';
import type { KnowledgeEntry } from '../knowledge/types.ts';
import { safeSourceUrl } from './context.ts';
import styles from './DocsAssistant.module.css';

export function ApiFacts({ sources }: { sources: KnowledgeEntry[] }) {
  const unique = sources.filter((source, index) => source.apiSummary
    && sources.findIndex(item => item.sourceId === source.sourceId
      && item.apiSummary === source.apiSummary) === index);
  return unique.map(source => (
    <Card key={source.id} title="Точно из каталога" size="compact">
      <p className={styles.answerText}>{source.apiSummary}</p>
      <a href={safeSourceUrl(source.url)}>Проверить API</a>
    </Card>
  ));
}
